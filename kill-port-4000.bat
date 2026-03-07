@echo off
REM Kill process using port 4000

echo Checking for processes using port 4000...
echo.

REM Find process using port 4000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do (
    set PID=%%a
    goto :found
)

echo No process found using port 4000
pause
exit /b 0

:found
echo Found process using port 4000 (PID: %PID%)
echo.

REM Get process name
for /f "tokens=1" %%b in ('tasklist /FI "PID eq %PID%" /NH') do set PROCESS_NAME=%%b

echo Process: %PROCESS_NAME% (PID: %PID%)
echo.

set /p CONFIRM="Kill this process? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo Killing process %PID%...
taskkill /F /PID %PID%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Process killed successfully
    echo Port 4000 is now available
) else (
    echo.
    echo [ERROR] Failed to kill process
    echo You may need to run this script as Administrator
)

echo.
pause
