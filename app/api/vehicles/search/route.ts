import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withOptionalAuth } from '@/utils/middleware'
import type { VehicleSearchResult } from '@/utils/types'

// GET /api/vehicles/search - Búsqueda de vehículos con autocompletado mejorado
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const query = searchParams.get('q') || ''
      const limit = parseInt(searchParams.get('limit') || '10') // Límite por defecto 10 para autocompletado

      if (!query || query.trim().length < 2) {
        return successResponse({
          data: [],
          total: 0,
          message: 'Ingresa al menos 2 caracteres para buscar',
        })
      }

      const searchTerm = `%${query.trim()}%`

      // Búsqueda optimizada usando SQL raw para mejor rendimiento
      const vehicles: VehicleSearchResult[] = await prisma.$queryRaw`
        SELECT 
          v.vehicleID,
          v.vehicleYear,
          v.vehiclePrice,
          v.vehicleImageURL as imagen,
          b.brandID,
          b.brandBrand as marca,
          m.modelID,
          m.modelDescription as modelo,
          vv.versionID,
          vv.versionDescription as version,
          c.categoryID,
          c.categoryDescription as categoria,
          CONCAT(
            b.brandBrand, ' ',
            m.modelDescription, ' ',
            vv.versionDescription, ' ',
            CAST(v.vehicleYear AS CHAR)
          ) as textoCompleto
        FROM tblvehicles v
        JOIN tblvehiclebrand b ON v.vehicleBrandID = b.brandID
        JOIN tblvehiclemodel m ON v.vehicleModelID = m.modelID
        JOIN tblvehicleversion vv ON v.vehicleVersionID = vv.versionID
        JOIN tblvehiclecategories c ON v.vehicleCategoryID = c.categoryID
        WHERE 
          CONCAT(
            b.brandBrand, ' ',
            m.modelDescription, ' ',
            vv.versionDescription, ' ',
            CAST(v.vehicleYear AS CHAR)
          ) LIKE ${searchTerm}
          OR b.brandBrand LIKE ${searchTerm}
          OR m.modelDescription LIKE ${searchTerm}
          OR vv.versionDescription LIKE ${searchTerm}
          OR CAST(v.vehicleYear AS CHAR) LIKE ${searchTerm}
        ORDER BY 
          v.vehicleYear DESC,
          b.brandBrand ASC,
          m.modelDescription ASC
        LIMIT ${limit}
      `

      // Formatear resultados para autocompletado
      const formattedResults = vehicles.map(v => ({
        vehicleID: Number(v.vehicleID),
        texto: String(v.textoCompleto), // Texto completo para mostrar en el autocompletado
        marca: {
          id: Number(v.brandID),
          nombre: String(v.marca),
        },
        modelo: {
          id: Number(v.modelID),
          nombre: String(v.modelo),
        },
        version: {
          id: Number(v.versionID),
          nombre: String(v.version),
        },
        categoria: {
          id: Number(v.categoryID),
          nombre: String(v.categoria),
        },
        año: Number(v.vehicleYear),
        precio: Number(v.vehiclePrice),
        imagen: v.imagen ? String(v.imagen) : null,
      }))

      return successResponse({
        data: formattedResults,
        total: formattedResults.length,
        query: query.trim(),
      })
    } catch (error) {
      return handleError(error)
    }
  })
}
