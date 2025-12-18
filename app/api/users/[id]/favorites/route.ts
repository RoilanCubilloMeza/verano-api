import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/users/[id]/favorites - Agregar vehículo a favoritos
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const userIdNum = parseInt(id)
      const body = await request.json()
      const { vehicleID } = body

      // Verificar que el usuario solo pueda agregar a sus propios favoritos
      if (userIdNum !== authUserId) {
        return successResponse({ error: 'No autorizado' }, 403)
      }

      // Crear o obtener el registro de favoritos del usuario
      let favorite = await prisma.tbluserfavoritevehicles.findFirst({
        where: { userId: userIdNum },
      })

      if (!favorite) {
        favorite = await prisma.tbluserfavoritevehicles.create({
          data: { userId: userIdNum },
        })
      }

      // Agregar el vehículo a favoritos
      await prisma.tblvehicles.update({
        where: { vehicleID },
        data: { favoriteID: favorite.favoriteID },
      })

      return successResponse({ message: 'Vehículo agregado a favoritos' }, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// GET /api/users/[id]/favorites - Obtener favoritos del usuario
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    try {
      const { id } = await params
      const userIdNum = parseInt(id)

      const favorite = await prisma.tbluserfavoritevehicles.findFirst({
        where: { userId: userIdNum },
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

      return successResponse(favorite?.tblvehicles || [])
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/users/[id]/favorites - Eliminar vehículo de favoritos
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const userIdNum = parseInt(id)
      const { searchParams } = new URL(request.url)
      const vehicleID = parseInt(searchParams.get('vehicleID') || '0')

      if (userIdNum !== authUserId) {
        return successResponse({ error: 'No autorizado' }, 403)
      }

      await prisma.tblvehicles.update({
        where: { vehicleID },
        data: { favoriteID: null },
      })

      return successResponse({ message: 'Vehículo eliminado de favoritos' })
    } catch (error) {
      return handleError(error)
    }
  })
}
