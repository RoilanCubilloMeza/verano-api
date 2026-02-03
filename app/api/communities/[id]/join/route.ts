import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth } from '@/utils/middleware'
import { deleteImage } from '@/utils/cloudinary'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/communities/[id]/join - Unirse a una comunidad
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const communityID = parseInt(id)

      // Verificar que la comunidad existe
      const community = await prisma.tblcommunities.findUnique({
        where: { communityID },
      })

      if (!community) {
        throw new ApiError(404, 'Comunidad no encontrada')
      }

      // Verificar si ya es miembro
      const existingMember = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      if (existingMember) {
        throw new ApiError(400, 'Ya eres miembro de esta comunidad')
      }

      // Unirse a la comunidad
      await prisma.tblcommunityusers.create({
        data: {
          commUserCommunityID: communityID,
          commUserUserId: authUserId,
          commUserAdmin: 'N',
        },
      })

      return successResponse({ message: 'Te has unido a la comunidad' }, 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/communities/[id]/join - Salir de una comunidad
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const communityID = parseInt(id)

      // Verificar que el usuario es miembro
      const member = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      if (!member) {
        throw new ApiError(400, 'No eres miembro de esta comunidad')
      }

      // Contar total de miembros
      const totalMembers = await prisma.tblcommunityusers.count({
        where: { commUserCommunityID: communityID },
      })

      // Si es el único miembro, eliminar toda la comunidad
      if (totalMembers === 1) {
        // Obtener la comunidad para eliminar su imagen de Cloudinary
        const community = await prisma.tblcommunities.findUnique({
          where: { communityID },
          select: { communityImageURL: true },
        })

        // Eliminar imagen de Cloudinary si existe
        if (community?.communityImageURL) {
          try {
            await deleteImage(community.communityImageURL)
          } catch (error) {
            console.error('Error al eliminar imagen de Cloudinary:', error)
            // Continuar con la eliminación aunque falle la imagen
          }
        }

        // Eliminar toda la información del grupo
        await prisma.$transaction([
          // Eliminar mensajes
          prisma.tblcommunitymessages.deleteMany({
            where: { messageCommunityID: communityID },
          }),
          // Eliminar miembros
          prisma.tblcommunityusers.deleteMany({
            where: { commUserCommunityID: communityID },
          }),
          // Eliminar comunidad (nombre, ubicación, etc.)
          prisma.tblcommunities.delete({
            where: { communityID },
          }),
        ])

        return successResponse({ 
          message: 'Has salido de la comunidad. Como eras el único miembro, la comunidad y todos sus datos han sido eliminados.' 
        })
      }

      // Si es admin y hay otros miembros
      if (member.commUserAdmin === 'Y') {
        // Buscar otro miembro para hacer admin
        const newAdmin = await prisma.tblcommunityusers.findFirst({
          where: {
            commUserCommunityID: communityID,
            commUserUserId: { not: authUserId },
          },
          orderBy: {
            commUserUserId: 'asc', // El miembro más antiguo
          },
        })

        if (newAdmin) {
          // Transferir admin al siguiente miembro
          await prisma.tblcommunityusers.update({
            where: {
              commUserCommunityID_commUserUserId: {
                commUserCommunityID: communityID,
                commUserUserId: newAdmin.commUserUserId,
              },
            },
            data: { commUserAdmin: 'Y' },
          })
        }
      }

      // Eliminar al usuario de la comunidad
      await prisma.tblcommunityusers.delete({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      return successResponse({ message: 'Has salido de la comunidad' })
    } catch (error) {
      return handleError(error)
    }
  })
}

// PATCH /api/communities/[id]/join - Transferir admin a otro usuario
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req, authUserId) => {
    try {
      const { id } = await params
      const communityID = parseInt(id)
      const body = await request.json()
      const { newAdminUserId } = body

      if (!newAdminUserId) {
        throw new ApiError(400, 'Se requiere el ID del nuevo administrador')
      }

      // Verificar que el usuario actual es admin
      const currentAdmin = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: authUserId,
          },
        },
      })

      if (!currentAdmin || currentAdmin.commUserAdmin !== 'Y') {
        throw new ApiError(403, 'Solo el administrador puede transferir el rol')
      }

      // Verificar que el nuevo admin es miembro de la comunidad
      const newAdmin = await prisma.tblcommunityusers.findUnique({
        where: {
          commUserCommunityID_commUserUserId: {
            commUserCommunityID: communityID,
            commUserUserId: newAdminUserId,
          },
        },
      })

      if (!newAdmin) {
        throw new ApiError(400, 'El usuario no es miembro de esta comunidad')
      }

      // Transferir admin
      await prisma.$transaction([
        // Quitar admin al usuario actual
        prisma.tblcommunityusers.update({
          where: {
            commUserCommunityID_commUserUserId: {
              commUserCommunityID: communityID,
              commUserUserId: authUserId,
            },
          },
          data: { commUserAdmin: 'N' },
        }),
        // Dar admin al nuevo usuario
        prisma.tblcommunityusers.update({
          where: {
            commUserCommunityID_commUserUserId: {
              commUserCommunityID: communityID,
              commUserUserId: newAdminUserId,
            },
          },
          data: { commUserAdmin: 'Y' },
        }),
      ])

      return successResponse({ 
        message: 'Rol de administrador transferido exitosamente' 
      })
    } catch (error) {
      return handleError(error)
    }
  })
}
