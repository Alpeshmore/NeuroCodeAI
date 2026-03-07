@echo off
echo ========================================
echo NeuroCode AI - Local Development Setup
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Starting backend services (PostgreSQL, Redis, RabbitMQ)...
docker-compose up -d

echo.
echo [2/5] Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo [3/5] Checking service status...
docker-compose ps

echo.
echo [4/5] Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

if not exist "backend\api-gateway\node_modules" (
    echo Installing backend dependencies...
    cd backend\api-gateway
    call npm install
    cd ..\..
)

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Start Backend API:
echo    cd backend\api-gateway
echo    npm run dev
echo.
echo 2. Start Frontend (in new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser:
echo    http://localhost:3000
echo.
echo ========================================
echo Services Running:
echo ========================================
echo - PostgreSQL: localhost:5432
echo - Redis: localhost:6379
echo - RabbitMQ: localhost:5672
echo - RabbitMQ UI: http://localhost:15672
echo.
echo To stop services: docker-compose down
echo ========================================
echo.
pause
