import { NextRequest } from 'next/server';
import { prisma } from '@/utils/prisma';
import { handleError, successResponse } from '@/utils/api-response';
import { withOptionalAuth } from '@/utils/middleware';

// GET /api/newcars/models - Obtener todos los modelos
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const models = await prisma.tblvehiclemodel.findMany({
        select: {
          modelID: true,
          modelDescription: true,
        },
        orderBy: {
          modelDescription: 'asc',
        },
      });

      return successResponse(models);
    } catch (error) {
      return handleError(error);
    }
  });
}
