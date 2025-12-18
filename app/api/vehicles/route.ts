import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/api-response'
import { withOptionalAuth } from '@/lib/middleware'
import { searchVehiclesSchema } from '@/lib/validations'
import type { PaginatedResponse } from '@/lib/types'

// GET /api/vehicles - Buscar vehículos con filtros y paginación
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const queryParams = Object.fromEntries(searchParams.entries())
      
      const {
        page,
        limit,
        brandID,
        categoryID,
        yearMin,
        yearMax,
        priceMin,
        priceMax,
        sortBy,
        sortOrder,
      } = searchVehiclesSchema.parse(queryParams)

      // Construir filtros dinámicamente
      const where: Record<string, unknown> = {}
      
      if (brandID) where.vehicleBrandID = brandID
      if (categoryID) where.vehicleCategoryID = categoryID
      
      if (yearMin || yearMax) {
        where.vehicleYear = {}
        if (yearMin) (where.vehicleYear as Record<string, unknown>).gte = yearMin
        if (yearMax) (where.vehicleYear as Record<string, unknown>).lte = yearMax
      }
      
      if (priceMin || priceMax) {
        where.vehiclePrice = {}
        if (priceMin) (where.vehiclePrice as Record<string, unknown>).gte = priceMin
        if (priceMax) (where.vehiclePrice as Record<string, unknown>).lte = priceMax
      }

      // Ordenamiento
      const orderByMap = {
        price: { vehiclePrice: sortOrder },
        year: { vehicleYear: sortOrder },
        brand: { tblvehiclebrand: { brandBrand: sortOrder } },
      }

      const orderBy = orderByMap[sortBy]

      // Ejecutar consultas en paralelo para mejor rendimiento
      const [vehicles, total] = await Promise.all([
        prisma.tblvehicles.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            tblvehiclebrand: {
              select: {
                brandID: true,
                brandBrand: true,
              },
            },
            tblvehiclemodel: {
              select: {
                modelID: true,
                modelDescription: true,
              },
            },
            tblvehicleversion: {
              select: {
                versionID: true,
                versionDescription: true,
              },
            },
            tblvehiclecategories: {
              select: {
                categoryID: true,
                categoryDescription: true,
              },
            },
            tblvehiclesopinions: {
              select: {
                opinionRate: true,
              },
            },
          },
        }),
        prisma.tblvehicles.count({ where }),
      ])

      // Calcular rating promedio para cada vehículo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vehiclesWithRating = vehicles.map((vehicle: any) => {
        const opinions = vehicle.tblvehiclesopinions
        const averageRating =
          opinions.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? opinions.reduce((sum: number, op: any) => sum + op.opinionRate, 0) / opinions.length
            : 0

        return {
          vehicleID: vehicle.vehicleID,
          vehicleYear: vehicle.vehicleYear,
          vehiclePrice: vehicle.vehiclePrice,
          brand: vehicle.tblvehiclebrand,
          model: vehicle.tblvehiclemodel,
          version: vehicle.tblvehicleversion,
          category: vehicle.tblvehiclecategories,
          averageRating: Math.round(averageRating * 10) / 10,
          opinionCount: opinions.length,
        }
      })

      const response: PaginatedResponse<typeof vehiclesWithRating[0]> = {
        data: vehiclesWithRating,
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
