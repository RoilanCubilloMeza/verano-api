import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/users/[id]/communities - Obtener comunidades del usuario con paginación
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

      // Obtener comunidades del usuario con paginación
      const [userCommunities, total] = await Promise.all([
        prisma.tblcommunityusers.findMany({
          where: { commUserUserId: userIdNum },
          skip,
          take: limit,
          select: {
            commUserAdmin: true,
            tblcommunities: {
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
            },
          },
          orderBy: {
            commUserCommunityID: 'desc',
          },
        }),
        prisma.tblcommunityusers.count({
          where: { commUserUserId: userIdNum },
        }),
      ])

      // Formatear respuesta
      const formattedCommunities = userCommunities.map(uc => ({
        communityID: uc.tblcommunities.communityID,
        nombre: uc.tblcommunities.communityName,
        imagen: uc.tblcommunities.communityImageURL,
        ubicacion: {
          latitud: uc.tblcommunities.communityLocationLat,
          longitud: uc.tblcommunities.communityLocationLon,
        },
        esAdmin: uc.commUserAdmin === 'S' || uc.commUserAdmin === '1',
        estadisticas: {
          totalMiembros: uc.tblcommunities._count.tblcommunityusers,
          totalMensajes: uc.tblcommunities._count.tblcommunitymessages,
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

// POST /api/users/[id]/communities - Unirse a una comunidad
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const userIdNum = parseInt(id)
      const body = await request.json()
      const { communityID } = body

      // Verificar que el usuario solo pueda unirse a comunidades para sí mismo
      if (userIdNum !== authUserId) {
        return successResponse({ error: 'No autorizado' }, 403)
      }

      // Verificar que la comunidad existe
      const community = await prisma.tblcommunities.findUnique({
        where: { communityID },
      })

      if (!community) {
        return successResponse({ error: 'Comunidad no encontrada' }, 404)
      }

      // Verificar si ya está en la comunidad
      const existing = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: userIdNum,
          },
        },
      })

      if (existing) {
        return successResponse({ error: 'Ya eres miembro de esta comunidad' }, 400)
      }

      // Unirse a la comunidad (no admin por defecto)
      await prisma.tblcommunityusers.create({
        data: {
          commUserCommunityID: communityID,
          commUserUserId: userIdNum,
          commUserAdmin: 'N',
        },
      })

      return successResponse({ message: 'Te has unido a la comunidad exitosamente' }, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/users/[id]/communities - Salir de una comunidad
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const userIdNum = parseInt(id)
      const { searchParams } = new URL(request.url)
      const communityID = parseInt(searchParams.get('communityID') || '0')

      if (userIdNum !== authUserId) {
        return successResponse({ error: 'No autorizado' }, 403)
      }

      if (!communityID) {
        return successResponse({ error: 'ID de comunidad requerido' }, 400)
      }

      // Eliminar la relación usuario-comunidad
      await prisma.tblcommunityusers.delete({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: userIdNum,
          },
        },
      })

      return successResponse({ message: 'Has salido de la comunidad exitosamente' })
    } catch (error) {
      return handleError(error)
    }
  })
}
