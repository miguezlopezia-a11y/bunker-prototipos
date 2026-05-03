// File upload validation - security checks for image uploads
// Validates file type, size, and magic bytes

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// Magic bytes for file type validation
const MAGIC_BYTES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46] // RIFF
}

export function validateImageUpload(base64String, declaredMimeType) {
  const errors = []

  // Check mime type
  if (!ALLOWED_MIME_TYPES.includes(declaredMimeType)) {
    errors.push(`Tipo de archivo no permitido: ${declaredMimeType}. Solo se permiten: JPEG, PNG, WebP`)
  }

  // Decode base64 to check file size
  let binaryData
  try {
    binaryData = Buffer.from(base64String, 'base64')
  } catch (error) {
    errors.push('Formato base64 inválido')
    return { valid: false, errors }
  }

  // Check file size
  if (binaryData.length > MAX_FILE_SIZE) {
    const sizeMB = (binaryData.length / (1024 * 1024)).toFixed(2)
    errors.push(`Archivo demasiado grande: ${sizeMB} MB. Máximo: 10 MB`)
  }

  // Validate magic bytes (real file type check)
  const magicBytes = MAGIC_BYTES[declaredMimeType]
  if (magicBytes) {
    const fileMagic = Array.from(binaryData.slice(0, magicBytes.length))
    const matches = magicBytes.every((byte, idx) => byte === fileMagic[idx])
    
    if (!matches) {
      errors.push('El tipo de archivo declarado no coincide con el contenido real (posible ataque)')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sizeBytes: binaryData.length,
    sizeMB: (binaryData.length / (1024 * 1024)).toFixed(2)
  }
}

export function sanitizeFilename(filename) {
  // Remove any path traversal attempts and dangerous characters
  return filename
    .replace(/\.\.\/|\.\.\\|\/|\\/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 200) // Max 200 chars
}
