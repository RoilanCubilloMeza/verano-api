import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

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

// GET /api/users/[id]/favorites - Obtener favoritos del usuario con paginación
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    try {
      const { id } = await params
      const userIdNum = parseInt(id)
      
      // Obtener parámetros de paginación
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = 5 // Límite fijo de 5 elementos por página
      const skip = (page - 1) * limit

      // Buscar el registro de favoritos del usuario
      const favorite = await prisma.tbluserfavoritevehicles.findFirst({
        where: { userId: userIdNum },
      })

      if (!favorite) {
        return successResponse({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        })
      }

      // Obtener vehículos favoritos con paginación
      const [vehicles, total] = await Promise.all([
        prisma.tblvehicles.findMany({
          where: { favoriteID: favorite.favoriteID },
          skip,
          take: limit,
          select: {
            vehicleID: true,
            vehicleImageURL: true,
            tblvehiclebrand: {
              select: {
                brandBrand: true,
              },
            },
            tblvehiclemodel: {
              select: {
                modelDescription: true,
              },
            },
          },
          orderBy: {
            vehicleID: 'desc',
          },
        }),
        prisma.tblvehicles.count({
          where: { favoriteID: favorite.favoriteID },
        }),
      ])

      // Formatear respuesta
      const formattedVehicles = vehicles.map(vehicle => ({
        vehicleID: vehicle.vehicleID,
        imagen: vehicle.vehicleImageURL,
        marca: vehicle.tblvehiclebrand.brandBrand,
        modelo: vehicle.tblvehiclemodel.modelDescription,
      }))

      return successResponse({
        data: formattedVehicles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
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
