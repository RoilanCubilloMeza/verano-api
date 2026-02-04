# Script PowerShell para recordar la configuración de Vercel
# Uso: .\deploy-vercel.ps1

Write-Host "🚀 Guía rápida de deployment en Vercel" -ForegroundColor Green
Write-Host ""
Write-Host "1️⃣ Instala Vercel CLI (si no lo tienes):" -ForegroundColor Yellow
Write-Host "   npm i -g vercel"
Write-Host ""
Write-Host "2️⃣ Inicia sesión:" -ForegroundColor Yellow
Write-Host "   vercel login"
Write-Host ""
Write-Host "3️⃣ Despliega tu proyecto:" -ForegroundColor Yellow
Write-Host "   vercel"
Write-Host ""
Write-Host "4️⃣ Configura variables de entorno en Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/[tu-proyecto]/settings/environment-variables"
Write-Host ""
Write-Host "Variables necesarias:" -ForegroundColor Cyan
Write-Host "   - DATABASE_URL"
Write-Host "   - JWT_SECRET"
Write-Host "   - JWT_EXPIRES_IN"
Write-Host "   - RATE_LIMIT_MAX"
Write-Host "   - RATE_LIMIT_WINDOW_MS"
Write-Host "   - NODE_ENV"
Write-Host "   - CLOUDINARY_CLOUD_NAME"
Write-Host "   - CLOUDINARY_API_KEY"
Write-Host "   - CLOUDINARY_API_SECRET"
Write-Host "   - FIREBASE_PROJECT_ID"
Write-Host "   - FIREBASE_CLIENT_EMAIL"
Write-Host "   - FIREBASE_PRIVATE_KEY (⚠️ Ver nota abajo)"
Write-Host "   - EMAIL_USER"
Write-Host "   - EMAIL_PASS"
Write-Host "   - ADMIN_SECRET_KEY"
Write-Host ""
Write-Host "⚠️ IMPORTANTE - FIREBASE_PRIVATE_KEY:" -ForegroundColor Red
Write-Host "   En Vercel, pega el valor con los saltos de línea reales o con \n escapados"
Write-Host "   Ejemplo con \n:"
Write-Host '   "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"'
Write-Host ""
Write-Host "5️⃣ Agrega dominio de Vercel a Firebase:" -ForegroundColor Yellow
Write-Host "   Firebase Console > Authentication > Settings > Authorized domains"
Write-Host "   Agrega: tu-proyecto.vercel.app"
Write-Host ""
Write-Host "📖 Documentación completa: VERCEL_DEPLOY.md" -ForegroundColor Green
