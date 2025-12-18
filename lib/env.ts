// Variables de entorno con valores por defecto seguros
export const env = {
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

// Validar que las variables críticas estén configuradas en producción
if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'change-this-secret-in-production') {
  throw new Error('JWT_SECRET debe estar configurado en producción')
}
