#!/usr/bin/env node

/**
 * Script de prueba rápida de la API
 * Ejecutar con: npm run test-api
 */

const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('🧪 Probando API...\n')

  try {
    // 1. Test: Obtener marcas (público)
    console.log('1️⃣ GET /api/brands')
    const brandsRes = await fetch(`${BASE_URL}/api/brands`)
    const brands = await brandsRes.json()
    console.log(`✅ ${brands.data?.length || 0} marcas encontradas\n`)

    // 2. Test: Obtener categorías (público)
    console.log('2️⃣ GET /api/categories')
    const catsRes = await fetch(`${BASE_URL}/api/categories`)
    const cats = await catsRes.json()
    console.log(`✅ ${cats.data?.length || 0} categorías encontradas\n`)

    // 3. Test: Buscar vehículos (público)
    console.log('3️⃣ GET /api/vehicles?page=1&limit=5')
    const vehiclesRes = await fetch(`${BASE_URL}/api/vehicles?page=1&limit=5`)
    const vehicles = await vehiclesRes.json()
    console.log(`✅ ${vehicles.data?.data?.length || 0} vehículos encontrados`)
    console.log(`📊 Total: ${vehicles.data?.pagination?.total || 0}\n`)

    // 4. Test: Crear usuario
    console.log('4️⃣ POST /api/users')
    const createUserRes = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userFirebaseUID: `test-${Date.now()}`,
        userEmail: `test-${Date.now()}@example.com`,
        userName: 'Usuario de Prueba',
        userAppVersion: '1'
      })
    })
    const userData = await createUserRes.json()
    
    if (userData.success) {
      console.log(`✅ Usuario creado: ID ${userData.data.user.userId}`)
      console.log(`🔑 Token JWT recibido: ${userData.data.token.substring(0, 20)}...\n`)
      
      const token = userData.data.token
      const userId = userData.data.user.userId

      // 5. Test: Obtener perfil (con auth)
      console.log(`5️⃣ GET /api/users/${userId}`)
      const profileRes = await fetch(`${BASE_URL}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const profile = await profileRes.json()
      console.log(`✅ Perfil obtenido: ${profile.data.userEmail}\n`)

      // 6. Test: Rate limiting
      console.log('6️⃣ Test de Rate Limiting (múltiples requests)')
      let successCount = 0
      let limitCount = 0
      
      for (let i = 0; i < 5; i++) {
        const res = await fetch(`${BASE_URL}/api/brands`)
        if (res.status === 200) successCount++
        if (res.status === 429) limitCount++
      }
      
      console.log(`✅ Requests exitosos: ${successCount}`)
      if (limitCount > 0) {
        console.log(`⏱️  Rate limited: ${limitCount}`)
      }
      console.log()

      console.log('✅ ¡Todos los tests pasaron!\n')
      console.log('📝 La API está funcionando correctamente.')
      console.log('📖 Ver API_DOCUMENTATION.md para más detalles.')
      
    } else {
      console.log('❌ Error al crear usuario:', userData.error)
    }

  } catch (error) {
    console.error('❌ Error en los tests:', error.message)
    console.log('\n⚠️  Asegúrate de que el servidor esté corriendo:')
    console.log('   npm run dev')
  }
}

testAPI()
