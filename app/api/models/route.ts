import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withOptionalAuth } from '@/utils/middleware'

// GET /api/models - Obtener todos los modelos de vehículos
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const models = await prisma.tblvehiclemodel.findMany({
        include: {
          _count: {
            select: {
              tblvehicles: true,
            },
          },
        },
        orderBy: {
          modelDescription: 'asc',
        },
      })

      return successResponse(models)
    } catch (error) {
      return handleError(error)
    }
  })
}
