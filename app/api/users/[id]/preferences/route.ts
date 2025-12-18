import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

// GET /api/users/:id/preferences - Obtener preferencias del usuario
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

      // Verificar que el usuario solo acceda a sus propias preferencias
      if (decodedToken.userId !== userId) {
        throw new ApiError('No autorizado para acceder a estas preferencias', 403)
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
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (decodedToken) => {
    try {
      const userId = parseInt(params.id)

      if (isNaN(userId)) {
        throw new ApiError('ID de usuario inválido', 400)
      }

      if (decodedToken.userId !== userId) {
        throw new ApiError('No autorizado para crear preferencias', 403)
      }

      const body = await request.json()
      const { preferenceBrandID, preferenceCategoryID, preferencePriceMax } = body

      // Validar campos requeridos
      if (!preferenceBrandID || !preferenceCategoryID || !preferencePriceMax) {
        throw new ApiError(
          'Campos requeridos: preferenceBrandID, preferenceCategoryID, preferencePriceMax',
          400
        )
      }

      // Validar que la marca existe
      const brandExists = await prisma.tblvehiclebrand.findUnique({
        where: { brandID: parseInt(preferenceBrandID) },
      })

      if (!brandExists) {
        throw new ApiError('Marca no encontrada', 404)
      }

      // Validar que la categoría existe
      const categoryExists = await prisma.tblvehiclecategories.findUnique({
        where: { categoryID: parseInt(preferenceCategoryID) },
      })

      if (!categoryExists) {
        throw new ApiError('Categoría no encontrada', 404)
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

      return successResponse(preference, 'Preferencia creada exitosamente', 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// PATCH /api/users/:id/preferences - Actualizar preferencia
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (decodedToken) => {
    try {
      const userId = parseInt(params.id)
      const { searchParams } = new URL(request.url)
      const preferenceId = searchParams.get('preferenceId')

      if (isNaN(userId)) {
        throw new ApiError('ID de usuario inválido', 400)
      }

      if (!preferenceId) {
        throw new ApiError('ID de preferencia requerido', 400)
      }

      if (decodedToken.userId !== userId) {
        throw new ApiError('No autorizado para actualizar esta preferencia', 403)
      }

      // Verificar que la preferencia pertenece al usuario
      const existingPreference = await prisma.tbluserpreferences.findFirst({
        where: {
          preferenceID: parseInt(preferenceId),
          preferenceUserId: userId,
        },
      })

      if (!existingPreference) {
        throw new ApiError('Preferencia no encontrada', 404)
      }

      const body = await request.json()
      const { preferenceBrandID, preferenceCategoryID, preferencePriceMax } = body

      const updateData: any = {}

      if (preferenceBrandID !== undefined) {
        const brandExists = await prisma.tblvehiclebrand.findUnique({
          where: { brandID: parseInt(preferenceBrandID) },
        })
        if (!brandExists) {
          throw new ApiError('Marca no encontrada', 404)
        }
        updateData.preferenceBrandID = parseInt(preferenceBrandID)
      }

      if (preferenceCategoryID !== undefined) {
        const categoryExists = await prisma.tblvehiclecategories.findUnique({
          where: { categoryID: parseInt(preferenceCategoryID) },
        })
        if (!categoryExists) {
          throw new ApiError('Categoría no encontrada', 404)
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

      return successResponse(updatedPreference, 'Preferencia actualizada exitosamente')
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/users/:id/preferences - Eliminar preferencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (decodedToken) => {
    try {
      const userId = parseInt(params.id)
      const { searchParams } = new URL(request.url)
      const preferenceId = searchParams.get('preferenceId')

      if (isNaN(userId)) {
        throw new ApiError('ID de usuario inválido', 400)
      }

      if (!preferenceId) {
        throw new ApiError('ID de preferencia requerido', 400)
      }

      if (decodedToken.userId !== userId) {
        throw new ApiError('No autorizado para eliminar esta preferencia', 403)
      }

      // Verificar que la preferencia pertenece al usuario
      const preference = await prisma.tbluserpreferences.findFirst({
        where: {
          preferenceID: parseInt(preferenceId),
          preferenceUserId: userId,
        },
      })

      if (!preference) {
        throw new ApiError('Preferencia no encontrada', 404)
      }

      await prisma.tbluserpreferences.delete({
        where: { preferenceID: parseInt(preferenceId) },
      })

      return successResponse(null, 'Preferencia eliminada exitosamente')
    } catch (error) {
      return handleError(error)
    }
  })
}
