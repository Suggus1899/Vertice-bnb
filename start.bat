@echo off
REM ============================================
REM Script de Inicio - Vetice-bnb
REM ============================================
REM Este script inicia todos los servicios del proyecto
REM ============================================

echo.
echo ============================================
echo   VETICE-BNB - Script de Inicio
echo ============================================
echo.

REM Verificar si Docker está corriendo
echo [1/5] Verificando Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está corriendo. Por favor inicia Docker Desktop.
    pause
    exit /b 1
)
echo OK: Docker está corriendo
echo.

REM Iniciar base de datos
echo [2/5] Iniciando PostgreSQL + PostGIS...
cd packages\database
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: No se pudo iniciar la base de datos
    pause
    exit /b 1
)
echo Esperando a que la base de datos esté lista (30 segundos)...
timeout /t 30 /nobreak >nul
echo OK: Base de datos iniciada
echo.

REM Generar Prisma Client
echo [3/5] Generando Prisma Client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ERROR: No se pudo generar Prisma Client
    pause
    exit /b 1
)
echo OK: Prisma Client generado
echo.

REM Volver al root
cd ..\..

REM Iniciar Backend
echo [4/5] Iniciando Backend (Express API)...
start "Vetice API" cmd /k "cd apps\api && npm run dev"
echo Esperando a que el backend inicie (10 segundos)...
timeout /t 10 /nobreak >nul
echo OK: Backend iniciado en http://localhost:3001
echo.

REM Iniciar Frontend
echo [5/5] Iniciando Frontend (Next.js Web)...
start "Vetice Web" cmd /k "cd apps\web && npm run dev"
echo OK: Frontend iniciado en http://localhost:3000
echo.

echo ============================================
echo   SERVICIOS INICIADOS CORRECTAMENTE
echo ============================================
echo.
echo   Backend API:  http://localhost:3001
echo   Frontend Web: http://localhost:3000
echo   Database:     localhost:5432
echo.
echo   Para detener los servicios:
echo   1. Cierra las ventanas de las consolas
echo   2. Ejecuta: npm run stop
echo.
echo   Para ver logs de la base de datos:
echo   cd packages\database
echo   docker compose logs -f
echo.
echo ============================================
echo.
pause
