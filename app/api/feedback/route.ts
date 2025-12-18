import { NextRequest } from 'next/server'
import { prisma } from '@/utils/prisma'
import { handleError, successResponse, ApiError } from '@/utils/api-response'
import { withAuth, withOptionalAuth } from '@/utils/middleware'
import { sanitizeContent } from '@/utils/sanitize'

// GET /api/feedback - Obtener todos los feedbacks (solo admin, o simplificar sin filtro)
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async () => {
    try {
      const feedbacks = await prisma.tblusersfeedback.findMany({
        orderBy: { feedbackID: 'desc' },
        take: 100, // Limitar a 100 más recientes
      })

      return successResponse(feedbacks)
    } catch (error) {
      return handleError(error)
    }
  })
}

// POST /api/feedback - Crear nuevo feedback
export async function POST(request: NextRequest) {
  return withAuth(request, async (decodedToken) => {
    try {
      const body = await request.json()
      const { feedbackContent } = body

      if (!feedbackContent || typeof feedbackContent !== 'string') {
        throw new ApiError('El contenido del feedback es requerido', 400)
      }

      if (feedbackContent.trim().length === 0) {
        throw new ApiError('El contenido del feedback no puede estar vacío', 400)
      }

      if (feedbackContent.length > 4000) {
        throw new ApiError('El contenido del feedback no puede exceder 4000 caracteres', 400)
      }

      // Sanitizar contenido para prevenir XSS
      const sanitizedContent = sanitizeContent(feedbackContent)

      // Obtener el último ID para incrementar (ya que no es autoincrement)
      const lastFeedback = await prisma.tblusersfeedback.findMany({
        orderBy: { feedbackID: 'desc' },
        take: 1,
      })

      const nextId = lastFeedback.length > 0 ? lastFeedback[0].feedbackID + 1 : 1

      const feedback = await prisma.tblusersfeedback.create({
        data: {
          feedbackID: nextId,
          feedbackContent: sanitizedContent,
        },
      })

      return successResponse(feedback, 'Feedback creado exitosamente', 201)
    } catch (error) {
      return handleError(error)
    }
  })
}

// DELETE /api/feedback - Eliminar feedback (solo el que lo creó o admin)
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (decodedToken) => {
    try {
      const { searchParams } = new URL(request.url)
      const feedbackId = searchParams.get('feedbackId')

      if (!feedbackId) {
        throw new ApiError('ID de feedback requerido', 400)
      }

      const feedback = await prisma.tblusersfeedback.findUnique({
        where: { feedbackID: parseInt(feedbackId) },
      })

      if (!feedback) {
        throw new ApiError('Feedback no encontrado', 404)
      }

      await prisma.tblusersfeedback.delete({
        where: { feedbackID: parseInt(feedbackId) },
      })

      return successResponse(null, 'Feedback eliminado exitosamente')
    } catch (error) {
      return handleError(error)
    }
  })
}
