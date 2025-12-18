import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/api-response'
import { withAuth, withOptionalAuth } from '@/lib/middleware'
import { createUserSchema } from '@/lib/validations'
import { generateToken } from '@/lib/auth'

// GET /api/users - Obtener todos los usuarios (requiere auth)
export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const users = await prisma.tblusuarios.findMany({
        select: {
          userId: true,
          userEmail: true,
          userName: true,
          userPhotoURL: true,
          userAppVersion: true,
          _count: {
            select: {
              tblvehiclesopinions: true,
              tbluserfavoritevehicles: true,
              tblcommunityusers: true,
            },
          },
        },
      })

      return successResponse(users)
    } catch (error) {
      return handleError(error)
    }
  })
}

// POST /api/users - Crear nuevo usuario
export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const body = await request.json()
      const validated = createUserSchema.parse(body)

      const user = await prisma.tblusuarios.create({
        data: validated,
      })

      // Generar token JWT
      const token = generateToken({
        userId: user.userId,
        email: user.userEmail,
        firebaseUID: user.userFirebaseUID,
      })

      return successResponse({ user, token }, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}
