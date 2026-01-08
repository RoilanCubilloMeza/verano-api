import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withOptionalAuth } from '@/utils/middleware'

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
        imageUrl: vehicle.vehicleImageURL,
        pdfUrl: vehicle.vehiclePDFURL,
        // Especificaciones técnicas
        specs: {
          powerHP: vehicle.vehiclePowerHP,
          displacementCC: vehicle.vehicleDisplacementCC,
          maxSpeedKMH: vehicle.vehicleMaxSpeedKMH,
          fuelConsumption: vehicle.vehicleFuelConsumption,
          fuelType: vehicle.vehicleFuelType,
          weightKG: vehicle.vehicleWeightKG,
          passengers: vehicle.vehiclePassengers,
          groundClearance: vehicle.vehicleGroundClearance,
          fuelTankCapacity: vehicle.vehicleFuelTankCapacity,
          safetyRating: vehicle.vehicleSafetyRating,
          driveType: vehicle.vehicleDriveType,
          transmission: vehicle.vehicleTransmission,
          suspension: vehicle.vehicleSuspension,
          specsExtracted: vehicle.vehicleSpecsExtracted,
          specsUpdatedAt: vehicle.vehicleSpecsUpdatedAt,
        },
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

// PATCH /api/vehicles/[id] - Actualizar especificaciones del vehículo
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withOptionalAuth(request, async () => {
    try {
      const { id } = await params
      const vehicleID = parseInt(id)

      if (isNaN(vehicleID)) {
        throw new ApiError(400, 'ID de vehículo inválido')
      }

      const body = await request.json()

      // Verificar que el vehículo existe
      const existingVehicle = await prisma.tblvehicles.findUnique({
        where: { vehicleID },
      })

      if (!existingVehicle) {
        throw new ApiError(404, 'Vehículo no encontrado')
      }

      // Preparar datos de actualización
      const updateData: Record<string, unknown> = {}

      // Campos básicos
      if (body.vehicleYear !== undefined) updateData.vehicleYear = body.vehicleYear
      if (body.vehiclePrice !== undefined) updateData.vehiclePrice = body.vehiclePrice

      // Especificaciones técnicas
      if (body.vehiclePowerHP !== undefined) updateData.vehiclePowerHP = body.vehiclePowerHP
      if (body.vehicleDisplacementCC !== undefined) updateData.vehicleDisplacementCC = body.vehicleDisplacementCC
      if (body.vehicleMaxSpeedKMH !== undefined) updateData.vehicleMaxSpeedKMH = body.vehicleMaxSpeedKMH
      if (body.vehicleFuelConsumption !== undefined) updateData.vehicleFuelConsumption = body.vehicleFuelConsumption
      if (body.vehicleFuelType !== undefined) updateData.vehicleFuelType = body.vehicleFuelType
      if (body.vehicleWeightKG !== undefined) updateData.vehicleWeightKG = body.vehicleWeightKG
      if (body.vehiclePassengers !== undefined) updateData.vehiclePassengers = body.vehiclePassengers
      if (body.vehicleGroundClearance !== undefined) updateData.vehicleGroundClearance = body.vehicleGroundClearance
      if (body.vehicleFuelTankCapacity !== undefined) updateData.vehicleFuelTankCapacity = body.vehicleFuelTankCapacity
      if (body.vehicleSafetyRating !== undefined) updateData.vehicleSafetyRating = body.vehicleSafetyRating
      if (body.vehicleDriveType !== undefined) updateData.vehicleDriveType = body.vehicleDriveType
      if (body.vehicleTransmission !== undefined) updateData.vehicleTransmission = body.vehicleTransmission
      if (body.vehicleSuspension !== undefined) updateData.vehicleSuspension = body.vehicleSuspension

      // Marcar como especificaciones extraídas si se está actualizando alguna spec
      const hasSpecs = Object.keys(updateData).some(key => key.startsWith('vehicle') && key !== 'vehicleYear' && key !== 'vehiclePrice')
      if (hasSpecs) {
        updateData.vehicleSpecsExtracted = true
      }

      // Actualizar el vehículo
      const updatedVehicle = await prisma.tblvehicles.update({
        where: { vehicleID },
        data: updateData,
        include: {
          tblvehiclebrand: true,
          tblvehiclemodel: true,
          tblvehicleversion: true,
          tblvehiclecategories: true,
        }
      })

      return successResponse({
        ...updatedVehicle,
        imageUrl: updatedVehicle.vehicleImageURL,
        pdfUrl: updatedVehicle.vehiclePDFURL,
      })
    } catch (error) {
      return handleError(error)
    }
  })
}