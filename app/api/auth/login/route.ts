import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { generateToken } from '@/utils/auth'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateOTP, sendOTPEmail } from '@/utils/email'

// Array para almacenar logs de la sesión actual
let sessionLogs: string[] = []

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  const logMessage = `[${timestamp}] ${message}`
  sessionLogs.push(logMessage)
}

// Schema de validación para login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// Schema de validación para verificar OTP
const verifyOTPSchema = z.object({
  email: z.string().email('Email inválido'),
  otp: z.string().length(6, 'El código OTP debe tener 6 dígitos'),
})

/**
 * Verificar OTP y generar token
 */
async function verifyOTP(body: unknown) {
  try {
    const { email, otp } = verifyOTPSchema.parse(body)
    addLog('🔍 Verificando OTP...')
    addLog(`✉️ Email: ${email}`)

    // Buscar usuario
    addLog('🔎 Buscando usuario en BD...')
    const user = await prisma.tblusuarios.findUnique({
      where: { userEmail: email },
    })

    if (!user) {
      addLog(`❌ Usuario no encontrado: ${email}`)
      throw new ApiError(401, 'Código de verificación inválido o expirado')
    }

    addLog(`✅ Usuario encontrado: ${user.userName}`)

    if (!user.mfaBackupCodes) {
      addLog(`❌ No hay OTP guardado para ${email}`)
      throw new ApiError(401, 'Código de verificación inválido o expirado')
    }

    // Parsear OTP guardado
    const [prefix, savedOTP, expiryStr] = user.mfaBackupCodes.split(':')
    addLog(`📦 OTP en BD: ${savedOTP}`)
    addLog(`🔐 OTP enviado: ${otp}`)
    
    if (prefix !== 'OTP') {
      addLog(`❌ Formato inválido en BD: ${prefix}`)
      throw new ApiError(401, 'Código de verificación inválido')
    }

    // Verificar expiración
    const expiry = parseInt(expiryStr)
    const now = Date.now()
    const timeLeft = expiry - now
    
    addLog(`⏰ Expiración: ${new Date(expiry).toISOString()}`)
    addLog(`⏱️ Tiempo restante: ${Math.round(timeLeft / 1000)}s`)
    
    if (now > expiry) {
      addLog(`❌ OTP expirado`)
      // Limpiar OTP expirado
      await prisma.tblusuarios.update({
        where: { userId: user.userId },
        data: { mfaBackupCodes: null },
      })
      throw new ApiError(401, 'El código de verificación ha expirado. Por favor solicita uno nuevo.')
    }

    // Verificar código
    if (otp !== savedOTP) {
      addLog(`❌ OTP incorrecto: esperado ${savedOTP}, recibido ${otp}`)
      throw new ApiError(401, 'Código de verificación incorrecto')
    }

    addLog(`✅ OTP correcto!`)

    // Limpiar OTP usado
    addLog('🗑️ Limpiando OTP usado...')
    await prisma.tblusuarios.update({
      where: { userId: user.userId },
      data: { mfaBackupCodes: null },
    })

    // Generar token JWT
    addLog('🔑 Generando token JWT...')
    const token = generateToken({
      userId: user.userId,
      email: user.userEmail,
      firebaseUID: user.userFirebaseUID,
    })

    addLog(`✅ Token generado`)
    addLog(`🎉 Login exitoso para ${email}`)

    return successResponse({
      token,
      user: {
        userId: user.userId,
        email: user.userEmail,
        name: user.userName,
        photoURL: user.userPhotoURL,
      },
      logs: sessionLogs,
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return handleError(error, sessionLogs)
    }
    return handleError(new ApiError(500, 'Error verificando OTP'), sessionLogs)
  }
}

/**
 * POST /api/auth/login - Login tradicional con email/password + OTP
 * 
 * Paso 1: Verificar credenciales y enviar OTP
 * Paso 2: Verificar OTP y generar token
 */
export async function POST(request: NextRequest) {
  sessionLogs = [] // Reiniciar logs para cada nueva solicitud
  try {
    const body = await request.json()
    addLog('📨 Request recibido')
    
    // Si incluye OTP, es el paso 2 (verificación)
    if (body.otp) {
      addLog('🔍 Detectado OTP en body - Paso 2 (Verificación)')
      return await verifyOTP(body)
    }
    
    // Paso 1: Verificar credenciales
    addLog('📋 Paso 1: Verificando credenciales')
    const { email, password } = loginSchema.parse(body)
    addLog(`✉️ Email: ${email}`)

    // Buscar usuario por email
    addLog('🔎 Buscando usuario en BD...')
    const user = await prisma.tblusuarios.findUnique({
      where: { userEmail: email },
    })

    if (!user) {
      addLog(`❌ Usuario no encontrado: ${email}`)
      throw new ApiError(401, 'Credenciales inválidas')
    }
    
    addLog(`✅ Usuario encontrado: ${user.userName}`)

    // Verificar que es un usuario local (no de Google)
    if (!user.userFirebaseUID.startsWith('local_')) {
      addLog('❌ Usuario registrado con Google')
      throw new ApiError(
        400,
        'Este correo está registrado con Google. Por favor inicia sesión con Google.'
      )
    }

    // Verificar contraseña
    if (!user.mfaSecret) {
      addLog('❌ Error: No hay contraseña guardada')
      throw new ApiError(500, 'Error en la configuración de la cuenta')
    }

    addLog('🔐 Verificando contraseña...')
    const isPasswordValid = await bcrypt.compare(password, user.mfaSecret)

    if (!isPasswordValid) {
      addLog('❌ Contraseña incorrecta')
      throw new ApiError(401, 'Credenciales inválidas')
    }
    
    addLog('✅ Contraseña correcta')

    // Generar código OTP
    addLog('🎲 Generando OTP...')
    const otpCode = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutos

    addLog(`📝 OTP generado: ${otpCode}`)
    addLog(`⏰ Expira en: ${otpExpiry.toISOString()}`)

    // Guardar OTP en mfaBackupCodes (reutilizamos campo existente)
    // Formato: "OTP:codigo:timestamp"
    const otpData = `OTP:${otpCode}:${otpExpiry.getTime()}`
    addLog(`💾 Guardando en BD: ${otpData}`)
    
    await prisma.tblusuarios.update({
      where: { userId: user.userId },
      data: {
        mfaBackupCodes: otpData,
      },
    })

    addLog(`✅ OTP guardado correctamente`)

    // Enviar OTP por email
    addLog(`📧 Enviando OTP a ${email}...`)
    await sendOTPEmail(email, otpCode, user.userName || undefined)
    
    addLog(`✅ OTP enviado`)
    addLog(`⏳ Esperando verificación del usuario...`)

    return successResponse({
      message: 'Código OTP enviado. Por favor, verifica tu email.',
      requiresOTP: true,
      logs: sessionLogs,
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return handleError(error, sessionLogs)
    }
    console.error('Error en login:', error)
    return handleError(new ApiError(500, 'Error en el proceso de login'), sessionLogs)
  }
}
