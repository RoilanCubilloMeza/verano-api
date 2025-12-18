import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/users/:id/preferences - Obtener preferencias del usuario
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

      // Verificar que el usuario solo acceda a sus propias preferencias
      if (tokenUserId !== userId) {
        throw new ApiError(403, 'No autorizado para acceder a estas preferencias')
      }

      const preferences = await prisma.tbluserpreferences.findMany({
        where: { preferenceUserId: userId },
        include: {
          tblvehiclebrand: true,
          tblvehiclecategories: true,
        },
      })

      return successResponse(preferences)
    } catch (error) {
      return handleError(error)
    }
  })
}

// POST /api/users/:id/preferences - Crear nueva preferencia
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
        throw new ApiError(403, 'No autorizado para crear preferencias')
      }

      const body = await request.json()
      const { preferenceBrandID, preferenceCategoryID, preferencePriceMax } = body

      // Validar campos requeridos
      if (!preferenceBrandID || !preferenceCategoryID || !preferencePriceMax) {
        throw new ApiError(
          400,
          'Campos requeridos: preferenceBrandID, preferenceCategoryID, preferencePriceMax'
        )
      }

      // Validar que la marca existe
      const brandExists = await prisma.tblvehiclebrand.findUnique({
        where: { brandID: parseInt(preferenceBrandID) },
      })

      if (!brandExists) {
        throw new ApiError(404, 'Marca no encontrada')
      }

      // Validar que la categoría existe
      const categoryExists = await prisma.tblvehiclecategories.findUnique({
        where: { categoryID: parseInt(preferenceCategoryID) },
      })

      if (!categoryExists) {
        throw new ApiError(404, 'Categoría no encontrada')
      }

      // Crear preferencia
      const preference = await prisma.tbluserpreferences.create({
        data: {
          preferenceBrandID: parseInt(preferenceBrandID),
          preferenceCategoryID: parseInt(preferenceCategoryID),
          preferencePriceMax: parseInt(preferencePriceMax),
          preferenceUserId: userId,
        },
        include: {
          tblvehiclebrand: true,
          tblvehiclecategories: true,
        },
      })

      return successResponse(preference, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// PATCH /api/users/:id/preferences - Actualizar preferencia
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(request, async (_req, tokenUserId) => {
    try {
      const { id } = await params
      const userId = parseInt(id)
      const { searchParams } = new URL(request.url)
      const preferenceId = searchParams.get('preferenceId')

      if (isNaN(userId)) {
        throw new ApiError(400, 'ID de usuario inválido')
      }

      if (!preferenceId) {
        throw new ApiError(400, 'ID de preferencia requerido')
      }

      if (tokenUserId !== userId) {
        throw new ApiError(403, 'No autorizado para actualizar esta preferencia')
      }

      // Verificar que la preferencia pertenece al usuario
      const existingPreference = await prisma.tbluserpreferences.findFirst({
        where: {
          preferenceID: parseInt(preferenceId),
          preferenceUserId: userId,
        },
      })

      if (!existingPreference) {
        throw new ApiError(404, 'Preferencia no encontrada')
      }

      const body = await request.json()
      const { preferenceBrandID, preferenceCategoryID, preferencePriceMax } = body

      const updateData: {
        preferenceBrandID?: number
        preferenceCategoryID?: number
        preferencePriceMax?: number
      } = {}

      if (preferenceBrandID !== undefined) {
        const brandExists = await prisma.tblvehiclebrand.findUnique({
          where: { brandID: parseInt(preferenceBrandID) },
        })
        if (!brandExists) {
          throw new ApiError(404, 'Marca no encontrada')
        }
        updateData.preferenceBrandID = parseInt(preferenceBrandID)
      }

      if (preferenceCategoryID !== undefined) {
        const categoryExists = await prisma.tblvehiclecategories.findUnique({
          where: { categoryID: parseInt(preferenceCategoryID) },
        })
        if (!categoryExists) {
          throw new ApiError(404, 'Categoría no encontrada')
        }
        updateData.preferenceCategoryID = parseInt(preferenceCategoryID)
      }

      if (preferencePriceMax !== undefined) {
        updateData.preferencePriceMax = parseInt(preferencePriceMax)
      }

      const updatedPreference = await prisma.tbluserpreferences.update({
        where: { preferenceID: parseInt(preferenceId) },
        data: updateData,
        include: {
          tblvehiclebrand: true,
          tblvehiclecategories: true,
        },
      })

      return successResponse(updatedPreference)
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/users/:id/preferences - Eliminar preferencia
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(request, async (_req, tokenUserId) => {
    try {
      const { id } = await params
      const userId = parseInt(id)
      const { searchParams } = new URL(request.url)
      const preferenceId = searchParams.get('preferenceId')

      if (isNaN(userId)) {
        throw new ApiError(400, 'ID de usuario inválido')
      }

      if (!preferenceId) {
        throw new ApiError(400, 'ID de preferencia requerido')
      }

      if (tokenUserId !== userId) {
        throw new ApiError(403, 'No autorizado para eliminar esta preferencia')
      }

      // Verificar que la preferencia pertenece al usuario
      const preference = await prisma.tbluserpreferences.findFirst({
        where: {
          preferenceID: parseInt(preferenceId),
          preferenceUserId: userId,
        },
      })

      if (!preference) {
        throw new ApiError(404, 'Preferencia no encontrada')
      }

      await prisma.tbluserpreferences.delete({
        where: { preferenceID: parseInt(preferenceId) },
      })

      return successResponse({ message: 'Preferencia eliminada exitosamente' })
    } catch (error) {
      return handleError(error)
    }
  })
}
