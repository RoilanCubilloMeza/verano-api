import { NextRequest } from 'next/server';
import { prisma } from '@/utils/prisma';
import { handleError, successResponse } from '@/utils/api-response';
import { withOptionalAuth } from '@/utils/middleware';

// GET /api/newcars/versions - Obtener todas las versiones o filtradas por modelo
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const modelID = searchParams.get('modelID')
      
      let versions

      if (modelID) {
        // Obtener versiones que tienen al menos un vehículo con ese modelo
        const vehiclesWithModel = await prisma.tblvehicles.findMany({
          where: {
            vehicleModelID: parseInt(modelID),
          },
          select: {
            tblvehicleversion: {
              select: {
                versionID: true,
                versionDescription: true,
              },
            },
          },
          distinct: ['vehicleVersionID'],
        })

        // Extraer versiones únicas
        versions = vehiclesWithModel.map(v => v.tblvehicleversion)
      } else {
        // Sin filtro, devolver todas las versiones
        versions = await prisma.tblvehicleversion.findMany({
          select: {
            versionID: true,
            versionDescription: true,
          },
        })
      }

      // Ordenar por descripción
      versions.sort((a, b) => a.versionDescription.localeCompare(b.versionDescription))

      return successResponse(versions);
    } catch (error) {
      return handleError(error);
    }
  });
}
