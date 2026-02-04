import * as admin from 'firebase-admin'

export interface GoogleUserInfo {
  sub: string // Firebase UID
  email: string
  email_verified: boolean
  name?: string
  picture?: string
}

// Función para inicializar Firebase Admin de forma lazy
export function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      // Opción 1: Usando variable de entorno con JSON
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        })
      }
      // Opción 2: Usando archivo JSON (para desarrollo)
      else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        admin.initializeApp({
          credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
        })
      }
      // Opción 3: Variables individuales
      else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        })
      } else {
        throw new Error('Variables de Firebase no configuradas')
      }
    } catch (error) {
      console.error('Error inicializando Firebase Admin:', error)
      throw new Error('Firebase Admin no está configurado correctamente')
    }
  }
  return admin
}

/**
 * Verifica el token de Firebase y devuelve la información del usuario
 */
export async function verifyFirebaseToken(token: string): Promise<GoogleUserInfo> {
  try {
    const firebaseAdmin = initializeFirebaseAdmin()
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token)

    if (!decodedToken.email_verified) {
      throw new Error('Email no verificado')
    }

    return {
      sub: decodedToken.uid,
      email: decodedToken.email!,
      email_verified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    }
  } catch (error) {
    console.error('Error verificando token de Firebase:', error)
    throw new Error('Token de Firebase inválido o expirado')
  }
}

/**
 * Obtiene un usuario de Firebase por UID
 */
export async function getFirebaseUser(uid: string) {
  try {
    const firebaseAdmin = initializeFirebaseAdmin()
    return await firebaseAdmin.auth().getUser(uid)
  } catch (error) {
    console.error('Error obteniendo usuario de Firebase:', error)
    throw new Error('Usuario no encontrado en Firebase')
  }
}

/**
 * Crea un custom token de Firebase (útil para testing o admin)
 */
export async function createCustomToken(uid: string) {
  try {
    const firebaseAdmin = initializeFirebaseAdmin()
    return await firebaseAdmin.auth().createCustomToken(uid)
  } catch (error) {
    console.error('Error creando custom token:', error)
    throw new Error('Error creando token personalizado')
  }
}
