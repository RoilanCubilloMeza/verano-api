import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/api-response'
import { withOptionalAuth } from '@/lib/middleware'

// GET /api/categories - Obtener todas las categorías
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const categories = await prisma.tblvehiclecategories.findMany({
        include: {
          _count: {
            select: {
              tblvehicles: true,
            },
          },
        },
        orderBy: {
          categoryDescription: 'asc',
        },
      })

      return successResponse(categories)
    } catch (error) {
      return handleError(error)
    }
  })
}
