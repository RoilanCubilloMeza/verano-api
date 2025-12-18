import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'
import { createOpinionSchema } from '@/lib/validations'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/vehicles/[id]/opinions - Crear opinión para un vehículo
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const vehicleID = parseInt(id)
      const body = await request.json()
      
      const validated = createOpinionSchema.parse({
        ...body,
        opinionVehicleID: vehicleID,
        opinionUserId: authUserId,
      })

      // Verificar que el usuario no haya opinado ya sobre este vehículo
      const existingOpinion = await prisma.tblvehiclesopinions.findFirst({
        where: {
          opinionVehicleID: vehicleID,
          opinionUserId: authUserId,
        },
      })

      if (existingOpinion) {
        // Actualizar opinión existente
        const opinion = await prisma.tblvehiclesopinions.update({
          where: { opinionID: existingOpinion.opinionID },
          data: {
            opinionRate: validated.opinionRate,
            opinionComment: validated.opinionComment,
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

        return successResponse(opinion)
      }

      // Crear nueva opinión
      const opinion = await prisma.tblvehiclesopinions.create({
        data: {
          ...validated,
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

      return successResponse(opinion, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// GET /api/vehicles/[id]/opinions - Obtener todas las opiniones de un vehículo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const vehicleID = parseInt(id)

    const opinions = await prisma.tblvehiclesopinions.findMany({
      where: { opinionVehicleID: vehicleID },
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
    })

    return successResponse(opinions)
  } catch (error) {
    return handleError(error)
  }
}
