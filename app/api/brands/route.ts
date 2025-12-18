import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/api-response'
import { withOptionalAuth } from '@/lib/middleware'

// GET /api/brands - Obtener todas las marcas
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const brands = await prisma.tblvehiclebrand.findMany({
        include: {
          _count: {
            select: {
              tblvehicles: true,
            },
          },
        },
        orderBy: {
          brandBrand: 'asc',
        },
      })

      return successResponse(brands)
    } catch (error) {
      return handleError(error)
    }
  })
}
