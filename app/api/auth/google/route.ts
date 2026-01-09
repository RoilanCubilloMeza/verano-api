import { NextRequest } from 'next/server'
import { GoogleUserInfo, verifyGoogleToken } from '@/utils/google-auth'
import { prisma } from '@/utils/prisma'
import { generateToken } from '@/utils/auth'
import { handleError, successResponse, ApiError } from '@/utils/api-response'

/**
 * POST /api/auth/google - Autenticación con Google
 * 
 * Recibe un token ID de Google, lo verifica y crea/actualiza el usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken, googleUser, accessToken } = body

    let googleUserInfo: GoogleUserInfo

    if (idToken) {
      // Método original: verificar ID token
      googleUserInfo = await verifyGoogleToken(idToken)
    } else if (googleUser && accessToken) {
      // Método alternativo: usar datos directos de Google
      googleUserInfo = {
        sub: googleUser.id,
        email: googleUser.email,
        email_verified: googleUser.verified_email,
        name: googleUser.name,
        picture: googleUser.picture,
      }
    } else {
      throw new ApiError(400, 'Token de Google o datos de usuario requeridos')
    }

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
        throw new ApiError(
          409,
          'Este correo ya está registrado con otro método. Por favor inicia sesión con tu contraseña.'
        )
      }

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
