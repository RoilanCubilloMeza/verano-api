import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'

interface RouteParams {
  params: Promise<{ id: string; communityId: string }>
}

// GET /api/users/[id]/communities/[communityId]/messages - Obtener mensajes de una comunidad con paginación
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async () => {
    try {
      const { id, communityId } = await params
      const userIdNum = parseInt(id)
      const communityID = parseInt(communityId)

      if (isNaN(communityID)) {
        throw new ApiError(400, 'ID de comunidad inválido')
      }

      // Verificar que el usuario pertenece a la comunidad
      const isMember = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: userIdNum,
          },
        },
        select: {
          commUserAdmin: true,
        },
      })

      if (!isMember) {
        throw new ApiError(403, 'No eres miembro de esta comunidad')
      }

      // Obtener parámetros de paginación
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = 10 // Cargar 10 mensajes por vez
      const skip = (page - 1) * limit

      const isUserAdmin = isMember.commUserAdmin === 'S' || isMember.commUserAdmin === '1'

      // Obtener mensajes con paginación (más recientes primero)
      const [messages, total] = await Promise.all([
        prisma.tblcommunitymessages.findMany({
          where: { messageCommunityID: communityID },
          skip,
          take: limit,
          orderBy: {
            messageDate: 'desc', // Más recientes primero
          },
          select: {
            messageID: true,
            messageContent: true,
            messageDate: true,
            messageUserId: true,
            tblusuarios: {
              select: {
                userId: true,
                userName: true,
                userPhotoURL: true,
              },
            },
          },
        }),
        prisma.tblcommunitymessages.count({
          where: { messageCommunityID: communityID },
        }),
      ])

      // Formatear respuesta
      const formattedMessages = messages.map(message => ({
        messageID: message.messageID,
        contenido: message.messageContent,
        fecha: message.messageDate,
        usuario: {
          id: message.tblusuarios.userId,
          nombre: message.tblusuarios.userName,
          imagen: message.tblusuarios.userPhotoURL,
        },
        // Indicar si el usuario actual puede eliminar este mensaje
        puedeEliminar: isUserAdmin || message.messageUserId === userIdNum,
      }))

      return successResponse({
        data: formattedMessages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hayMas: page < Math.ceil(total / limit),
        },
        esAdmin: isUserAdmin,
      })
    } catch (error) {
      return handleError(error)
    }
  })
}

// POST /api/users/[id]/communities/[communityId]/messages - Enviar mensaje a la comunidad
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id, communityId } = await params
      const userIdNum = parseInt(id)
      const communityID = parseInt(communityId)

      if (userIdNum !== authUserId) {
        throw new ApiError(403, 'No autorizado')
      }

      if (isNaN(communityID)) {
        throw new ApiError(400, 'ID de comunidad inválido')
      }

      const body = await request.json()
      const { mensaje } = body

      if (!mensaje || mensaje.trim().length === 0) {
        throw new ApiError(400, 'El mensaje no puede estar vacío')
      }

      if (mensaje.length > 4000) {
        throw new ApiError(400, 'El mensaje no puede exceder 4000 caracteres')
      }

      // Verificar que el usuario pertenece a la comunidad
      const isMember = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: userIdNum,
          },
        },
      })

      if (!isMember) {
        throw new ApiError(403, 'No eres miembro de esta comunidad')
      }

      // Crear el mensaje
      const newMessage = await prisma.tblcommunitymessages.create({
        data: {
          messageContent: mensaje.trim(),
          messageDate: new Date(),
          messageCommunityID: communityID,
          messageUserId: userIdNum,
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

      return successResponse(
        {
          messageID: newMessage.messageID,
          contenido: newMessage.messageContent,
          fecha: newMessage.messageDate,
          usuario: {
            id: newMessage.tblusuarios.userId,
            nombre: newMessage.tblusuarios.userName,
            imagen: newMessage.tblusuarios.userPhotoURL,
          },
          puedeEliminar: true,
        },
        201
      )
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/users/[id]/communities/[communityId]/messages?messageID=X - Eliminar mensaje
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id, communityId } = await params
      const userIdNum = parseInt(id)
      const communityID = parseInt(communityId)

      if (userIdNum !== authUserId) {
        throw new ApiError(403, 'No autorizado')
      }

      const { searchParams } = new URL(request.url)
      const messageID = parseInt(searchParams.get('messageID') || '0')

      if (!messageID) {
        throw new ApiError(400, 'ID de mensaje requerido')
      }

      // Obtener el mensaje
      const message = await prisma.tblcommunitymessages.findUnique({
        where: { messageID },
        select: {
          messageCommunityID: true,
          messageUserId: true,
        },
      })

      if (!message) {
        throw new ApiError(404, 'Mensaje no encontrado')
      }

      if (message.messageCommunityID !== communityID) {
        throw new ApiError(400, 'El mensaje no pertenece a esta comunidad')
      }

      // Verificar si es admin o autor del mensaje
      const userInCommunity = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: userIdNum,
          },
        },
        select: {
          commUserAdmin: true,
        },
      })

      if (!userInCommunity) {
        throw new ApiError(403, 'No eres miembro de esta comunidad')
      }

      const isAdmin = userInCommunity.commUserAdmin === 'S' || userInCommunity.commUserAdmin === '1'
      const isAuthor = message.messageUserId === userIdNum

      if (!isAdmin && !isAuthor) {
        throw new ApiError(403, 'Solo el admin o el autor pueden eliminar este mensaje')
      }

      // Eliminar el mensaje
      await prisma.tblcommunitymessages.delete({
        where: { messageID },
      })

      return successResponse({ message: 'Mensaje eliminado exitosamente' })
    } catch (error) {
      return handleError(error)
    }
  })
}
// PATCH /api/users/[id]/communities/[communityId]/messages?messageID=X - Editar mensaje
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id, communityId } = await params
      const userIdNum = parseInt(id)
      const communityID = parseInt(communityId)

      if (userIdNum !== authUserId) {
        throw new ApiError(403, 'No autorizado')
      }

      const { searchParams } = new URL(request.url)
      const messageID = parseInt(searchParams.get('messageID') || '0')

      if (!messageID) {
        throw new ApiError(400, 'ID de mensaje requerido')
      }

      const body = await request.json()
      const { mensaje } = body

      if (!mensaje || mensaje.trim().length === 0) {
        throw new ApiError(400, 'El mensaje no puede estar vacío')
      }

      if (mensaje.length > 4000) {
        throw new ApiError(400, 'El mensaje no puede exceder 4000 caracteres')
      }

      // Obtener el mensaje
      const message = await prisma.tblcommunitymessages.findUnique({
        where: { messageID },
        select: {
          messageCommunityID: true,
          messageUserId: true,
        },
      })

      if (!message) {
        throw new ApiError(404, 'Mensaje no encontrado')
      }

      if (message.messageCommunityID !== communityID) {
        throw new ApiError(400, 'El mensaje no pertenece a esta comunidad')
      }

      // Solo el autor puede editar su propio mensaje
      if (message.messageUserId !== userIdNum) {
        throw new ApiError(403, 'Solo el autor puede editar su mensaje')
      }

      // Actualizar el mensaje
      const updatedMessage = await prisma.tblcommunitymessages.update({
        where: { messageID },
        data: {
          messageContent: mensaje.trim(),
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

      return successResponse({
        messageID: updatedMessage.messageID,
        contenido: updatedMessage.messageContent,
        fecha: updatedMessage.messageDate,
        usuario: {
          id: updatedMessage.tblusuarios.userId,
          nombre: updatedMessage.tblusuarios.userName,
          imagen: updatedMessage.tblusuarios.userPhotoURL,
        },
        puedeEliminar: true,
      })
    } catch (error) {
      return handleError(error)
    }
  })
}