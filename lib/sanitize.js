// Input sanitization utilities
// Prevents XSS and prompt injection attacks

export function sanitizeHTML(input) {
  if (typeof input !== 'string') return input
  
  // Remove all HTML tags
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
}

export function sanitizePromptInjection(input) {
  if (typeof input !== 'string') return input
  
  // Detect and neutralize prompt injection attempts
  const dangerousPatterns = [
    /ignore (previous|above|all) (instructions|prompts)/gi,
    /disregard (previous|above|all)/gi,
    /forget (everything|all|previous)/gi,
    /you are now/gi,
    /new instructions:/gi,
    /system:?\s*$/gi,
    /assistant:?\s*$/gi,
  ]

  let sanitized = input
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '[CONTENIDO FILTRADO]')
  }

  return sanitized
}

export function sanitizeStudentData(data) {
  return {
    studentName: data.studentName ? sanitizeHTML(data.studentName).slice(0, 200) : null,
    studentGroup: data.studentGroup ? sanitizeHTML(data.studentGroup).slice(0, 100) : null,
    subject: sanitizeHTML(data.subject || '').slice(0, 100),
    gradeLevel: sanitizeHTML(data.gradeLevel || '').slice(0, 100),
    rubric: data.rubric ? sanitizePromptInjection(sanitizeHTML(data.rubric)).slice(0, 5000) : null
  }
}
