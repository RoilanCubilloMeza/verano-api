import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export interface GoogleUserInfo {
  sub: string // Google User ID (será nuestro userFirebaseUID)
  email: string
  email_verified: boolean
  name?: string
  picture?: string
}

/**
 * Verifica el token de Google y devuelve la información del usuario
 */
export async function verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload) {
      throw new Error('Token payload vacío')
    }

    if (!payload.email_verified) {
      throw new Error('Email no verificado por Google')
    }

    return {
      sub: payload.sub,
      email: payload.email!,
      email_verified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
    }
  } catch (error) {
    throw new Error('Token de Google inválido o expirado')
  }
}

/**
 * Genera URL de autenticación de Google
 */
export function getGoogleAuthUrl(redirectUri: string): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  
  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  }

  const qs = new URLSearchParams(options)

  return `${rootUrl}?${qs.toString()}`
}

/**
 * Obtiene tokens de Google usando el código de autorización
 */
export async function getGoogleTokens(code: string, redirectUri: string) {
  const url = 'https://oauth2.googleapis.com/token'

  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(values),
  })

  if (!response.ok) {
    throw new Error('Error al obtener tokens de Google')
  }

  return response.json()
}
