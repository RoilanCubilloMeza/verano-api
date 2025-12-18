import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitiza texto para prevenir XSS
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

/**
 * Sanitiza un objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T]
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value as T[keyof T]
    }
  }

  return sanitized
}

/**
 * Valida y limita el tamaño de archivos
 */
export function validateFileSize(sizeInBytes: number, maxSizeMB = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return sizeInBytes <= maxSizeBytes
}

/**
 * Valida tipos de archivo permitidos
 */
export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType)
}
