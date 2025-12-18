import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse, ApiError } from '@/lib/api-response'
import { withOptionalAuth } from '@/lib/middleware'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/vehicles/[id] - Obtener vehículo por ID con todos sus detalles
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withOptionalAuth(request, async () => {
    try {
      const { id } = await params
      const vehicleID = parseInt(id)

      if (isNaN(vehicleID)) {
        throw new ApiError(400, 'ID de vehículo inválido')
      }

      const vehicle = await prisma.tblvehicles.findUnique({
        where: { vehicleID },
        include: {
          tblvehiclebrand: true,
          tblvehiclemodel: true,
          tblvehicleversion: true,
          tblvehiclecategories: true,
          tblvehiclesopinions: {
            include: {
              tblusuarios: {
                select: {
                  userId: true,
                  userName: true,
                  userPhotoURL: true,
                },
              },
            },
            orderBy: {
              opinionDate: 'desc',
            },
          },
        },
      })

      if (!vehicle) {
        throw new ApiError(404, 'Vehículo no encontrado')
      }

      // Calcular estadísticas
      const opinions = vehicle.tblvehiclesopinions
      const averageRating =
        opinions.length > 0
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? opinions.reduce((sum: number, op: any) => sum + op.opinionRate, 0) / opinions.length
          : 0

      const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        count: opinions.filter((op: any) => op.opinionRate === rating).length,
      }))

      return successResponse({
        ...vehicle,
        stats: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalOpinions: opinions.length,
          ratingDistribution,
        },
      })
    } catch (error) {
      return handleError(error)
    }
  })
}
