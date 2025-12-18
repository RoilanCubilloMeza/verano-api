import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withOptionalAuth } from '@/utils/middleware'

// GET /api/versions - Obtener todas las versiones de vehículos
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const versions = await prisma.tblvehicleversion.findMany({
        include: {
          _count: {
            select: {
              tblvehicles: true,
            },
          },
        },
        orderBy: {
          versionDescription: 'asc',
        },
      })

      return successResponse(versions)
    } catch (error) {
      return handleError(error)
    }
  })
}
