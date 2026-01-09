import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withOptionalAuth } from '@/utils/middleware'
import type { PaginatedResponse } from '@/utils/types'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Schema de validación para búsqueda avanzada
const advancedSearchSchema = z.object({
  // Paginación
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  
  // Filtros básicos
  brandID: z.coerce.number().int().optional(),
  categoryID: z.coerce.number().int().optional(),
  yearMin: z.coerce.number().int().min(1900).optional(),
  yearMax: z.coerce.number().int().max(2100).optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  
  // Especificaciones técnicas - Motor
  powerHPMin: z.coerce.number().int().optional(),
  powerHPMax: z.coerce.number().int().optional(),
  displacementCCMin: z.coerce.number().int().optional(),
  displacementCCMax: z.coerce.number().int().optional(),
  maxSpeedKMHMin: z.coerce.number().int().optional(),
  maxSpeedKMHMax: z.coerce.number().int().optional(),
  fuelType: z.enum(['Gasolina', 'Diesel', 'Eléctrico', 'Híbrido', 'GLP', 'Otro']).optional(),
  
  // Especificaciones técnicas - Dimensiones
  weightKGMin: z.coerce.number().int().optional(),
  weightKGMax: z.coerce.number().int().optional(),
  passengers: z.coerce.number().int().min(1).max(9).optional(),
  groundClearanceMin: z.coerce.number().int().optional(),
  groundClearanceMax: z.coerce.number().int().optional(),
  fuelTankCapacityMin: z.coerce.number().int().optional(),
  fuelTankCapacityMax: z.coerce.number().int().optional(),
  
  // Especificaciones técnicas - Seguridad y transmisión
  safetyRatingMin: z.coerce.number().int().min(1).max(5).optional(),
  driveType: z.enum(['FWD', 'RWD', 'AWD', '4WD']).optional(),
  transmission: z.string().optional(), // Automática, Manual, CVT, etc.
  
  // Ordenamiento
  sortBy: z.enum(['price', 'year', 'popularity', 'power', 'efficiency']).default('price'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// POST /api/vehicles/advanced-search - Búsqueda avanzada por especificaciones técnicas
export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const body = await request.json()
      const params = advancedSearchSchema.parse(body)

      // Construir filtros dinámicamente
      const where: Prisma.tblvehiclesWhereInput = {}

      // Filtros básicos
      if (params.brandID) where.vehicleBrandID = params.brandID
      if (params.categoryID) where.vehicleCategoryID = params.categoryID

      // Año
      if (params.yearMin || params.yearMax) {
        where.vehicleYear = {}
        if (params.yearMin) where.vehicleYear.gte = params.yearMin
        if (params.yearMax) where.vehicleYear.lte = params.yearMax
      }

      // Precio
      if (params.priceMin || params.priceMax) {
        where.vehiclePrice = {}
        if (params.priceMin) where.vehiclePrice.gte = params.priceMin
        if (params.priceMax) where.vehiclePrice.lte = params.priceMax
      }

      // Potencia (HP)
      if (params.powerHPMin || params.powerHPMax) {
        where.vehiclePowerHP = {}
        if (params.powerHPMin) where.vehiclePowerHP.gte = params.powerHPMin
        if (params.powerHPMax) where.vehiclePowerHP.lte = params.powerHPMax
      }

      // Cilindrada (CC)
      if (params.displacementCCMin || params.displacementCCMax) {
        where.vehicleDisplacementCC = {}
        if (params.displacementCCMin) where.vehicleDisplacementCC.gte = params.displacementCCMin
        if (params.displacementCCMax) where.vehicleDisplacementCC.lte = params.displacementCCMax
      }

      // Velocidad máxima
      if (params.maxSpeedKMHMin || params.maxSpeedKMHMax) {
        where.vehicleMaxSpeedKMH = {}
        if (params.maxSpeedKMHMin) where.vehicleMaxSpeedKMH.gte = params.maxSpeedKMHMin
        if (params.maxSpeedKMHMax) where.vehicleMaxSpeedKMH.lte = params.maxSpeedKMHMax
      }

      // Tipo de combustible
      if (params.fuelType) {
        where.vehicleFuelType = params.fuelType
      }

      // Peso
      if (params.weightKGMin || params.weightKGMax) {
        where.vehicleWeightKG = {}
        if (params.weightKGMin) where.vehicleWeightKG.gte = params.weightKGMin
        if (params.weightKGMax) where.vehicleWeightKG.lte = params.weightKGMax
      }

      // Pasajeros
      if (params.passengers) {
        where.vehiclePassengers = params.passengers
      }

      // Altura libre del suelo
      if (params.groundClearanceMin || params.groundClearanceMax) {
        where.vehicleGroundClearance = {}
        if (params.groundClearanceMin) where.vehicleGroundClearance.gte = params.groundClearanceMin
        if (params.groundClearanceMax) where.vehicleGroundClearance.lte = params.groundClearanceMax
      }

      // Capacidad del tanque
      if (params.fuelTankCapacityMin || params.fuelTankCapacityMax) {
        where.vehicleFuelTankCapacity = {}
        if (params.fuelTankCapacityMin) where.vehicleFuelTankCapacity.gte = params.fuelTankCapacityMin
        if (params.fuelTankCapacityMax) where.vehicleFuelTankCapacity.lte = params.fuelTankCapacityMax
      }

      // Calificación de seguridad
      if (params.safetyRatingMin) {
        where.vehicleSafetyRating = { gte: params.safetyRatingMin }
      }

      // Tipo de tracción
      if (params.driveType) {
        where.vehicleDriveType = params.driveType
      }

      // Transmisión
      if (params.transmission) {
        where.vehicleTransmission = { contains: params.transmission }
      }

      // Ordenamiento
      const orderByMap: Record<string, Prisma.tblvehiclesOrderByWithRelationInput> = {
        price: { vehiclePrice: params.sortOrder },
        year: { vehicleYear: params.sortOrder },
        popularity: { tblvehiclesopinions: { _count: params.sortOrder } },
        power: { vehiclePowerHP: params.sortOrder },
        efficiency: { vehicleFuelConsumption: params.sortOrder === 'asc' ? 'asc' : 'desc' },
      }

      const orderBy = orderByMap[params.sortBy] || { vehiclePrice: params.sortOrder }

      // Ejecutar consulta
      const [vehicles, total] = await Promise.all([
        prisma.tblvehicles.findMany({
          where,
          skip: (params.page - 1) * params.limit,
          take: params.limit,
          orderBy,
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
              },
            },
          },
        }),
        prisma.tblvehicles.count({ where }),
      ])

      // Formatear respuesta con especificaciones técnicas
      const formattedVehicles = vehicles.map((vehicle) => ({
        vehicleID: vehicle.vehicleID,
        marca: vehicle.tblvehiclebrand.brandBrand,
        modelo: vehicle.tblvehiclemodel.modelDescription,
        version: vehicle.tblvehicleversion.versionDescription,
        categoria: vehicle.tblvehiclecategories.categoryDescription,
        año: vehicle.vehicleYear,
        precio: vehicle.vehiclePrice,
        imagen: vehicle.vehicleImageURL,
        totalOpiniones: vehicle._count.tblvehiclesopinions,
        specs: {
          motor: {
            potenciaHP: vehicle.vehiclePowerHP,
            cilindradaCC: vehicle.vehicleDisplacementCC,
            velocidadMaxKMH: vehicle.vehicleMaxSpeedKMH,
            consumoCombustible: vehicle.vehicleFuelConsumption ? Number(vehicle.vehicleFuelConsumption) : null,
            tipoCombustible: vehicle.vehicleFuelType,
          },
          dimensiones: {
            pesoKG: vehicle.vehicleWeightKG,
            pasajeros: vehicle.vehiclePassengers,
            alturaLibreMM: vehicle.vehicleGroundClearance,
            capacidadTanqueL: vehicle.vehicleFuelTankCapacity,
          },
          seguridadTransmision: {
            calificacionSeguridad: vehicle.vehicleSafetyRating,
            tipoTraccion: vehicle.vehicleDriveType,
            transmision: vehicle.vehicleTransmission,
            suspension: vehicle.vehicleSuspension,
          },
        },
      }))

      const response: PaginatedResponse<typeof formattedVehicles[0]> = {
        data: formattedVehicles,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit),
        },
      }

      return successResponse(response)
    } catch (error) {
      return handleError(error)
    }
  })
}
