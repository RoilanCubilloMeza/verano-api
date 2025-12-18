import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n')

  // 1. Crear marcas de vehículos
  console.log('📦 Creando marcas...')
  const brands = await Promise.all([
    prisma.tblvehiclebrand.create({
      data: { brandBrand: 'Toyota' },
    }),
    prisma.tblvehiclebrand.create({
      data: { brandBrand: 'Honda' },
    }),
    prisma.tblvehiclebrand.create({
      data: { brandBrand: 'Ford' },
    }),
    prisma.tblvehiclebrand.create({
      data: { brandBrand: 'Chevrolet' },
    }),
    prisma.tblvehiclebrand.create({
      data: { brandBrand: 'Nissan' },
    }),
  ])
  console.log(`✅ ${brands.length} marcas creadas\n`)

  // 2. Crear categorías
  console.log('📦 Creando categorías...')
  const categories = await Promise.all([
    prisma.tblvehiclecategories.create({
      data: { categoryDescription: 'Sedán' },
    }),
    prisma.tblvehiclecategories.create({
      data: { categoryDescription: 'SUV' },
    }),
    prisma.tblvehiclecategories.create({
      data: { categoryDescription: 'Pickup' },
    }),
    prisma.tblvehiclecategories.create({
      data: { categoryDescription: 'Deportivo' },
    }),
    prisma.tblvehiclecategories.create({
      data: { categoryDescription: 'Eléctrico' },
    }),
  ])
  console.log(`✅ ${categories.length} categorías creadas\n`)

  // 3. Crear modelos
  console.log('📦 Creando modelos...')
  const models = await Promise.all([
    prisma.tblvehiclemodel.create({
      data: { modelDescription: 'Corolla' },
    }),
    prisma.tblvehiclemodel.create({
      data: { modelDescription: 'Civic' },
    }),
    prisma.tblvehiclemodel.create({
      data: { modelDescription: 'CR-V' },
    }),
    prisma.tblvehiclemodel.create({
      data: { modelDescription: 'F-150' },
    }),
    prisma.tblvehiclemodel.create({
      data: { modelDescription: 'Silverado' },
    }),
  ])
  console.log(`✅ ${models.length} modelos creados\n`)

  // 4. Crear versiones
  console.log('📦 Creando versiones...')
  const versions = await Promise.all([
    prisma.tblvehicleversion.create({
      data: { versionDescription: 'Base' },
    }),
    prisma.tblvehicleversion.create({
      data: { versionDescription: 'Sport' },
    }),
    prisma.tblvehicleversion.create({
      data: { versionDescription: 'Limited' },
    }),
  ])
  console.log(`✅ ${versions.length} versiones creadas\n`)

  // 5. Crear algunos vehículos de ejemplo
  console.log('🚗 Creando vehículos...')
  
  // Crear PDF de ejemplo (vacío por ahora)
  const emptyPDF = Buffer.from('PDF content here')
  
  const vehicles = await Promise.all([
    prisma.tblvehicles.create({
      data: {
        vehicleBrandID: brands[0].brandID, // Toyota
        vehicleModelID: models[0].modelID, // Corolla
        vehicleVersionID: versions[0].versionID, // Base
        vehicleCategoryID: categories[0].categoryID, // Sedán
        vehicleYear: 2024,
        vehiclePrice: 25000,
        vehiclePDF: emptyPDF,
      },
    }),
    prisma.tblvehicles.create({
      data: {
        vehicleBrandID: brands[1].brandID, // Honda
        vehicleModelID: models[1].modelID, // Civic
        vehicleVersionID: versions[1].versionID, // Sport
        vehicleCategoryID: categories[0].categoryID, // Sedán
        vehicleYear: 2024,
        vehiclePrice: 28000,
        vehiclePDF: emptyPDF,
      },
    }),
    prisma.tblvehicles.create({
      data: {
        vehicleBrandID: brands[1].brandID, // Honda
        vehicleModelID: models[2].modelID, // CR-V
        vehicleVersionID: versions[2].versionID, // Limited
        vehicleCategoryID: categories[1].categoryID, // SUV
        vehicleYear: 2024,
        vehiclePrice: 35000,
        vehiclePDF: emptyPDF,
      },
    }),
    prisma.tblvehicles.create({
      data: {
        vehicleBrandID: brands[2].brandID, // Ford
        vehicleModelID: models[3].modelID, // F-150
        vehicleVersionID: versions[1].versionID, // Sport
        vehicleCategoryID: categories[2].categoryID, // Pickup
        vehicleYear: 2024,
        vehiclePrice: 45000,
        vehiclePDF: emptyPDF,
      },
    }),
    prisma.tblvehicles.create({
      data: {
        vehicleBrandID: brands[3].brandID, // Chevrolet
        vehicleModelID: models[4].modelID, // Silverado
        vehicleVersionID: versions[0].versionID, // Base
        vehicleCategoryID: categories[2].categoryID, // Pickup
        vehicleYear: 2024,
        vehiclePrice: 42000,
        vehiclePDF: emptyPDF,
      },
    }),
  ])
  console.log(`✅ ${vehicles.length} vehículos creados\n`)

  console.log('✅ ¡Seed completado exitosamente!')
  console.log('\n📝 Ejecuta npm run test-api para probar la API con los datos')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
