import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'

// GET /api/vehicles/search - Búsqueda rápida para autocompletado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      throw new ApiError(400, 'La búsqueda debe tener al menos 2 caracteres')
    }

    // Buscar en marca, modelo, versión y descripción
    const vehicles = await prisma.tblvehicles.findMany({
      where: {
        OR: [
          {
            tblvehiclebrand: {
              brandBrand: {
                contains: query,
              },
            },
          },
          {
            tblvehiclemodel: {
              modelDescription: {
                contains: query,
              },
            },
          },
          {
            tblvehicleversion: {
              versionDescription: {
                contains: query,
              },
            },
          },
        ],
      },
      take: limit,
      select: {
        vehicleID: true,
        vehicleYear: true,
        vehiclePrice: true,
        vehicleImageURL: true,
        tblvehiclebrand: {
          select: {
            brandBrand: true,
          },
        },
        tblvehiclemodel: {
          select: {
            modelDescription: true,
          },
        },
        tblvehicleversion: {
          select: {
            versionDescription: true,
          },
        },
        tblvehiclecategories: {
          select: {
            categoryDescription: true,
          },
        },
      },
      orderBy: [
        { tblvehiclebrand: { brandBrand: 'asc' } },
        { tblvehiclemodel: { modelDescription: 'asc' } },
        { vehicleYear: 'desc' },
      ],
    })

    // Formatear resultados para autocompletado
    const results = vehicles.map((v) => ({
      id: v.vehicleID,
      label: `${v.tblvehiclebrand.brandBrand} ${v.tblvehiclemodel.modelDescription} ${v.tblvehicleversion.versionDescription} (${v.vehicleYear})`,
      brand: v.tblvehiclebrand.brandBrand,
      model: v.tblvehiclemodel.modelDescription,
      version: v.tblvehicleversion.versionDescription,
      year: v.vehicleYear,
      price: v.vehiclePrice,
      image: v.vehicleImageURL,
      category: v.tblvehiclecategories.categoryDescription,
    }))

    return successResponse(results)
  } catch (error) {
    return handleError(error)
  }
}
