# 🔥 Configuración de Firebase

## 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Agregar proyecto"
3. Ingresa el nombre de tu proyecto
4. Habilita Google Analytics (opcional)
5. Crea el proyecto

## 2. Habilitar autenticación de Google

1. En tu proyecto Firebase, ve a **Authentication** en el menú lateral
2. Clic en "Comenzar" si es la primera vez
3. Ve a la pestaña **Sign-in method**
4. Habilita **Google** como proveedor
5. Guarda los cambios

## 3. Configurar Firebase Admin SDK (Backend)

### Obtener credenciales:

1. Ve a **Configuración del proyecto** (ícono de engranaje) > **Cuentas de servicio**
2. Clic en **Generar nueva clave privada**
3. Se descargará un archivo JSON con tus credenciales

### Configurar variables de entorno:

**Opción A - Variables individuales (Recomendado):**

Abre el archivo JSON descargado y copia estos valores a tu `.env`:

```env
FIREBASE_PROJECT_ID="tu-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@tu-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA\n-----END PRIVATE KEY-----\n"
```

**Opción B - JSON completo:**

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...todo el contenido del JSON..."}'
```

## 4. Configurar Firebase en tu app móvil Expo

### Instalar dependencias:

```bash
npm install firebase expo-auth-session expo-web-browser
```

### Configuración Firebase (obtener config):

1. En Firebase Console, ve a **Configuración del proyecto**
2. En la sección "Tus apps", clic en el ícono de **</>** para web
3. Registra tu app y copia la configuración `firebaseConfig`

### Ejemplo de configuración en tu app Expo:

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
```

### Ejemplo de login con Google en Expo:

```typescript
import * as Google from 'expo-auth-session/providers/google'
import { auth } from './firebase.config'
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'

// En tu componente
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: 'TU_EXPO_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'TU_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'TU_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com',
})

// Cuando el usuario haga login
useEffect(() => {
  if (response?.type === 'success') {
    const { id_token } = response.params
    
    const credential = GoogleAuthProvider.credential(id_token)
    signInWithCredential(auth, credential)
      .then(async (result) => {
        // Obtener el Firebase ID Token
        const firebaseToken = await result.user.getIdToken()
        
        // Enviar al backend
        const backendResponse = await fetch('http://tu-api.com/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: firebaseToken })
        })
        
        const data = await backendResponse.json()
        // Guardar el token JWT de tu backend
        // await AsyncStorage.setItem('token', data.token)
      })
  }
}, [response])

// Botón de login
<Button title="Login con Google" onPress={() => promptAsync()} />
```

## 5. Obtener Client IDs para Expo

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto Firebase
3. Ve a **APIs y servicios** > **Credenciales**
4. Verás tu Web Client ID (el mismo que en Firebase)
5. Para crear IDs para iOS/Android:
   - Clic en **Crear credenciales** > **ID de cliente de OAuth 2.0**
   - Selecciona tipo de aplicación (iOS o Android)
   - Sigue las instrucciones específicas para cada plataforma

## 6. Testing

### Test en web:
```bash
npm run dev
```

### Test en Expo:
```bash
npx expo start
```

## 📝 Notas importantes

- **Seguridad**: Nunca subas tu archivo JSON de credenciales a Git
- **Production**: Usa variables de entorno en tu servidor de producción
- **Expo**: Necesitas configurar diferentes Client IDs para cada plataforma
- **Firebase Console**: Asegúrate de agregar dominios autorizados en la configuración de Firebase Auth

## 🔗 Enlaces útiles

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Expo Auth Session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
