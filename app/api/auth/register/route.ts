import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { generateToken } from '@/utils/auth'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { uploadImage } from '@/utils/cloudinary'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schema de validación
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

/**
 * POST /api/auth/register - Registro tradicional con email/password + foto opcional
 * 
 * Crea usuario sin Google OAuth usando campos existentes del schema:
 * - userFirebaseUID: "local_" + email (para identificar usuarios locales)
 * - mfaSecret: hash de la contraseña (reutilizamos campo existente)
 * - userPhotoURL: URL de Cloudinary si se sube foto
 */

export async function POST(request: NextRequest) {
  try {
    // Detectar si es FormData (con imagen) o JSON
    const contentType = request.headers.get('content-type') || ''
    let email: string
    let password: string
    let name: string
    let photoFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      // Procesar FormData
      const formData = await request.formData()
      email = formData.get('email') as string
      password = formData.get('password') as string
      name = formData.get('name') as string
      photoFile = formData.get('photo') as File | null
    } else {
      // Procesar JSON
      const body = await request.json()
      email = body.email
      password = body.password
      name = body.name
    }

    // Validar datos
    const { email: validEmail, password: validPassword, name: validName } =
      registerSchema.parse({ email, password, name })

    // Verificar si el email ya existe
    const existingUser = await prisma.tblusuarios.findUnique({
      where: { userEmail: validEmail },
    })

    if (existingUser) {
      throw new ApiError(
        409,
        'Este correo ya está registrado. Por favor inicia sesión.'
      )
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(validPassword, 10)

    // Subir foto a Cloudinary si se proporcionó
    let photoURL: string | null = null
    if (photoFile && photoFile.size > 0) {
      try {
        const uploadResult = await uploadImage(photoFile, 'users/profiles')
        photoURL = uploadResult.url
      } catch (error) {
        console.error('Error al subir foto:', error)
        // Continuamos sin foto si falla la subida
      }
    }

    // Crear usuario usando campos existentes
    // - userFirebaseUID: "local_" + email para identificar usuarios sin Google
    // - mfaSecret: guardamos el hash del password aquí (reutilizamos campo existente)
    const user = await prisma.tblusuarios.create({
      data: {
        userEmail: validEmail,
        userName: validName,
        userFirebaseUID: `local_${validEmail}`, // Identificador único para usuarios locales
        mfaSecret: hashedPassword, // Reutilizamos este campo para guardar el hash
        userPhotoURL: photoURL,
        userAppVersion: '1',
        mfaEnabled: false,
      },
    })

    // Generar token JWT
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
        },
      },
      201
    )
  } catch (error) {
    return handleError(error)
  }
}
