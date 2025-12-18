import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from './auth'
import { rateLimit, rateLimitResponse } from './rate-limit'

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: number) => Promise<NextResponse>
): Promise<NextResponse> {
  // Verificar rate limiting
  if (!(await rateLimit(request))) {
    return rateLimitResponse()
  }

  // Verificar autenticación
  const user = getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado. Token inválido o ausente.' },
      { status: 401 }
    )
  }

  return handler(request, user.userId)
}

export async function withOptionalAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId?: number) => Promise<NextResponse>
): Promise<NextResponse> {
  // Verificar rate limiting
  if (!(await rateLimit(request))) {
    return rateLimitResponse()
  }

  const user = getUserFromRequest(request)
  return handler(request, user?.userId)
}
