@echo off
echo ==========================================
echo Starting NeuroCode AI Backend
echo ==========================================
echo.

REM Check if port 4000 is in use
netstat -ano | findstr :4000 | findstr LISTENING >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 4000 is already in use
    echo.
    echo Options:
    echo   1. Kill the process using port 4000
    echo   2. Start backend on a different port
    echo   3. Cancel
    echo.
    set /p CHOICE="Choose option (1/2/3): "
    
    if "%CHOICE%"=="1" (
        echo.
        echo Killing process on port 4000...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do (
            taskkill /F /PID %%a >nul 2>&1
            echo [OK] Process killed
        )
        timeout /t 2 >nul
    ) else if "%CHOICE%"=="2" (
        echo.
        echo Backend will automatically use next available port
        timeout /t 2 >nul
    ) else (
        echo.
        echo Cancelled
        pause
        exit /b 0
    )
)

echo.
echo Starting backend server...
echo.
echo [INFO] Backend will start on port 4000 or next available port
echo [INFO] Check console output for actual port number
echo.

cd backend\api-gateway
npm run dev

