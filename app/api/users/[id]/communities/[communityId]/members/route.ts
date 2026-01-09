import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

interface RouteParams {
  params: Promise<{ id: string; communityId: string }>
}

// GET /api/users/[id]/communities/[communityId]/members - Obtener miembros de la comunidad
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    try {
      const { id, communityId } = await params
      const userIdNum = parseInt(id)
      const communityID = parseInt(communityId)

      if (isNaN(communityID)) {
        throw new ApiError(400, 'ID de comunidad inválido')
      }

      // Verificar que el usuario pertenece a la comunidad
      const isMember = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: userIdNum,
          },
        },
      })

      if (!isMember) {
        throw new ApiError(403, 'No eres miembro de esta comunidad')
      }

      // Obtener todos los miembros de la comunidad
      const members = await prisma.tblcommunityusers.findMany({
        where: { commUserCommunityID: communityID },
        select: {
          commUserAdmin: true,
          tblusuarios: {
            select: {
              userId: true,
              userName: true,
              userPhotoURL: true,
            },
          },
        },
        orderBy: [
          {
            commUserAdmin: 'desc', // Admins primero
          },
          {
            commUserUserId: 'asc',
          },
        ],
      })

      // Formatear respuesta
      const formattedMembers = members.map(member => ({
        id: member.tblusuarios.userId,
        nombre: member.tblusuarios.userName,
        foto: member.tblusuarios.userPhotoURL,
        esAdmin: member.commUserAdmin === 'S' || member.commUserAdmin === '1',
      }))

      return successResponse({
        data: formattedMembers,
        total: formattedMembers.length,
      })
    } catch (error) {
      return handleError(error)
    }
  })
}
