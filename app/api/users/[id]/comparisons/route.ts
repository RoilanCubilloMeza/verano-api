import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/users/:id/comparisons - Obtener comparaciones del usuario
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(request, async (_req, tokenUserId) => {
    try {
      const { id } = await params
      const userId = parseInt(id)

      if (isNaN(userId)) {
        throw new ApiError(400, 'ID de usuario inválido')
      }

      // Verificar que el usuario solo acceda a sus propias comparaciones
      if (tokenUserId !== userId) {
        throw new ApiError(403, 'No autorizado para acceder a estas comparaciones')
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
  { params }: RouteParams
) {
  return withAuth(request, async (_req, tokenUserId) => {
    try {
      const { id } = await params
      const userId = parseInt(id)

      if (isNaN(userId)) {
        throw new ApiError(400, 'ID de usuario inválido')
      }

      if (tokenUserId !== userId) {
        throw new ApiError(403, 'No autorizado para crear comparaciones')
      }

      const body = await request.json()
      const { vehicleIds } = body

      if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
        throw new ApiError(400, 'Debe proporcionar al menos un ID de vehículo')
      }

      // Verificar que los vehículos existen
      const vehiclesExist = await prisma.tblvehicles.findMany({
        where: { vehicleID: { in: vehicleIds } },
        select: { vehicleID: true },
      })

      if (vehiclesExist.length !== vehicleIds.length) {
        throw new ApiError(400, 'Uno o más vehículos no existen')
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

      return successResponse(updatedComparison, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/users/:id/comparisons - Eliminar comparación
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(request, async (_req, tokenUserId) => {
    try {
      const { id } = await params
      const userId = parseInt(id)
      const { searchParams } = new URL(request.url)
      const comparationId = searchParams.get('comparationId')

      if (isNaN(userId)) {
        throw new ApiError(400, 'ID de usuario inválido')
      }

      if (!comparationId) {
        throw new ApiError(400, 'ID de comparación requerido')
      }

      if (tokenUserId !== userId) {
        throw new ApiError(403, 'No autorizado para eliminar esta comparación')
      }

      // Verificar que la comparación pertenece al usuario
      const comparison = await prisma.tblusercomparations.findFirst({
        where: {
          comparationID: parseInt(comparationId),
          userId,
        },
      })

      if (!comparison) {
        throw new ApiError(404, 'Comparación no encontrada')
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

      return successResponse({ message: 'Comparación eliminada exitosamente' })
    } catch (error) {
      return handleError(error)
    }
  })
}
