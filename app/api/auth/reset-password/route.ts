import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import bcrypt from 'bcryptjs'

// Mismo store temporal del forgot-password
// En producción, usar Redis o una tabla en la base de datos
import { resetCodes } from '../forgot-password/route'

/**
 * POST /api/auth/reset-password
 * Verifica el código y resetea la contraseña (solo para usuarios de login normal)
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json()

    console.log(' Reset Password Request:')
    console.log('  - Email:', email)
    console.log('  - Code:', code)
    console.log('  - Normalized email:', email.toLowerCase())

    // Validaciones
    if (!email || !code || !newPassword) {
      throw new ApiError(400, 'Email, código y nueva contraseña requeridos')
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'La contraseña debe tener al menos 6 caracteres')
    }

    // Verificar código
    console.log(' Verificando código...')
    console.log(' Emails en resetCodes:', Array.from(resetCodes.keys()))
    
    const storedData = resetCodes.get(email.toLowerCase())
    
    console.log(' Código guardado:', storedData?.code)
    console.log(' Código recibido:', code)
    console.log(' Coinciden?:', storedData?.code === code)

    if (!storedData) {
      console.error(' No se encontró código para:', email.toLowerCase())
      throw new ApiError(400, 'Código inválido o expirado')
    }

    if (new Date() > storedData.expiresAt) {
      console.error(' Código expirado para:', email.toLowerCase())
      resetCodes.delete(email.toLowerCase())
      throw new ApiError(400, 'El código ha expirado. Solicita uno nuevo')
    }

    if (storedData.code !== code) {
      console.error(' Código incorrecto. Esperado:', storedData.code, 'Recibido:', code)
      throw new ApiError(400, 'Código incorrecto')
    }

    // Verificar que el usuario existe
    const user = await prisma.tblusuarios.findUnique({
      where: { userEmail: email.toLowerCase() },
    })

    if (!user) {
      throw new ApiError(404, 'Usuario no encontrado')
    }

    // Verificar que es un usuario de login normal (no Google/Firebase)
    if (!user.userFirebaseUID.startsWith('local_')) {
      throw new ApiError(400, 'Esta cuenta usa autenticación de Google. Usa \"Olvidé mi contraseña\" en Google.')
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña en el campo mfaSecret
    await prisma.tblusuarios.update({
      where: { userId: user.userId },
      data: {
        mfaSecret: hashedPassword,
      },
    })

    // Eliminar código usado
    resetCodes.delete(email.toLowerCase())
    console.log(' Contraseña actualizada exitosamente para:', email.toLowerCase())

    return successResponse({
      message: 'Contraseña actualizada exitosamente',
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/auth/reset-password
 * Verifica si un código es válido (sin consumirlo)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const code = searchParams.get('code')

    if (!email || !code) {
      throw new ApiError(400, 'Email y código requeridos')
    }

    const storedData = resetCodes.get(email.toLowerCase())

    if (!storedData) {
      return successResponse({ valid: false, message: 'Código no encontrado' })
    }

    if (new Date() > storedData.expiresAt) {
      resetCodes.delete(email.toLowerCase())
      return successResponse({ valid: false, message: 'Código expirado' })
    }

    if (storedData.code !== code) {
      return successResponse({ valid: false, message: 'Código incorrecto' })
    }

    return successResponse({
      valid: true,
      message: 'Código válido',
      expiresIn: Math.floor((storedData.expiresAt.getTime() - Date.now()) / 1000),
    })
  } catch (error) {
    return handleError(error)
  }
}
