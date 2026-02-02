import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/users/[id]/communities/available - Obtener comunidades disponibles (no unido) con paginación
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    try {
      const { id } = await params
      const userIdNum = parseInt(id)
      
      // Obtener parámetros de paginación
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = 5 // Límite fijo de 5 comunidades por página
      const skip = (page - 1) * limit

      // Obtener IDs de comunidades en las que ya está el usuario
      const userCommunities = await prisma.tblcommunityusers.findMany({
        where: { commUserUserId: userIdNum },
        select: { commUserCommunityID: true },
      })

      const joinedCommunityIds = userCommunities.map(uc => uc.commUserCommunityID)

      // Obtener comunidades disponibles (no unido) con paginación
      const [availableCommunities, total] = await Promise.all([
        prisma.tblcommunities.findMany({
          where: {
            communityID: {
              notIn: joinedCommunityIds.length > 0 ? joinedCommunityIds : undefined,
            },
          },
          skip,
          take: limit,
          select: {
            communityID: true,
            communityName: true,
            communityLocationLat: true,
            communityLocationLon: true,
            communityImageURL: true,
            _count: {
              select: {
                tblcommunityusers: true, // Total de miembros
                tblcommunitymessages: true, // Total de mensajes
              },
            },
          },
          orderBy: [
            {
              tblcommunityusers: {
                _count: 'desc', // Ordenar por más populares primero
              },
            },
            {
              communityID: 'desc',
            },
          ],
        }),
        prisma.tblcommunities.count({
          where: {
            communityID: {
              notIn: joinedCommunityIds.length > 0 ? joinedCommunityIds : undefined,
            },
          },
        }),
      ])

      // Formatear respuesta
      const formattedCommunities = availableCommunities.map(community => ({
        communityID: community.communityID,
        nombre: community.communityName,
        imagen: community.communityImageURL,
        ubicacion: {
          latitud: community.communityLocationLat,
          longitud: community.communityLocationLon,
        },
        estadisticas: {
          totalMiembros: community._count.tblcommunityusers,
          totalMensajes: community._count.tblcommunitymessages,
        },
      }))

      return successResponse({
        data: formattedCommunities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      return handleError(error)
    }
  })
}
