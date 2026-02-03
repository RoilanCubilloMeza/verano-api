import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'
import { uploadImage, deleteImage } from '@/utils/cloudinary'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/communities/[id] - Obtener comunidad por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    try {
      const { id } = await params
      const communityID = parseInt(id)

      if (isNaN(communityID)) {
        throw new ApiError(400, 'ID de comunidad inválido')
      }

      const community = await prisma.tblcommunities.findUnique({
        where: { communityID },
        include: {
          tblcommunityusers: {
            include: {
              tblusuarios: {
                select: {
                  userId: true,
                  userName: true,
                  userPhotoURL: true,
                },
              },
            },
          },
          _count: {
            select: {
              tblcommunitymessages: true,
            },
          },
        },
      })

      if (!community) {
        throw new ApiError(404, 'Comunidad no encontrada')
      }

      return successResponse(community)
    } catch (error) {
      return handleError(error)
    }
  })
}

// PATCH /api/communities/[id] - Actualizar comunidad (solo admin)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const communityID = parseInt(id)

      if (isNaN(communityID)) {
        throw new ApiError(400, 'ID de comunidad inválido')
      }

      // Verificar que el usuario es admin de la comunidad
      const userInCommunity = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      if (!userInCommunity || userInCommunity.commUserAdmin !== 'Y') {
        throw new ApiError(403, 'Solo el administrador puede actualizar la comunidad')
      }

      const body = await request.json()

      // Preparar datos de actualización
      const updateData: Record<string, unknown> = {}
      if (body.communityName !== undefined) updateData.communityName = body.communityName
      if (body.communityLocationLat !== undefined) updateData.communityLocationLat = body.communityLocationLat
      if (body.communityLocationLon !== undefined) updateData.communityLocationLon = body.communityLocationLon

      if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, 'No se proporcionaron campos para actualizar')
      }

      const updatedCommunity = await prisma.tblcommunities.update({
        where: { communityID },
        data: updateData,
        include: {
          _count: {
            select: {
              tblcommunityusers: true,
              tblcommunitymessages: true,
            },
          },
        },
      })

      return successResponse(updatedCommunity)
    } catch (error) {
      return handleError(error)
    }
  })
}

// PUT /api/communities/[id] - Actualizar imagen de comunidad (solo admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const communityID = parseInt(id)

      if (isNaN(communityID)) {
        throw new ApiError(400, 'ID de comunidad inválido')
      }

      // Verificar que el usuario es admin de la comunidad
      const userInCommunity = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      if (!userInCommunity || userInCommunity.commUserAdmin !== 'Y') {
        throw new ApiError(403, 'Solo el administrador puede actualizar la imagen')
      }

      // Obtener la comunidad actual para obtener la URL de la imagen anterior
      const currentCommunity = await prisma.tblcommunities.findUnique({
        where: { communityID },
        select: { communityImageURL: true },
      })

      if (!currentCommunity) {
        throw new ApiError(404, 'Comunidad no encontrada')
      }

      const formData = await request.formData()
      const imageFile = formData.get('image') as File | null

      if (!imageFile || imageFile.size === 0) {
        throw new ApiError(400, 'Se requiere una imagen')
      }

      // Subir nueva imagen a Cloudinary
      const uploadResult = await uploadImage(imageFile, 'communities')
      const newImageURL = uploadResult.url

      // Eliminar imagen anterior de Cloudinary si existe
      if (currentCommunity.communityImageURL) {
        try {
          await deleteImage(currentCommunity.communityImageURL)
        } catch (error) {
          console.error('Error al eliminar imagen anterior de Cloudinary:', error)
          // Continuar aunque falle la eliminación
        }
      }

      // Actualizar URL de imagen en la base de datos
      const updatedCommunity = await prisma.tblcommunities.update({
        where: { communityID },
        data: { communityImageURL: newImageURL },
        include: {
          _count: {
            select: {
              tblcommunityusers: true,
              tblcommunitymessages: true,
            },
          },
        },
      })

      return successResponse(updatedCommunity)
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/communities/[id] - Eliminar comunidad (solo admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const communityID = parseInt(id)

      // Verificar que el usuario es admin de la comunidad
      const userInCommunity = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      if (!userInCommunity || userInCommunity.commUserAdmin !== 'Y') {
        throw new ApiError(403, 'Solo el administrador puede eliminar la comunidad')
      }

      await prisma.tblcommunities.delete({
        where: { communityID },
      })

      return successResponse({ message: 'Comunidad eliminada correctamente' })
    } catch (error) {
      return handleError(error)
    }
  })
}
