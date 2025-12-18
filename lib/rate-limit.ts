import { RateLimiterMemory } from 'rate-limiter-flexible'
import { NextRequest, NextResponse } from 'next/server'
import { env } from './env'

// Rate limiter global
const rateLimiter = new RateLimiterMemory({
  points: env.RATE_LIMIT_MAX, // Número de requests
  duration: env.RATE_LIMIT_WINDOW_MS / 1000, // Ventana de tiempo en segundos
})

// Rate limiter estricto para operaciones sensibles
const strictRateLimiter = new RateLimiterMemory({
  points: 10, // Solo 10 requests
  duration: 60, // por minuto
})

export async function rateLimit(request: NextRequest, strict = false): Promise<boolean> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const limiter = strict ? strictRateLimiter : rateLimiter
    await limiter.consume(ip)
    return true
  } catch {
    return false
  }
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: 'Demasiadas solicitudes. Por favor, intenta más tarde.' },
    { 
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    }
  )
}
