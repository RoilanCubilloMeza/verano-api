import { NextRequest } from 'next/server'
import { GoogleUserInfo, verifyFirebaseToken } from '@/utils/google-auth'
import { prisma } from '@/utils/prisma'
import { generateToken } from '@/utils/auth'
import { handleError, successResponse, ApiError } from '@/utils/api-response'

/**
 * POST /api/auth/google - Autenticación con Firebase (Google)
 * 
 * Recibe un Firebase ID token, lo verifica y crea/actualiza el usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken) {
      throw new ApiError(400, 'Firebase ID token requerido')
    }

    // Verificar token de Firebase
    const googleUserInfo: GoogleUserInfo = await verifyFirebaseToken(idToken)

    // Buscar o crear usuario
    let user = await prisma.tblusuarios.findUnique({
      where: { userFirebaseUID: googleUserInfo.sub },
    })

    if (!user) {
      // Verificar si el email ya existe con otro método de autenticación
      const existingEmailUser = await prisma.tblusuarios.findUnique({
        where: { userEmail: googleUserInfo.email },
      })

      if (existingEmailUser) {
        // Si el usuario ya existe con email/password, vincular Google OAuth
        // Actualizar el userFirebaseUID para permitir login con ambos métodos
        user = await prisma.tblusuarios.update({
          where: { userId: existingEmailUser.userId },
          data: {
            userFirebaseUID: googleUserInfo.sub,
            userName: googleUserInfo.name || existingEmailUser.userName,
            userPhotoURL: googleUserInfo.picture || existingEmailUser.userPhotoURL,
          },
        })
      } else {
        // Crear nuevo usuario
        user = await prisma.tblusuarios.create({
          data: {
            userFirebaseUID: googleUserInfo.sub,
            userEmail: googleUserInfo.email,
            userName: googleUserInfo.name || googleUserInfo.email.split('@')[0],
            userPhotoURL: googleUserInfo.picture || null,
            userAppVersion: 'P', // P = Premium o F = Free
          },
        })
      }
    } else {
      // Actualizar información del usuario si cambió
      user = await prisma.tblusuarios.update({
        where: { userId: user.userId },
        data: {
          userName: googleUserInfo.name || user.userName,
          userPhotoURL: googleUserInfo.picture || user.userPhotoURL,
        },
      })
    }

    // Generar JWT
    const token = generateToken({
      userId: user.userId,
      email: user.userEmail,
      firebaseUID: user.userFirebaseUID,
    })

    return successResponse(
      {
        token,
        user: {
          userId: user.userId,
          email: user.userEmail,
          name: user.userName,
          photoURL: user.userPhotoURL,
          appVersion: user.userAppVersion,
        },
      },
      user ? 200 : 201
    )
  } catch (error) {
    return handleError(error)
  }
}
