import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleError(error: unknown, logs: string[] = []) {
  console.error('API Error:', error)

  // Errores de validación Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Error de validación',
        details: error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        logs,
      },
      { status: 400 }
    )
  }

  // Errores personalizados de la API
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        logs,
      },
      { status: error.statusCode }
    )
  }

  // Errores de Prisma
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown }
    
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un registro con estos datos únicos', logs },
        { status: 409 }
      )
    }
    
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Registro no encontrado', logs },
        { status: 404 }
      )
    }
  }

  // Error genérico
  return NextResponse.json(
    {
      error: process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : error instanceof Error 
          ? error.message 
          : 'Error desconocido',
      logs,
    },
    { status: 500 }
  )
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}
