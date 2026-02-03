import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'
import { createCommunityMessageSchema, paginationSchema } from '@/utils/validations'
import { sanitizeText } from '@/utils/sanitize'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/communities/[id]/messages - Obtener mensajes de una comunidad
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    try {
      const { id } = await params
      const communityID = parseInt(id)
      const { searchParams } = new URL(request.url)
      const { page, limit } = paginationSchema.parse(
        Object.fromEntries(searchParams.entries())
      )

      const [messages, total] = await Promise.all([
        prisma.tblcommunitymessages.findMany({
          where: { messageCommunityID: communityID },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            tblusuarios: {
              select: {
                userId: true,
                userName: true,
                userPhotoURL: true,
              },
            },
          },
          orderBy: {
            messageDate: 'asc',
          },
        }),
        prisma.tblcommunitymessages.count({
          where: { messageCommunityID: communityID },
        }),
      ])

      return successResponse({
        data: messages,
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

// POST /api/communities/[id]/messages - Crear mensaje en comunidad
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const communityID = parseInt(id)
      const body = await request.json()

      // Verificar que el usuario pertenece a la comunidad
      const userInCommunity = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      if (!userInCommunity) {
        throw new ApiError(403, 'Debes ser miembro de la comunidad para publicar')
      }

      const validated = createCommunityMessageSchema.parse({
        ...body,
        messageCommunityID: communityID,
        messageUserId: authUserId,
      })

      // Sanitizar contenido del mensaje para prevenir XSS
      const sanitizedContent = sanitizeText(validated.messageContent)

      const message = await prisma.tblcommunitymessages.create({
        data: {
          messageContent: sanitizedContent,
          messageCommunityID: validated.messageCommunityID,
          messageUserId: validated.messageUserId,
          messageDate: new Date(),
        },
        include: {
          tblusuarios: {
            select: {
              userId: true,
              userName: true,
              userPhotoURL: true,
            },
          },
        },
      })

      return successResponse(message, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}
