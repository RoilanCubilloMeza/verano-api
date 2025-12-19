import { NextRequest } from 'next/server';
import { prisma } from '@/utils/prisma';
import { handleError, successResponse } from '@/utils/api-response';
import { withOptionalAuth } from '@/utils/middleware';

// GET /api/newcars/categories - Obtener todas las categorías
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const categories = await prisma.tblvehiclecategories.findMany({
        select: {
          categoryID: true,
          categoryDescription: true,
        },
        orderBy: {
          categoryDescription: 'asc',
        },
      });

      return successResponse(categories);
    } catch (error) {
      return handleError(error);
    }
  });
}
