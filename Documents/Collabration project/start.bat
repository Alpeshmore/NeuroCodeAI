@echo off
echo ========================================
echo   ProjectBridge - Starting Application
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm run install-all
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file with your MongoDB URI and JWT secret
    echo Press any key to continue after editing .env...
    pause
)

echo Starting ProjectBridge...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:5173
echo.
echo Press Ctrl+C to stop the servers
echo.

npm run dev
