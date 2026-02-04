import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { generateOTP, sendPasswordResetEmail } from '@/utils/email'
import { handleError, successResponse, ApiError } from '@/utils/api-response'

// Store temporal de códigos de recuperación
// En producción, usar Redis o una tabla en la base de datos
export const resetCodes = new Map<string, { code: string; expiresAt: Date }>()

/**
 * POST /api/auth/forgot-password
 * Solicita un código de recuperación de contraseña (solo para usuarios de login normal)
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      throw new ApiError(400, 'Email requerido')
    }

    // Verificar que el usuario existe
    const user = await prisma.tblusuarios.findUnique({
      where: { userEmail: email.toLowerCase() },
    })

    if (!user) {
      // Por seguridad, no revelar si el usuario existe
      return successResponse({
        message: 'Si el email existe, recibirás un código de recuperación'
      })
    }

    // Verificar que es un usuario de login normal (no Google/Firebase)
    if (!user.userFirebaseUID.startsWith('local_')) {
      // Por seguridad, devolver el mismo mensaje
      return successResponse({
        message: 'Si el email existe, recibirás un código de recuperación'
      })
    }

    // Generar código de 6 dígitos
    const resetCode = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    // Guardar código temporal
    resetCodes.set(email.toLowerCase(), { code: resetCode, expiresAt })

    // Enviar email con el código
    await sendPasswordResetEmail(email, resetCode, user.userName || 'Usuario')

    return successResponse({
      message: 'Código de recuperación enviado a tu email',
      expiresIn: '15 minutos'
    })
  } catch (error) {
    return handleError(error)
  }
}

