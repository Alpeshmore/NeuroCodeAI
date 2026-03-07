@echo off
echo ========================================
echo NeuroCode AI - Localhost Setup
echo ========================================
echo.
echo This will install dependencies and start the project on localhost.
echo.
echo STEP 1: Installing Backend Dependencies...
echo.
cd backend\api-gateway
call npm install
if errorlevel 1 (
    echo [ERROR] Backend installation failed!
    pause
    exit /b 1
)
echo.
echo ✓ Backend dependencies installed!
echo.
echo STEP 2: Installing Frontend Dependencies...
echo.
cd ..\..\frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Frontend installation failed!
    pause
    exit /b 1
)
echo.
echo ✓ Frontend dependencies installed!
echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Now open TWO Command Prompt windows:
echo.
echo Window 1 - Start Backend:
echo   cd backend\api-gateway
echo   npm run dev
echo.
echo Window 2 - Start Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open browser: http://localhost:3000
echo.
echo ========================================
pause
