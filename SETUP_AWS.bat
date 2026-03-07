@echo off
REM Quick AWS Setup Launcher for NeuroCode AI

echo.
echo ==========================================
echo   NeuroCode AI - AWS Setup Launcher
echo ==========================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] AWS CLI is not installed!
    echo.
    echo Please install AWS CLI first:
    echo https://aws.amazon.com/cli/
    echo.
    pause
    exit /b 1
)

echo [OK] AWS CLI found
echo.

REM Check if AWS is configured
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo AWS CLI is not configured yet.
    echo.
    echo Let's configure it now...
    echo.
    aws configure
    echo.
)

echo [OK] AWS credentials configured
echo.

REM Check if Terraform is deployed
if not exist "infra\terraform\terraform.tfstate" (
    echo [WARNING] Terraform infrastructure not deployed yet
    echo.
    echo You need to deploy the infrastructure first:
    echo   cd infra\terraform
    echo   terraform init
    echo   terraform apply
    echo.
    set /p CONTINUE="Do you want to continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
    echo.
)

echo Starting AWS credentials setup...
echo.
echo This will:
echo   1. Retrieve all Terraform outputs
echo   2. Get database password from Secrets Manager
echo   3. Create .env files with all credentials
echo   4. Test all AWS connections
echo.
pause

REM Run the setup script
call setup-aws-credentials.bat

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.

REM Ask if user wants to run tests
set /p RUNTESTS="Do you want to run connection tests now? (y/n): "
if /i "%RUNTESTS%"=="y" (
    echo.
    echo Running connection tests...
    echo.
    npm install
    npm run test:aws
)

echo.
echo Next steps:
echo   1. Review the .env files created
echo   2. Run: npm run test:aws (if not done)
echo   3. Start local: start-local.bat
echo   4. Or deploy to EC2
echo.
echo Documentation:
echo   - AWS_INTEGRATION_README.md
echo   - AWS_SETUP_GUIDE.md
echo   - AWS_QUICK_REFERENCE.md
echo.
pause
