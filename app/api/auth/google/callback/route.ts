import { NextRequest } from 'next/server'
import { successResponse } from '@/utils/api-response'

/**
 * GET /api/auth/google/callback - Endpoint de callback de Google OAuth
 * Nota: Este endpoint no es necesario para el flujo de Google Sign-In con JavaScript,
 * pero se incluye para evitar errores 404 y por si se necesita en el futuro.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return Response.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (code) {
    // En un flujo OAuth tradicional, aquí intercambiarías el código por tokens
    // Pero con Google Sign-In JavaScript, este flujo no se usa
    return Response.redirect(new URL('/?status=oauth_code_received', request.url))
  }

  return successResponse({
    message: 'Callback endpoint. Use Google Sign-In button para autenticación.'
  })
}
