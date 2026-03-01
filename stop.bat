@echo off
REM ============================================
REM Script de Detención - Vetice-bnb
REM ============================================
REM Este script detiene todos los servicios del proyecto
REM ============================================

echo.
echo ============================================
echo   VETICE-BNB - Deteniendo Servicios
echo ============================================
echo.

REM Detener base de datos
echo [1/2] Deteniendo PostgreSQL + PostGIS...
cd packages\database
docker compose down
echo OK: Base de datos detenida
echo.

REM Volver al root
cd ..\..

REM Matar procesos de Node
echo [2/2] Deteniendo servidores Node.js...
taskkill /F /FI "WINDOWTITLE eq Vetice*" >nul 2>&1
echo OK: Servidores detenidos
echo.

echo ============================================
echo   SERVICIOS DETENIDOS
echo ============================================
echo.
echo   Para iniciar nuevamente ejecuta: start.bat
echo.
pause
