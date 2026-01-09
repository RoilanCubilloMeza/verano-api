import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'
import { uploadImage } from '@/utils/cloudinary'

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

      // Obtener datos del formulario
      const formData = await request.formData()
      const updateData: Record<string, string> = {}

      // Procesar campos de texto
      const name = formData.get('userName')
      if (name) updateData.userName = name.toString()

      // Procesar foto de perfil si se envió
      const photoFile = formData.get('photo') as File | null
      if (photoFile && photoFile.size > 0) {
        try {
          // Subir imagen a Cloudinary
          const { url } = await uploadImage(photoFile, 'users/profiles')
          updateData.userPhotoURL = url
        } catch {
          throw new ApiError(400, 'Error al subir la foto de perfil')
        }
      }

      // Si no hay datos para actualizar
      if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, 'No se proporcionaron datos para actualizar')
      }

      // Actualizar usuario
      const user = await prisma.tblusuarios.update({
        where: { userId },
        data: updateData,
      })

      return successResponse({
        userId: user.userId,
        email: user.userEmail,
        name: user.userName,
        photoURL: user.userPhotoURL,
      })
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
