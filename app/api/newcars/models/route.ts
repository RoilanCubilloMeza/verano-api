import { NextRequest } from 'next/server';
import { prisma } from '@/utils/prisma';
import { handleError, successResponse } from '@/utils/api-response';
import { withOptionalAuth } from '@/utils/middleware';

// GET /api/newcars/models - Obtener todos los modelos o filtrados por marca
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const brandID = searchParams.get('brandID')
      
      let models

      if (brandID) {
        // Obtener modelos que tienen al menos un vehículo con esa marca
        const vehiclesWithBrand = await prisma.tblvehicles.findMany({
          where: {
            vehicleBrandID: parseInt(brandID),
          },
          select: {
            tblvehiclemodel: {
              select: {
                modelID: true,
                modelDescription: true,
              },
            },
          },
          distinct: ['vehicleModelID'],
        })

        // Extraer modelos únicos
        models = vehiclesWithBrand.map(v => v.tblvehiclemodel)
      } else {
        // Sin filtro, devolver todos los modelos
        models = await prisma.tblvehiclemodel.findMany({
          select: {
            modelID: true,
            modelDescription: true,
          },
        })
      }

      // Ordenar por descripción
      models.sort((a, b) => a.modelDescription.localeCompare(b.modelDescription))

      return successResponse(models);
    } catch (error) {
      return handleError(error);
    }
  });
}
