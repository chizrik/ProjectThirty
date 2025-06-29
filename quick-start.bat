@echo off
echo 🚀 Quick Start - 30-Day Challenge App
echo ======================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down 2>nul

REM Build and start the application
echo 🔨 Building and starting the application...
docker-compose up --build -d

REM Wait a moment for the container to start
echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check if the container is running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Application failed to start. Showing logs:
    docker-compose logs
) else (
    echo ✅ Application is running!
    echo 🌐 Visit: http://localhost:3000
    echo 🔧 Test connection: http://localhost:3000/test-connection
    echo.
    echo 📋 Recent logs:
    docker-compose logs --tail=20
)

pause
