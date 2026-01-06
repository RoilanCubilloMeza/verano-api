import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withOptionalAuth } from '@/utils/middleware'
import { searchVehiclesSchema } from '@/utils/validations'
import type { PaginatedResponse } from '@/utils/types'
import { uploadImage, uploadPDF } from '@/utils/cloudinary'

// GET /api/vehicles - Buscar vehículos con filtros y paginación
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const queryParams = Object.fromEntries(searchParams.entries())
      
      const {
        page,
        limit,
        brandID,
        categoryID,
        yearMin,
        yearMax,
        priceMin,
        priceMax,
        sortBy,
        sortOrder,
      } = searchVehiclesSchema.parse(queryParams)

      // Construir filtros dinámicamente
      const where: Record<string, unknown> = {}
      
      if (brandID) where.vehicleBrandID = brandID
      if (categoryID) where.vehicleCategoryID = categoryID
      
      if (yearMin || yearMax) {
        where.vehicleYear = {}
        if (yearMin) (where.vehicleYear as Record<string, unknown>).gte = yearMin
        if (yearMax) (where.vehicleYear as Record<string, unknown>).lte = yearMax
      }
      
      if (priceMin || priceMax) {
        where.vehiclePrice = {}
        if (priceMin) (where.vehiclePrice as Record<string, unknown>).gte = priceMin
        if (priceMax) (where.vehiclePrice as Record<string, unknown>).lte = priceMax
      }

      // Ordenamiento
      const orderByMap = {
        price: { vehiclePrice: sortOrder },
        year: { vehicleYear: sortOrder },
        brand: { tblvehiclebrand: { brandBrand: sortOrder } },
      }

      const orderBy = orderByMap[sortBy]

      // Ejecutar consultas en paralelo para mejor rendimiento
      const [vehicles, total] = await Promise.all([
        prisma.tblvehicles.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
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
            tblvehiclesopinions: {
              select: {
                opinionRate: true,
              },
            },
          },
        }),
        prisma.tblvehicles.count({ where }),
      ])

      // Calcular rating promedio para cada vehículo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vehiclesWithRating = vehicles.map((vehicle: any) => {
        const opinions = vehicle.tblvehiclesopinions
        const averageRating =
          opinions.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? opinions.reduce((sum: number, op: any) => sum + op.opinionRate, 0) / opinions.length
            : 0

        return {
          vehicleID: vehicle.vehicleID,
          vehicleYear: vehicle.vehicleYear,
          vehiclePrice: vehicle.vehiclePrice,
          imageUrl: vehicle.vehicleImageURL,
          pdfUrl: vehicle.vehiclePDFURL,
          brand: vehicle.tblvehiclebrand,
          model: vehicle.tblvehiclemodel,
          version: vehicle.tblvehicleversion,
          category: vehicle.tblvehiclecategories,
          averageRating: Math.round(averageRating * 10) / 10,
          opinionCount: opinions.length,
        }
      })

      const response: PaginatedResponse<typeof vehiclesWithRating[0]> = {
        data: vehiclesWithRating,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      return successResponse(response)
    } catch (error) {
      return handleError(error)
    }
  })
}

// POST /api/vehicles - Crear nuevo vehículo con foto y PDF
export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const formData = await request.formData()
      
      // Extraer datos del formulario
      const vehicleBrandID = parseInt(formData.get('vehicleBrandID') as string)
      const vehicleModelID = parseInt(formData.get('vehicleModelID') as string)
      const vehicleVersionID = parseInt(formData.get('vehicleVersionID') as string)
      const vehicleCategoryID = parseInt(formData.get('vehicleCategoryID') as string)
      const vehicleYear = parseInt(formData.get('vehicleYear') as string)
      const vehiclePrice = parseInt(formData.get('vehiclePrice') as string)
      const vehicleImage = formData.get('vehicleImage') as File | null
      const vehiclePDFFile = formData.get('vehiclePDF') as File | null

      // Extraer especificaciones técnicas (Motor y Rendimiento)
      const vehiclePowerHP = formData.get('vehiclePowerHP') ? parseInt(formData.get('vehiclePowerHP') as string) : null
      const vehicleDisplacementCC = formData.get('vehicleDisplacementCC') ? parseInt(formData.get('vehicleDisplacementCC') as string) : null
      const vehicleMaxSpeedKMH = formData.get('vehicleMaxSpeedKMH') ? parseInt(formData.get('vehicleMaxSpeedKMH') as string) : null
      const vehicleFuelConsumption = formData.get('vehicleFuelConsumption') ? parseFloat(formData.get('vehicleFuelConsumption') as string) : null
      const vehicleFuelType = (formData.get('vehicleFuelType') as string) || null

      // Dimensiones y Capacidad
      const vehicleWeightKG = formData.get('vehicleWeightKG') ? parseInt(formData.get('vehicleWeightKG') as string) : null
      const vehiclePassengers = formData.get('vehiclePassengers') ? parseInt(formData.get('vehiclePassengers') as string) : null
      const vehicleGroundClearance = formData.get('vehicleGroundClearance') ? parseInt(formData.get('vehicleGroundClearance') as string) : null
      const vehicleFuelTankCapacity = formData.get('vehicleFuelTankCapacity') ? parseInt(formData.get('vehicleFuelTankCapacity') as string) : null

      // Seguridad y Transmisión
      const vehicleSafetyRating = formData.get('vehicleSafetyRating') ? parseInt(formData.get('vehicleSafetyRating') as string) : null
      const vehicleDriveType = (formData.get('vehicleDriveType') as string) || null
      const vehicleTransmission = (formData.get('vehicleTransmission') as string) || null
      const vehicleSuspension = (formData.get('vehicleSuspension') as string) || null

      // Validaciones
      if (!vehicleBrandID || !vehicleModelID || !vehicleVersionID || !vehicleCategoryID) {
        return handleError(new Error('Faltan campos requeridos: brandID, modelID, versionID, categoryID'))
      }

      if (!vehicleYear || vehicleYear < 1900 || vehicleYear > new Date().getFullYear() + 1) {
        return handleError(new Error('Año de vehículo inválido'))
      }

      if (!vehiclePrice || vehiclePrice <= 0) {
        return handleError(new Error('Precio inválido'))
      }

      // Subir imagen a Cloudinary (requerida)
      let imageUrl: string
      if (vehicleImage && vehicleImage.size > 0) {
        // Validar tamaño máximo (5MB)
        if (vehicleImage.size > 5 * 1024 * 1024) {
          return handleError(new Error('La imagen no debe exceder 5MB'))
        }

        const uploadResult = await uploadImage(vehicleImage, 'vehicles/images')
        imageUrl = uploadResult.url
      } else {
        return handleError(new Error('La imagen del vehículo es requerida'))
      }

      // Subir PDF a Cloudinary (opcional)
      let pdfUrl: string | null = null
      if (vehiclePDFFile && vehiclePDFFile.size > 0) {
        // Validar tamaño máximo (10MB para PDF)
        if (vehiclePDFFile.size > 10 * 1024 * 1024) {
          return handleError(new Error('El PDF no debe exceder 10MB'))
        }

        // Validar tipo de archivo
        if (vehiclePDFFile.type !== 'application/pdf') {
          return handleError(new Error('El archivo debe ser un PDF'))
        }

        const uploadResult = await uploadPDF(vehiclePDFFile, 'vehicles/pdfs')
        pdfUrl = uploadResult.url
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
      })

      return successResponse(
        {
          ...newVehicle,
          message: 'Vehículo creado exitosamente',
        },
        201
      )
    } catch (error) {
      return handleError(error)
    }
  })
}
