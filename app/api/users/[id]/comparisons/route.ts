import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

// GET /api/users/:id/comparisons - Obtener comparaciones del usuario
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (decodedToken) => {
    try {
      const userId = parseInt(params.id)

      if (isNaN(userId)) {
        throw new ApiError('ID de usuario inválido', 400)
      }

      // Verificar que el usuario solo acceda a sus propias comparaciones
      if (decodedToken.userId !== userId) {
        throw new ApiError('No autorizado para acceder a estas comparaciones', 403)
      }

      const comparisons = await prisma.tblusercomparations.findMany({
        where: { userId },
        include: {
          tblvehicles: {
            include: {
              tblvehiclebrand: true,
              tblvehiclemodel: true,
              tblvehicleversion: true,
              tblvehiclecategories: true,
            },
          },
        },
      })

      return successResponse(comparisons)
    } catch (error) {
      return handleError(error)
    }
  })
}

// POST /api/users/:id/comparisons - Crear nueva comparación
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (decodedToken) => {
    try {
      const userId = parseInt(params.id)

      if (isNaN(userId)) {
        throw new ApiError('ID de usuario inválido', 400)
      }

      if (decodedToken.userId !== userId) {
        throw new ApiError('No autorizado para crear comparaciones', 403)
      }

      const body = await request.json()
      const { vehicleIds } = body

      if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
        throw new ApiError('Debe proporcionar al menos un ID de vehículo', 400)
      }

      // Verificar que los vehículos existen
      const vehiclesExist = await prisma.tblvehicles.findMany({
        where: { vehicleID: { in: vehicleIds } },
        select: { vehicleID: true },
      })

      if (vehiclesExist.length !== vehicleIds.length) {
        throw new ApiError('Uno o más vehículos no existen', 400)
      }

      // Crear la comparación
      const comparison = await prisma.tblusercomparations.create({
        data: {
          userId,
        },
        include: {
          tblvehicles: {
            include: {
              tblvehiclebrand: true,
              tblvehiclemodel: true,
              tblvehicleversion: true,
              tblvehiclecategories: true,
            },
          },
        },
      })

      // Asociar vehículos a la comparación
      await prisma.tblvehicles.updateMany({
        where: { vehicleID: { in: vehicleIds } },
        data: { comparationID: comparison.comparationID },
      })

      // Obtener la comparación actualizada con vehículos
      const updatedComparison = await prisma.tblusercomparations.findUnique({
        where: { comparationID: comparison.comparationID },
        include: {
          tblvehicles: {
            include: {
              tblvehiclebrand: true,
              tblvehiclemodel: true,
              tblvehicleversion: true,
              tblvehiclecategories: true,
            },
          },
        },
      })

      return successResponse(updatedComparison, 'Comparación creada exitosamente', 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/users/:id/comparisons - Eliminar comparación
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (decodedToken) => {
    try {
      const userId = parseInt(params.id)
      const { searchParams } = new URL(request.url)
      const comparationId = searchParams.get('comparationId')

      if (isNaN(userId)) {
        throw new ApiError('ID de usuario inválido', 400)
      }

      if (!comparationId) {
        throw new ApiError('ID de comparación requerido', 400)
      }

      if (decodedToken.userId !== userId) {
        throw new ApiError('No autorizado para eliminar esta comparación', 403)
      }

      // Verificar que la comparación pertenece al usuario
      const comparison = await prisma.tblusercomparations.findFirst({
        where: {
          comparationID: parseInt(comparationId),
          userId,
        },
      })

      if (!comparison) {
        throw new ApiError('Comparación no encontrada', 404)
      }

      // Desasociar vehículos primero
      await prisma.tblvehicles.updateMany({
        where: { comparationID: parseInt(comparationId) },
        data: { comparationID: null },
      })

      // Eliminar comparación
      await prisma.tblusercomparations.delete({
        where: { comparationID: parseInt(comparationId) },
      })

      return successResponse(null, 'Comparación eliminada exitosamente')
    } catch (error) {
      return handleError(error)
    }
  })
}
