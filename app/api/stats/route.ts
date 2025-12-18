import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

// GET /api/stats - Obtener estadísticas generales
export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      // Ejecutar todas las consultas en paralelo para máxima eficiencia
      const [
        totalVehicles,
        totalUsers,
        totalOpinions,
        totalCommunities,
        avgPrice,
        topBrands,
        recentOpinions,
      ] = await Promise.all([
        // Total de vehículos
        prisma.tblvehicles.count(),
        
        // Total de usuarios
        prisma.tblusuarios.count(),
        
        // Total de opiniones
        prisma.tblvehiclesopinions.count(),
        
        // Total de comunidades
        prisma.tblcommunities.count(),
        
        // Precio promedio de vehículos
        prisma.tblvehicles.aggregate({
          _avg: { vehiclePrice: true },
          _min: { vehiclePrice: true },
          _max: { vehiclePrice: true },
        }),
        
        // Marcas más populares (top 5)
        prisma.tblvehiclebrand.findMany({
          take: 5,
          include: {
            _count: {
              select: { tblvehicles: true },
            },
          },
          orderBy: {
            tblvehicles: {
              _count: 'desc',
            },
          },
        }),
        
        // Opiniones recientes
        prisma.tblvehiclesopinions.findMany({
          take: 5,
          orderBy: { opinionDate: 'desc' },
          include: {
            tblusuarios: {
              select: {
                userName: true,
                userPhotoURL: true,
              },
            },
            tblvehicles: {
              select: {
                vehicleID: true,
                tblvehiclebrand: {
                  select: { brandBrand: true },
                },
                tblvehiclemodel: {
                  select: { modelDescription: true },
                },
              },
            },
          },
        }),
      ])

      return successResponse({
        totals: {
          vehicles: totalVehicles,
          users: totalUsers,
          opinions: totalOpinions,
          communities: totalCommunities,
        },
        prices: {
          average: Math.round(avgPrice._avg.vehiclePrice || 0),
          min: avgPrice._min.vehiclePrice || 0,
          max: avgPrice._max.vehiclePrice || 0,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        topBrands: topBrands.map((brand: any) => ({
          brandID: brand.brandID,
          brandBrand: brand.brandBrand,
          vehicleCount: brand._count.tblvehicles,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recentOpinions: recentOpinions.map((opinion: any) => ({
          opinionID: opinion.opinionID,
          opinionRate: opinion.opinionRate,
          opinionComment: opinion.opinionComment,
          opinionDate: opinion.opinionDate,
          user: opinion.tblusuarios,
          vehicle: {
            id: opinion.tblvehicles.vehicleID,
            brand: opinion.tblvehicles.tblvehiclebrand.brandBrand,
            model: opinion.tblvehicles.tblvehiclemodel.modelDescription,
          },
        })),
      })
    } catch (error) {
      return handleError(error)
    }
  })
}
