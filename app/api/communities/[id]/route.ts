import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse, ApiError } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

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
