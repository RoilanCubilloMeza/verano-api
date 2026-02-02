import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'
import { createCommunitySchema } from '@/utils/validations'
import { paginationSchema } from '@/utils/validations'
import { uploadImage } from '@/utils/cloudinary'

// GET /api/communities - Obtener todas las comunidades
export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit } = paginationSchema.parse(
        Object.fromEntries(searchParams.entries())
      )

      const [communities, total] = await Promise.all([
        prisma.tblcommunities.findMany({
          skip: (page - 1) * limit,
          take: limit,
          include: {
            _count: {
              select: {
                tblcommunityusers: true,
                tblcommunitymessages: true,
              },
            },
          },
          orderBy: {
            communityID: 'desc',
          },
        }),
        prisma.tblcommunities.count(),
      ])

      return successResponse({
        data: communities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      return handleError(error)
    }
  })
}

// POST /api/communities - Crear nueva comunidad
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const formData = await request.formData()
      
      // Extraer datos del formulario
      const communityName = formData.get('communityName') as string
      const communityLocationLat = formData.get('communityLocationLat') as string | null
      const communityLocationLon = formData.get('communityLocationLon') as string | null
      const imageFile = formData.get('image') as File | null

      // Validar datos básicos
      const validated = createCommunitySchema.parse({
        communityName,
        communityLocationLat,
        communityLocationLon,
      })

      // Subir imagen a Cloudinary si existe
      let imageURL: string | null = null
      if (imageFile && imageFile.size > 0) {
        const uploadResult = await uploadImage(imageFile, 'communities')
        imageURL = uploadResult.url
      }

      // Crear comunidad y agregar al creador como administrador
      const community = await prisma.tblcommunities.create({
        data: {
          ...validated,
          communityImageURL: imageURL,
          tblcommunityusers: {
            create: {
              commUserUserId: authUserId,
              commUserAdmin: 'Y',
            },
          },
        },
        include: {
          _count: {
            select: {
              tblcommunityusers: true,
              tblcommunitymessages: true,
            },
          },
        },
      })

      return successResponse(community, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}
