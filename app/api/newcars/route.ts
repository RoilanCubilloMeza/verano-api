import { NextRequest } from 'next/server';
import { prisma } from '@/utils/prisma';
import { handleError, successResponse } from '@/utils/api-response';
import { withOptionalAuth } from '@/utils/middleware';
import { uploadImage } from '@/utils/cloudinary';

// GET /api/newcars - Obtener todos los datos necesarios para crear un vehículo
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      // Obtener todos los datos en paralelo
      const [brands, models, versions, categories] = await Promise.all([
        prisma.tblvehiclebrand.findMany({
          select: {
            brandID: true,
            brandBrand: true,
          },
          orderBy: {
            brandBrand: 'asc',
          },
        }),
        prisma.tblvehiclemodel.findMany({
          select: {
            modelID: true,
            modelDescription: true,
          },
          orderBy: {
            modelDescription: 'asc',
          },
        }),
        prisma.tblvehicleversion.findMany({
          select: {
            versionID: true,
            versionDescription: true,
          },
          orderBy: {
            versionDescription: 'asc',
          },
        }),
        prisma.tblvehiclecategories.findMany({
          select: {
            categoryID: true,
            categoryDescription: true,
          },
          orderBy: {
            categoryDescription: 'asc',
          },
        }),
      ]);

      return successResponse({
        brands,
        models,
        versions,
        categories,
      });
    } catch (error) {
      return handleError(error);
    }
  });
}

// POST /api/newcars - Crear nuevo vehículo con foto y PDF
export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const formData = await request.formData();
      
      // Extraer datos del formulario
      const vehicleBrandID = parseInt(formData.get('vehicleBrandID') as string);
      const vehicleModelID = parseInt(formData.get('vehicleModelID') as string);
      const vehicleVersionID = parseInt(formData.get('vehicleVersionID') as string);
      const vehicleCategoryID = parseInt(formData.get('vehicleCategoryID') as string);
      const vehicleYear = parseInt(formData.get('vehicleYear') as string);
      const vehiclePrice = parseInt(formData.get('vehiclePrice') as string);
      const vehicleImage = formData.get('vehicleImage') as File | null;
      const vehiclePDFFile = formData.get('vehiclePDF') as File | null;

      // Extraer especificaciones técnicas (Motor y Rendimiento)
      const vehiclePowerHP = formData.get('vehiclePowerHP') ? parseInt(formData.get('vehiclePowerHP') as string) : null;
      const vehicleDisplacementCC = formData.get('vehicleDisplacementCC') ? parseInt(formData.get('vehicleDisplacementCC') as string) : null;
      const vehicleMaxSpeedKMH = formData.get('vehicleMaxSpeedKMH') ? parseInt(formData.get('vehicleMaxSpeedKMH') as string) : null;
      const vehicleFuelConsumption = formData.get('vehicleFuelConsumption') ? parseFloat(formData.get('vehicleFuelConsumption') as string) : null;
      const vehicleFuelType = (formData.get('vehicleFuelType') as string) || null;

      // Dimensiones y Capacidad
      const vehicleWeightKG = formData.get('vehicleWeightKG') ? parseInt(formData.get('vehicleWeightKG') as string) : null;
      const vehiclePassengers = formData.get('vehiclePassengers') ? parseInt(formData.get('vehiclePassengers') as string) : null;
      const vehicleGroundClearance = formData.get('vehicleGroundClearance') ? parseInt(formData.get('vehicleGroundClearance') as string) : null;
      const vehicleFuelTankCapacity = formData.get('vehicleFuelTankCapacity') ? parseInt(formData.get('vehicleFuelTankCapacity') as string) : null;

      // Seguridad y Transmisión
      const vehicleSafetyRating = formData.get('vehicleSafetyRating') ? parseInt(formData.get('vehicleSafetyRating') as string) : null;
      const vehicleDriveType = (formData.get('vehicleDriveType') as string) || null;
      const vehicleTransmission = (formData.get('vehicleTransmission') as string) || null;
      const vehicleSuspension = (formData.get('vehicleSuspension') as string) || null;

      // Validaciones
      if (!vehicleBrandID || !vehicleModelID || !vehicleVersionID || !vehicleCategoryID) {
        return handleError(new Error('Faltan campos requeridos: brandID, modelID, versionID, categoryID'));
      }

      if (!vehicleYear || vehicleYear < 1900 || vehicleYear > new Date().getFullYear() + 1) {
        return handleError(new Error('Año de vehículo inválido'));
      }

      if (!vehiclePrice || vehiclePrice <= 0) {
        return handleError(new Error('Precio inválido'));
      }

      // Subir imagen a Cloudinary (requerida)
      let imageUrl: string;
      if (vehicleImage && vehicleImage.size > 0) {
        // Validar tamaño máximo (5MB)
        if (vehicleImage.size > 5 * 1024 * 1024) {
          return handleError(new Error('La imagen no debe exceder 5MB'));
        }

        const uploadResult = await uploadImage(vehicleImage, 'vehicles/images');
        imageUrl = uploadResult.url;
      } else {
        return handleError(new Error('La imagen del vehículo es requerida'));
      }

      // Subir PDF a Cloudinary (opcional)
      let pdfUrl: string | null = null;
      if (vehiclePDFFile && vehiclePDFFile.size > 0) {
        // Validar tamaño máximo (10MB para PDF)
        if (vehiclePDFFile.size > 10 * 1024 * 1024) {
          return handleError(new Error('El PDF no debe exceder 10MB'));
        }

        // Validar tipo de archivo
        if (vehiclePDFFile.type !== 'application/pdf') {
          return handleError(new Error('El archivo debe ser un PDF'));
        }

        const uploadResult = await uploadImage(vehiclePDFFile, 'vehicles/pdfs');
        pdfUrl = uploadResult.url;
      }

      // Crear vehículo con especificaciones técnicas
      const newVehicle = await prisma.tblvehicles.create({
        data: {
          vehicleBrandID,
          vehicleModelID,
          vehicleVersionID,
          vehicleCategoryID,
          vehicleYear,
          vehiclePrice,
          vehicleImageURL: imageUrl,
          vehiclePDFURL: pdfUrl,
          // Especificaciones técnicas
          vehiclePowerHP,
          vehicleDisplacementCC,
          vehicleMaxSpeedKMH,
          vehicleFuelConsumption,
          vehicleFuelType,
          vehicleWeightKG,
          vehiclePassengers,
          vehicleGroundClearance,
          vehicleFuelTankCapacity,
          vehicleSafetyRating,
          vehicleDriveType,
          vehicleTransmission,
          vehicleSuspension,
        },
        include: {
          tblvehiclebrand: {
            select: {
              brandID: true,
              brandBrand: true,
            },
          },
          tblvehiclemodel: {
            select: {
              modelID: true,
              modelDescription: true,
            },
          },
          tblvehicleversion: {
            select: {
              versionID: true,
              versionDescription: true,
            },
          },
          tblvehiclecategories: {
            select: {
              categoryID: true,
              categoryDescription: true,
            },
          },
        },
      });

      return successResponse(
        {
          ...newVehicle,
          message: 'Vehículo creado exitosamente',
        },
        201
      );
    } catch (error) {
      return handleError(error);
    }
  });
}
