import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'
import { updateUserSchema } from '@/utils/validations'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/users/[id] - Obtener usuario por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    try {
      const { id } = await params
      const userId = parseInt(id)

      if (isNaN(userId)) {
        throw new ApiError(400, 'ID de usuario inválido')
      }

      const user = await prisma.tblusuarios.findUnique({
        where: { userId },
        include: {
          tbluserpreferences: {
            include: {
              tblvehiclebrand: true,
              tblvehiclecategories: true,
            },
          },
          _count: {
            select: {
              tblvehiclesopinions: true,
              tbluserfavoritevehicles: true,
              tblusercomparations: true,
              tblcommunityusers: true,
            },
          },
        },
      })

      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado')
      }

      return successResponse(user)
    } catch (error) {
      return handleError(error)
    }
  })
}

// PATCH /api/users/[id] - Actualizar usuario
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const userId = parseInt(id)

      if (isNaN(userId)) {
        throw new ApiError(400, 'ID de usuario inválido')
      }

      // Verificar que el usuario solo pueda actualizar su propio perfil
      if (userId !== authUserId) {
        throw new ApiError(403, 'No tienes permiso para actualizar este usuario')
      }

      const body = await request.json()
      const validated = updateUserSchema.parse(body)

      const user = await prisma.tblusuarios.update({
        where: { userId },
        data: validated,
      })

      return successResponse(user)
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const userId = parseInt(id)

      if (isNaN(userId)) {
        throw new ApiError(400, 'ID de usuario inválido')
      }

      // Verificar que el usuario solo pueda eliminar su propio perfil
      if (userId !== authUserId) {
        throw new ApiError(403, 'No tienes permiso para eliminar este usuario')
      }

      await prisma.tblusuarios.delete({
        where: { userId },
      })

      return successResponse({ message: 'Usuario eliminado correctamente' })
    } catch (error) {
      return handleError(error)
    }
  })
}
