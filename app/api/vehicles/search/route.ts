import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { Prisma } from '@prisma/client'

// GET /api/vehicles/search - Búsqueda de vehículos con autocompletado mejorado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limitParam = parseInt(searchParams.get('limit') || '10')
    const limit = Math.min(limitParam, 50) // Máximo 50 resultados

    if (!query || query.trim().length < 2) {
      return successResponse({
        data: [],
        total: 0,
        message: 'Ingresa al menos 2 caracteres para buscar',
      })
    }

    const searchTerm = query.trim()
    const searchPattern = `%${searchTerm}%`
    const yearSearch = parseInt(query.trim())

    // Construir query base
    let sqlQuery = Prisma.sql`
      SELECT 
        v.vehicleID,
        v.vehicleBrandID,
        v.vehicleModelID,
        v.vehicleVersionID,
        v.vehicleCategoryID,
        v.vehicleYear,
        v.vehiclePrice,
        v.vehicleImageURL,
        b.brandID,
        b.brandBrand,
        m.modelID,
        m.modelDescription,
        ver.versionID,
        ver.versionDescription,
        c.categoryID,
        c.categoryDescription
      FROM tblvehicles v
      LEFT JOIN tblvehiclebrand b ON v.vehicleBrandID = b.brandID
      LEFT JOIN tblvehiclemodel m ON v.vehicleModelID = m.modelID
      LEFT JOIN tblvehicleversion ver ON v.vehicleVersionID = ver.versionID
      LEFT JOIN tblvehiclecategories c ON v.vehicleCategoryID = c.categoryID
      WHERE (
        LOWER(b.brandBrand) LIKE LOWER(${searchPattern})
        OR LOWER(m.modelDescription) LIKE LOWER(${searchPattern})
        OR LOWER(ver.versionDescription) LIKE LOWER(${searchPattern})
    `

    // Agregar búsqueda por año si es válido
    if (!isNaN(yearSearch) && yearSearch > 1900 && yearSearch < 2100) {
      sqlQuery = Prisma.sql`${sqlQuery} OR v.vehicleYear = ${yearSearch}`
    }

    // Completar query con ORDER BY y LIMIT
    sqlQuery = Prisma.sql`${sqlQuery}
      )
      ORDER BY v.vehicleYear DESC, b.brandBrand ASC, m.modelDescription ASC
      LIMIT ${limit}
    `

    // Ejecutar query
    const vehicles = await prisma.$queryRaw<
      Array<{
        vehicleID: number
        vehicleBrandID: number
        vehicleModelID: number
        vehicleVersionID: number
        vehicleCategoryID: number
        vehicleYear: number
        vehiclePrice: number | null
        vehicleImageURL: string | null
        brandID: number
        brandBrand: string
        modelID: number
        modelDescription: string
        versionID: number
        versionDescription: string
        categoryID: number
        categoryDescription: string
      }>
    >(sqlQuery)

    // Formatear resultados para autocompletado
    const formattedResults = vehicles.map(v => ({
      vehicleID: v.vehicleID,
      texto: `${v.brandBrand} ${v.modelDescription} ${v.versionDescription} ${v.vehicleYear}`,
      marca: {
        id: v.brandID,
        nombre: v.brandBrand,
      },
      modelo: {
        id: v.modelID,
        nombre: v.modelDescription,
      },
      version: {
        id: v.versionID,
        nombre: v.versionDescription,
      },
      categoria: {
        id: v.categoryID,
        nombre: v.categoryDescription,
      },
      año: v.vehicleYear,
      precio: v.vehiclePrice,
      imagen: v.vehicleImageURL || null,
    }))

    return successResponse({
      data: formattedResults,
      total: formattedResults.length,
      query: searchTerm,
    })
  } catch (error) {
    console.error('Error en búsqueda:', error)
    return handleError(error)
  }
}
