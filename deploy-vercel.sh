#!/bin/bash

# Script para configurar variables de entorno en Vercel
# Uso: ./deploy-vercel.sh

echo "🚀 Configurando variables de entorno en Vercel..."
echo ""
echo "Asegúrate de tener Vercel CLI instalado:"
echo "npm i -g vercel"
echo ""
echo "Luego ejecuta estos comandos:"
echo ""

# Leer del archivo .env actual
if [ -f .env ]; then
  echo "vercel env add DATABASE_URL production"
  echo "vercel env add JWT_SECRET production"
  echo "vercel env add JWT_EXPIRES_IN production"
  echo "vercel env add RATE_LIMIT_MAX production"
  echo "vercel env add RATE_LIMIT_WINDOW_MS production"
  echo "vercel env add NODE_ENV production"
  echo "vercel env add CLOUDINARY_CLOUD_NAME production"
  echo "vercel env add CLOUDINARY_API_KEY production"
  echo "vercel env add CLOUDINARY_API_SECRET production"
  echo "vercel env add FIREBASE_PROJECT_ID production"
  echo "vercel env add FIREBASE_CLIENT_EMAIL production"
  echo "vercel env add FIREBASE_PRIVATE_KEY production"
  echo "vercel env add EMAIL_USER production"
  echo "vercel env add EMAIL_PASS production"
  echo "vercel env add ADMIN_SECRET_KEY production"
  echo ""
  echo "✅ O configura todas las variables manualmente en:"
  echo "👉 https://vercel.com/[tu-proyecto]/settings/environment-variables"
else
  echo "❌ No se encontró archivo .env"
fi

echo ""
echo "📖 Lee VERCEL_DEPLOY.md para instrucciones completas"
