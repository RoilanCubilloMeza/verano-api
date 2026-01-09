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

export async function withAdmin(
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

  // Verificar si el usuario es administrador
  // Por ahora, usuarios con ID < 10 son admins (puedes cambiar esto)
  // O puedes agregar un campo userIsAdmin en la BD
  const isAdmin = user.userId <= 10 || request.headers.get('x-admin-key') === process.env.ADMIN_SECRET_KEY
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Acceso denegado. Se requieren privilegios de administrador.' },
      { status: 403 }
    )
  }

  return handler(request, user.userId)
}
