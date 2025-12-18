import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { env } from './env'

export interface TokenPayload {
  userId: number
  email: string
  firebaseUID: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(request)
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}
