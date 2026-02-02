import { NextRequest } from 'next/server'
import { successResponse } from '@/utils/api-response'

/**
 * GET /api/auth/google/config - Obtener configuración pública de Google OAuth
 */
export async function GET(request: NextRequest) {
  return successResponse({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  })
}
