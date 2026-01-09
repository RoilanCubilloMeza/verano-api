import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

interface RouteParams {
  params: Promise<{ id: string; vehicleId: string }>
}

// GET /api/users/[id]/favorites/[vehicleId] - Obtener detalles completos de un vehículo favorito
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    try {
      const { id, vehicleId } = await params
      const userIdNum = parseInt(id)
      const vehicleID = parseInt(vehicleId)

      if (isNaN(vehicleID)) {
        throw new ApiError(400, 'ID de vehículo inválido')
      }

      // Verificar que el usuario tenga favoritos
      const favorite = await prisma.tbluserfavoritevehicles.findFirst({
        where: { userId: userIdNum },
      })

      if (!favorite) {
        throw new ApiError(404, 'No tienes vehículos en favoritos')
      }

      // Obtener el vehículo completo
      const vehicle = await prisma.tblvehicles.findFirst({
        where: {
          vehicleID,
          favoriteID: favorite.favoriteID, // Verificar que esté en favoritos del usuario
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
          tblvehiclesopinions: {
            select: {
              opinionID: true,
              opinionRate: true,
              opinionComment: true,
              opinionDate: true,
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
            take: 10, // Últimas 10 opiniones
          },
        },
      })

      if (!vehicle) {
        throw new ApiError(404, 'Vehículo no encontrado en tus favoritos')
      }

      // Calcular estadísticas de opiniones
      const opinions = vehicle.tblvehiclesopinions
      const averageRating =
        opinions.length > 0
          ? opinions.reduce((sum, op) => sum + op.opinionRate, 0) / opinions.length
          : 0

      const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: opinions.filter((op) => op.opinionRate === rating).length,
      }))

      // Formatear respuesta con toda la información
      const vehicleDetails = {
        vehicleID: vehicle.vehicleID,
        año: vehicle.vehicleYear,
        precio: vehicle.vehiclePrice,
        imagen: vehicle.vehicleImageURL,
        pdf: vehicle.vehiclePDFURL,
        
        // Información básica
        marca: {
          id: vehicle.tblvehiclebrand.brandID,
          nombre: vehicle.tblvehiclebrand.brandBrand,
        },
        modelo: {
          id: vehicle.tblvehiclemodel.modelID,
          nombre: vehicle.tblvehiclemodel.modelDescription,
        },
        version: {
          id: vehicle.tblvehicleversion.versionID,
          nombre: vehicle.tblvehicleversion.versionDescription,
        },
        categoria: {
          id: vehicle.tblvehiclecategories.categoryID,
          nombre: vehicle.tblvehiclecategories.categoryDescription,
        },

        // Especificaciones técnicas
        especificaciones: {
          motor: {
            potenciaHP: vehicle.vehiclePowerHP,
            cilindradaCC: vehicle.vehicleDisplacementCC,
            velocidadMaximaKMH: vehicle.vehicleMaxSpeedKMH,
            consumoL100km: vehicle.vehicleFuelConsumption,
            tipoCombustible: vehicle.vehicleFuelType,
          },
          dimensiones: {
            pesoKG: vehicle.vehicleWeightKG,
            pasajeros: vehicle.vehiclePassengers,
            distanciaSueloMM: vehicle.vehicleGroundClearance,
            capacidadTanqueL: vehicle.vehicleFuelTankCapacity,
          },
          seguridadTransmision: {
            calificacionSeguridad: vehicle.vehicleSafetyRating,
            tipoTraccion: vehicle.vehicleDriveType,
            transmision: vehicle.vehicleTransmission,
            suspension: vehicle.vehicleSuspension,
          },
          metadata: {
            especificacionesExtraidas: vehicle.vehicleSpecsExtracted,
            ultimaActualizacion: vehicle.vehicleSpecsUpdatedAt,
          },
        },

        // Estadísticas y opiniones
        opiniones: {
          promedio: Math.round(averageRating * 10) / 10,
          total: opinions.length,
          distribucion: ratingDistribution,
          ultimas: opinions.map(op => ({
            id: op.opinionID,
            calificacion: op.opinionRate,
            comentario: op.opinionComment,
            fecha: op.opinionDate,
            usuario: {
              id: op.tblusuarios.userId,
              nombre: op.tblusuarios.userName,
              foto: op.tblusuarios.userPhotoURL,
            },
          })),
        },
      }

      return successResponse(vehicleDetails)
    } catch (error) {
      return handleError(error)
    }
  })
}
