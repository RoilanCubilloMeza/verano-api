import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse, ApiError } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/communities/[id]/join - Unirse a una comunidad
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const communityID = parseInt(id)

      // Verificar que la comunidad existe
      const community = await prisma.tblcommunities.findUnique({
        where: { communityID },
      })

      if (!community) {
        throw new ApiError(404, 'Comunidad no encontrada')
      }

      // Verificar si ya es miembro
      const existingMember = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      if (existingMember) {
        throw new ApiError(400, 'Ya eres miembro de esta comunidad')
      }

      // Unirse a la comunidad
      await prisma.tblcommunityusers.create({
        data: {
          commUserCommunityID: communityID,
          commUserUserId: authUserId,
          commUserAdmin: 'N',
        },
      })

      return successResponse({ message: 'Te has unido a la comunidad' }, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/communities/[id]/join - Salir de una comunidad
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const communityID = parseInt(id)

      // Verificar que el usuario es miembro
      const member = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      if (!member) {
        throw new ApiError(400, 'No eres miembro de esta comunidad')
      }

      // No permitir que el admin salga si es el único
      if (member.commUserAdmin === 'Y') {
        const adminCount = await prisma.tblcommunityusers.count({
          where: {
            commUserCommunityID: communityID,
            commUserAdmin: 'Y',
          },
        })

        if (adminCount === 1) {
          throw new ApiError(400, 'No puedes salir siendo el único administrador')
        }
      }

      await prisma.tblcommunityusers.delete({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      return successResponse({ message: 'Has salido de la comunidad' })
    } catch (error) {
      return handleError(error)
    }
  })
}
