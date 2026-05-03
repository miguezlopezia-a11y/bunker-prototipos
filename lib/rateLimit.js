// Rate limiting middleware for API routes
// Prevents abuse by limiting requests per IP/user

const rateLimits = new Map()

const RATE_LIMIT_CONFIG = {
  '/api/grade': { max: 30, window: 60 * 60 * 1000 }, // 30 exams per hour
  '/api/save-result': { max: 100, window: 60 * 60 * 1000 }, // 100 saves per hour
  default: { max: 200, window: 60 * 60 * 1000 } // 200 requests per hour
}

export function rateLimit(path, identifier) {
  const config = RATE_LIMIT_CONFIG[path] || RATE_LIMIT_CONFIG.default
  const key = `${path}:${identifier}`
  const now = Date.now()

  // Get or create rate limit entry
  let entry = rateLimits.get(key)

  if (!entry) {
    entry = { count: 0, resetAt: now + config.window }
    rateLimits.set(key, entry)
  }

  // Reset if window has passed
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + config.window
  }

  // Increment and check
  entry.count++

  if (entry.count > config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetAt - now) / 1000)
    }
  }

  return {
    allowed: true,
    remaining: config.max - entry.count,
    resetIn: Math.ceil((entry.resetAt - now) / 1000)
  }
}

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetAt + 3600000) { // 1 hour buffer
      rateLimits.delete(key)
    }
  }
}, 3600000) // Run every hour
