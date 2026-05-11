# Script de instalación de optimizaciones para Champions Game
# Ejecutar con: .\install-optimizations.ps1

Write-Host "�� Instalando optimizaciones para Champions Game..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "Backend") -or -not (Test-Path "Frontend")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Función para verificar si npm está instalado
function Test-NpmInstalled {
    try {
        $null = npm --version
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-NpmInstalled)) {
    Write-Host "❌ Error: npm no está instalado. Instala Node.js primero." -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm detectado" -ForegroundColor Green
Write-Host ""

# ============================================
# BACKEND
# ============================================
Write-Host "📦 Instalando dependencias del Backend..." -ForegroundColor Cyan
Set-Location Backend

Write-Host "   Instalando: jsonwebtoken, helmet, express-rate-limit..." -ForegroundColor Yellow
npm install jsonwebtoken@^9.1.2 helmet@^7.1.0 express-rate-limit@^7.1.5 --save

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencias de Backend instaladas" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error instalando dependencias de Backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Verificar si existe .env, si no, crear template
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "📝 Creando archivo .env para Backend..." -ForegroundColor Cyan
    
    $backendEnvContent = @"
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/champions-game

# JWT Configuration
JWT_SECRET=change-this-to-a-random-secret-in-production-$(Get-Random -Minimum 1000 -Maximum 9999)
JWT_EXPIRATION=7d

# Logging
LOG_LEVEL=DEBUG
"@
    
    $backendEnvContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "   ✅ Archivo Backend/.env creado" -ForegroundColor Green
    Write-Host "   ⚠️  IMPORTANTE: Cambia JWT_SECRET antes de producción" -ForegroundColor Yellow
} else {
    Write-Host "   ℹ️  Backend/.env ya existe, saltando..." -ForegroundColor Gray
}

Set-Location ..

# ============================================
# FRONTEND
# ============================================
Write-Host ""
Write-Host "📦 Instalando dependencias del Frontend..." -ForegroundColor Cyan
Set-Location Frontend

Write-Host "   Instalando: zustand..." -ForegroundColor Yellow
npm install zustand@^4.5.5 --save

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencias de Frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error instalando dependencias de Frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Verificar si existe .env, si no, crear template
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "📝 Creando archivo .env para Frontend..." -ForegroundColor Cyan
    
    $frontendEnvContent = @"
# API Configuration
VITE_API_URL=http://localhost:8080
"@
    
    $frontendEnvContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "   ✅ Archivo Frontend/.env creado" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Frontend/.env ya existe, saltando..." -ForegroundColor Gray
}

Set-Location ..

# ============================================
# VERIFICACIÓN
# ============================================
Write-Host ""
Write-Host "🔍 Verificando archivos creados..." -ForegroundColor Cyan

$requiredFiles = @(
    "Backend/middleware/auth.js",
    "Backend/middleware/validation.js",
    "Backend/middleware/rateLimit.js",
    "Backend/utils/logger.js",
    "Backend/utils/security.js",
    "Frontend/src/store/authStore.js",
    "Frontend/src/store/gameStore.js",
    "Frontend/src/api/client.js",
    "Frontend/src/components/ErrorBoundary.jsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file NO ENCONTRADO" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if ($allFilesExist) {
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ ¡INSTALACIÓN COMPLETADA CON ÉXITO!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Verifica los archivos .env creados:" -ForegroundColor White
    Write-Host "   - Backend/.env" -ForegroundColor Yellow
    Write-Host "   - Frontend/.env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Asegúrate de que MongoDB esté corriendo" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Inicia el Backend:" -ForegroundColor White
    Write-Host "   cd Backend" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. En otra terminal, inicia el Frontend:" -ForegroundColor White
    Write-Host "   cd Frontend" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "5. Abre http://localhost:5173 en tu navegador" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Documentación completa en: OPTIMIZATION_GUIDE.md" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "⚠️  INSTALACIÓN INCOMPLETA" -ForegroundColor Red
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Algunos archivos no fueron encontrados." -ForegroundColor Yellow
    Write-Host "Por favor, verifica que todos los archivos se hayan creado correctamente." -ForegroundColor Yellow
    Write-Host ""
}
