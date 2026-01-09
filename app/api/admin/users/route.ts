import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withAdmin } from '@/utils/middleware'
import { paginationSchema } from '@/utils/validations'
import type { PaginatedResponse } from '@/utils/types'

// GET /api/admin/users - Panel de administración de usuarios (solo admins)
export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const queryParams = Object.fromEntries(searchParams.entries())
      
      const { page, limit } = paginationSchema.parse(queryParams)
      const searchTerm = searchParams.get('search') || ''

      // Construir filtro de búsqueda
      const where = searchTerm
        ? {
            OR: [
              { userName: { contains: searchTerm } },
              { userEmail: { contains: searchTerm } },
            ],
          }
        : {}

      // Obtener usuarios y total
      const [users, total] = await Promise.all([
        prisma.tblusuarios.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            userId: true,
            userEmail: true,
            userName: true,
            userPhotoURL: true,
            userAppVersion: true,
            userFirebaseUID: true,
            mfaEnabled: true,
            _count: {
              select: {
                tblvehiclesopinions: true,
                tbluserfavoritevehicles: true,
                tblcommunityusers: true,
                tblcommunitymessages: true,
                tblusercomparations: true,
                tbluserpreferences: true,
              },
            },
          },
          orderBy: {
            userId: 'desc',
          },
        }),
        prisma.tblusuarios.count({ where }),
      ])

      // Enriquecer datos con estadísticas
      const enrichedUsers = users.map((user) => ({
        userId: user.userId,
        email: user.userEmail,
        nombre: user.userName,
        foto: user.userPhotoURL,
        appVersion: user.userAppVersion,
        firebaseUID: user.userFirebaseUID,
        mfaHabilitado: user.mfaEnabled,
        estadisticas: {
          opiniones: user._count.tblvehiclesopinions,
          favoritos: user._count.tbluserfavoritevehicles,
          comunidades: user._count.tblcommunityusers,
          mensajes: user._count.tblcommunitymessages,
          comparaciones: user._count.tblusercomparations,
          preferencias: user._count.tbluserpreferences,
        },
      }))

      const response: PaginatedResponse<typeof enrichedUsers[0]> = {
        data: enrichedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      return successResponse(response)
    } catch (error) {
      return handleError(error)
    }
  })
}
