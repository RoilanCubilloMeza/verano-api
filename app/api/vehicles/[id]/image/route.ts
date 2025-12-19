import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { handleError, ApiError } from '@/utils/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/vehicles/[id]/image - Obtener imagen del vehículo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const vehicleID = parseInt(id);

    if (isNaN(vehicleID)) {
      throw new ApiError(400, 'ID de vehículo inválido');
    }

    const vehicle = await prisma.tblvehicles.findUnique({
      where: { vehicleID },
      select: {
        vehicleID: true,
        vehiclePDF: true,
      },
    });

    if (!vehicle) {
      throw new ApiError(404, 'Vehículo no encontrado');
    }

    if (!vehicle.vehiclePDF || vehicle.vehiclePDF.length === 0) {
      throw new ApiError(404, 'Imagen no disponible para este vehículo');
    }

    // Extraer URL de Cloudinary del buffer
    const imageUrl = vehicle.vehiclePDF.toString('utf-8');

    // Redirigir a Cloudinary
    return NextResponse.redirect(imageUrl, 302);
  } catch (error) {
    return handleError(error);
  }
}
