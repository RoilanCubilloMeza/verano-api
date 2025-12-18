# 🚗 Sistema de Gestión de Vehículos - API REST

API REST completa, segura y optimizada para gestión de vehículos, usuarios, comunidades y opiniones. Construida con Next.js 16, Prisma ORM y MySQL.

## 🌟 Características

- ✅ **Autenticación JWT** segura
- ✅ **Rate Limiting** para protección contra abusos
- ✅ **Validación exhaustiva** con Zod
- ✅ **Sanitización XSS** en contenido de usuarios
- ✅ **Consultas optimizadas** con Prisma
- ✅ **TypeScript** con tipos fuertes
- ✅ **Documentación completa** de la API
- ✅ **15+ endpoints** RESTful
- ✅ **14 tablas** de base de datos integradas

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` con las siguientes variables:

```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_base_datos"
JWT_SECRET="genera-un-secreto-aleatorio-seguro-aqui"
JWT_EXPIRES_IN="7d"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
NODE_ENV="development"
```

⚠️ **IMPORTANTE**: Cambia `JWT_SECRET` en producción a un valor aleatorio y seguro.

### 3. Generar cliente Prisma

```bash
npm run prisma:generate
```

### 4. Ejecutar el servidor

```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

### 5. Probar la API

```bash
npm run test-api
```

## 📚 Documentación

- **[utils/api-client-example.ts](utils/api-client-example.ts)** - Ejemplos de uso del cliente

## 🔑 Endpoints Principales

### Públicos (sin autenticación)

```
POST   /api/users              # Crear usuario (retorna JWT)
GET    /api/brands             # Obtener marcas
GET    /api/categories         # Obtener categorías
GET    /api/vehicles           # Buscar vehículos (filtros avanzados)
GET    /api/vehicles/:id       # Detalle de vehículo
```

### Protegidos (requieren JWT)

```
GET    /api/users              # Listar usuarios
GET    /api/users/:id          # Perfil de usuario
PATCH  /api/users/:id          # Actualizar usuario
DELETE /api/users/:id          # Eliminar usuario

POST   /api/users/:id/favorites         # Agregar a favoritos
GET    /api/users/:id/favorites         # Obtener favoritos
DELETE /api/users/:id/favorites         # Eliminar de favoritos

POST   /api/vehicles/:id/opinions       # Crear/actualizar opinión
GET    /api/vehicles/:id/opinions       # Obtener opiniones

GET    /api/communities                 # Listar comunidades
POST   /api/communities                 # Crear comunidad
GET    /api/communities/:id             # Detalle de comunidad
DELETE /api/communities/:id             # Eliminar comunidad

POST   /api/communities/:id/join        # Unirse a comunidad
DELETE /api/communities/:id/join        # Salir de comunidad

GET    /api/communities/:id/messages    # Obtener mensajes
POST   /api/communities/:id/messages    # Publicar mensaje

GET    /api/stats                       # Estadísticas generales
```

## 🔐 Autenticación

Todos los endpoints protegidos requieren el header:

```
Authorization: Bearer <tu-token-jwt>
```

Para obtener un token, crea un usuario:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "userFirebaseUID": "tu-firebase-uid",
    "userEmail": "tu-email@example.com",
    "userName": "Tu Nombre",
    "userAppVersion": "1"
  }'
```

## 🛠️ Scripts Disponibles

```bash
npm run dev              # Ejecutar en desarrollo
npm run build            # Construir para producción
npm run start            # Ejecutar en producción
npm run lint             # Ejecutar linter
npm run test-api         # Probar API
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:studio    # Abrir Prisma Studio (GUI)
```

## 📊 Estructura del Proyecto

```
verano/
├── app/
│   ├── api/              # Rutas de la API
│   │   ├── users/
│   │   ├── vehicles/
│   │   ├── communities/
│   │   ├── brands/
│   │   ├── categories/
│   │   └── stats/
│   └── generated/        # Cliente Prisma generado
│
├── utils/                # Utilidades compartidas
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth.ts           # Autenticación
│   ├── validations.ts    # Esquemas de validación
│   ├── middleware.ts     # Middleware
│   └── ...
│
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
│
├── scripts/
│   ├── test-api.js       # Script de pruebas
│   └── seed-database.ts  # Seed de base de datos
│
└── middleware.ts         # Middleware global (headers seguridad)
```

## 🔒 Seguridad

### Implementaciones de Seguridad

1. **Autenticación JWT** con tokens seguros
2. **Rate Limiting**: 100 requests/minuto por IP
3. **Validación de datos** con Zod en todos los endpoints
4. **Sanitización XSS** en contenido generado por usuarios
5. **Headers de seguridad**: HSTS, X-Frame-Options, CSP, etc.
6. **CORS** configurado para producción
7. **Manejo seguro de errores** (sin exponer detalles internos)

### Mejores Prácticas

- Siempre usa HTTPS en producción
- Cambia `JWT_SECRET` a un valor aleatorio seguro
- Ajusta `RATE_LIMIT_MAX` según tu infraestructura
- Implementa logs para auditoría
- Realiza backups regulares de la base de datos

## ⚡ Optimizaciones

- Consultas paralelas con `Promise.all()`
- Paginación eficiente (máx. 100 items)
- Select de campos específicos
- Índices de base de datos optimizados
- Agregaciones calculadas en BD
- Eager loading con Prisma

## 🗄️ Base de Datos

### Modelos Principales

- **tblusuarios** - Usuarios del sistema
- **tblvehicles** - Vehículos con detalles completos
- **tblvehiclebrand** - Marcas de vehículos
- **tblvehiclemodel** - Modelos
- **tblvehicleversion** - Versiones
- **tblvehiclecategories** - Categorías
- **tblvehiclesopinions** - Opiniones y calificaciones
- **tblcommunities** - Comunidades de usuarios
- **tblcommunitymessages** - Mensajes de comunidades
- **tbluserfavoritevehicles** - Favoritos
- **tblusercomparations** - Comparaciones
- **tbluserpreferences** - Preferencias de usuario

Ver [prisma/schema.prisma](prisma/schema.prisma) para el esquema completo.

## 📝 Ejemplos de Uso

### Crear usuario y obtener token

```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userFirebaseUID: 'tu-firebase-uid',
    userEmail: 'tu-email@example.com',
    userName: 'Tu Nombre',
    userAppVersion: '1'
  })
})

const { data } = await response.json()
const token = data.token // Guardar para usar en requests autenticados
```

### Buscar vehículos con filtros

```typescript
const params = new URLSearchParams({
  brandID: '1',
  categoryID: '2',
  yearMin: '2020',
  priceMax: '50000',
  page: '1',
  limit: '20',
  sortBy: 'price',
  sortOrder: 'asc'
})

const response = await fetch(`/api/vehicles?${params}`)
const { data } = await response.json()

console.log(`Total: ${data.pagination.total} vehículos`)
console.log(data.data) // Array de vehículos
```

### Crear opinión sobre vehículo

```typescript
const response = await fetch('/api/vehicles/123/opinions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    opinionRate: 5,
    opinionComment: 'Excelente vehículo'
  })
})
```

Ver más ejemplos en [utils/api-client-example.ts](utils/api-client-example.ts)

## 🧪 Testing

Ejecuta el script de pruebas automatizadas:

```bash
npm run test-api
```

Esto probará:
- ✅ Endpoints públicos (marcas, categorías, vehículos)
- ✅ Creación de usuarios con JWT
- ✅ Autenticación con tokens
- ✅ Rate limiting

## 🛟 Soporte y Contribución

Para reportar problemas o sugerir mejoras, por favor abre un issue en el repositorio.

## 📄 Licencia

Este proyecto es privado y confidencial.

---

Desarrollado con ❤️ usando Next.js, Prisma y TypeScript
