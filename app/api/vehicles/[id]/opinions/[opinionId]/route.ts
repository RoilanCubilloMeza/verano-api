import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'
import { updateOpinionSchema } from '@/utils/validations'

interface RouteParams {
  params: Promise<{ id: string; opinionId: string }>
}


// PATCH /api/vehicles/[id]/opinions/[opinionId] - Actualizar una opinión
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id, opinionId } = await params
      const vehicleID = parseInt(id)
      const opinionID = parseInt(opinionId)
      const body = await request.json()

      if (isNaN(vehicleID) || isNaN(opinionID)) {
        throw new ApiError(400, 'ID de vehículo u opinión inválido')
      }

      const validated = updateOpinionSchema.parse(body)

      // Verificar que la opinión existe
      const opinion = await prisma.tblvehiclesopinions.findUnique({
        where: { opinionID },
      })

      if (!opinion) {
        throw new ApiError(404, 'Opinión no encontrada')
      }

      // Verificar que la opinión pertenece al vehículo especificado
      if (opinion.opinionVehicleID !== vehicleID) {
        throw new ApiError(400, 'La opinión no pertenece a este vehículo')
      }

      // Verificar que el usuario es el dueño de la opinión
      if (opinion.opinionUserId !== authUserId) {
        throw new ApiError(403, 'No tienes permiso para actualizar esta opinión')
      }

      // Actualizar la opinión
      const updatedOpinion = await prisma.tblvehiclesopinions.update({
        where: { opinionID },
        data: {
          ...(validated.opinionRate !== undefined && { opinionRate: validated.opinionRate }),
          ...(validated.opinionComment !== undefined && { opinionComment: validated.opinionComment }),
          opinionDate: new Date(),
        },
        include: {
          tblusuarios: {
            select: {
              userId: true,
              userName: true,
              userPhotoURL: true,
            },
          },
        },
      })

      return successResponse(updatedOpinion)
    } catch (error) {
      return handleError(error)
    }
  })
}


// DELETE /api/vehicles/[id]/opinions/[opinionId] - Eliminar una opinión
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id, opinionId } = await params
      const vehicleID = parseInt(id)
      const opinionID = parseInt(opinionId)

      if (isNaN(vehicleID) || isNaN(opinionID)) {
        throw new ApiError(400, 'ID de vehículo u opinión inválido')
      }

      // Verificar que la opinión existe
      const opinion = await prisma.tblvehiclesopinions.findUnique({
        where: { opinionID },
      })

      if (!opinion) {
        throw new ApiError(404, 'Opinión no encontrada')
      }

      // Verificar que la opinión pertenece al vehículo especificado
      if (opinion.opinionVehicleID !== vehicleID) {
        throw new ApiError(400, 'La opinión no pertenece a este vehículo')
      }

      // Verificar que el usuario es el dueño de la opinión
      if (opinion.opinionUserId !== authUserId) {
        throw new ApiError(403, 'No tienes permiso para eliminar esta opinión')
      }

      // Eliminar la opinión
      await prisma.tblvehiclesopinions.delete({
        where: { opinionID },
      })

      return successResponse({ message: 'Opinión eliminada exitosamente' })
    } catch (error) {
      return handleError(error)
    }
  })
}

