import { NextRequest } from 'next/server';
import { prisma } from '@/utils/prisma';
import { handleError, successResponse } from '@/utils/api-response';
import { withOptionalAuth } from '@/utils/middleware';

// GET /api/newcars/versions - Obtener todas las versiones
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const versions = await prisma.tblvehicleversion.findMany({
        select: {
          versionID: true,
          versionDescription: true,
        },
        orderBy: {
          versionDescription: 'asc',
        },
      });

      return successResponse(versions);
    } catch (error) {
      return handleError(error);
    }
  });
}
