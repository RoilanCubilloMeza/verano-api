// Variables de entorno con valores por defecto seguros
export const env = {
  JWT_SECRET: (process.env.JWT_SECRET || 'change-this-secret-in-production') as string,
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '7d') as string,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  NODE_ENV: (process.env.NODE_ENV || 'development') as string,
  // Firebase Admin SDK
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT,
}

// Validar que las variables críticas estén configuradas en producción
if (env.NODE_ENV === 'production') {
  if (env.JWT_SECRET === 'change-this-secret-in-production') {
    throw new Error('JWT_SECRET debe estar configurado en producción')
  }
  if (!env.FIREBASE_PROJECT_ID && !env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('Firebase Admin SDK debe estar configurado en producción')
  }
}
