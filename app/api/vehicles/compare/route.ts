import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'

// GET /api/vehicles/compare?ids=1,2 - Comparar dos vehículos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      throw new ApiError(400, 'Se requieren los IDs de los vehículos a comparar')
    }

    const ids = idsParam.split(',').map((id) => parseInt(id.trim()))

    if (ids.length !== 2) {
      throw new ApiError(400, 'Debes proporcionar exactamente 2 vehículos para comparar')
    }

    if (ids.some((id) => isNaN(id))) {
      throw new ApiError(400, 'IDs de vehículos inválidos')
    }

    // Obtener información completa de ambos vehículos
    const vehicles = await prisma.tblvehicles.findMany({
      where: {
        vehicleID: {
          in: ids,
        },
      },
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
        _count: {
          select: {
            tblvehiclesopinions: true,
            tbluserfavoritevehicles: true,
          },
        },
      },
    })

    if (vehicles.length !== 2) {
      throw new ApiError(404, 'Uno o ambos vehículos no fueron encontrados')
    }

    // Asegurar el orden según los IDs proporcionados
    const orderedVehicles = ids.map((id) => vehicles.find((v) => v.vehicleID === id))

    // Obtener opiniones promedio de cada vehículo
    const [vehicle1Opinions, vehicle2Opinions] = await Promise.all([
      prisma.tblvehiclesopinions.aggregate({
        where: { opinionVehicleID: orderedVehicles[0]!.vehicleID },
        _avg: { opinionRate: true },
        _count: true,
      }),
      prisma.tblvehiclesopinions.aggregate({
        where: { opinionVehicleID: orderedVehicles[1]!.vehicleID },
        _avg: { opinionRate: true },
        _count: true,
      }),
    ])

    // Formatear datos para comparación
    const comparison = {
      vehicle1: {
        id: orderedVehicles[0]!.vehicleID,
        brand: orderedVehicles[0]!.tblvehiclebrand.brandBrand,
        model: orderedVehicles[0]!.tblvehiclemodel.modelDescription,
        version: orderedVehicles[0]!.tblvehicleversion.versionDescription,
        year: orderedVehicles[0]!.vehicleYear,
        price: orderedVehicles[0]!.vehiclePrice,
        category: orderedVehicles[0]!.tblvehiclecategories.categoryDescription,
        image: orderedVehicles[0]!.vehicleImageURL,
        pdf: orderedVehicles[0]!.vehiclePDFURL,
        averageRating: vehicle1Opinions._avg.opinionRate || 0,
        totalOpinions: vehicle1Opinions._count,
        totalFavorites: orderedVehicles[0]!._count.tbluserfavoritevehicles,
      },
      vehicle2: {
        id: orderedVehicles[1]!.vehicleID,
        brand: orderedVehicles[1]!.tblvehiclebrand.brandBrand,
        model: orderedVehicles[1]!.tblvehiclemodel.modelDescription,
        version: orderedVehicles[1]!.tblvehicleversion.versionDescription,
        year: orderedVehicles[1]!.vehicleYear,
        price: orderedVehicles[1]!.vehiclePrice,
        category: orderedVehicles[1]!.tblvehiclecategories.categoryDescription,
        image: orderedVehicles[1]!.vehicleImageURL,
        pdf: orderedVehicles[1]!.vehiclePDFURL,
        averageRating: vehicle2Opinions._avg.opinionRate || 0,
        totalOpinions: vehicle2Opinions._count,
        totalFavorites: orderedVehicles[1]!._count.tbluserfavoritevehicles,
      },
      differences: {
        priceDifference: Math.abs(orderedVehicles[0]!.vehiclePrice - orderedVehicles[1]!.vehiclePrice),
        cheaperVehicle: orderedVehicles[0]!.vehiclePrice < orderedVehicles[1]!.vehiclePrice ? 'vehicle1' : 'vehicle2',
        yearDifference: Math.abs(orderedVehicles[0]!.vehicleYear - orderedVehicles[1]!.vehicleYear),
        newerVehicle: orderedVehicles[0]!.vehicleYear > orderedVehicles[1]!.vehicleYear ? 'vehicle1' : 'vehicle2',
        ratingDifference: Math.abs(
          (vehicle1Opinions._avg.opinionRate || 0) - (vehicle2Opinions._avg.opinionRate || 0)
        ),
        betterRated: (vehicle1Opinions._avg.opinionRate || 0) > (vehicle2Opinions._avg.opinionRate || 0) 
          ? 'vehicle1' 
          : 'vehicle2',
      },
    }

    return successResponse(comparison)
  } catch (error) {
    return handleError(error)
  }
}
