@echo off
REM NeuroCode AI - Manual AWS Setup (Without Terraform)
REM This script helps you configure AWS credentials manually

echo ==========================================
echo NeuroCode AI - Manual AWS Setup
echo ==========================================
echo.

REM Check AWS CLI
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] AWS CLI not installed
    pause
    exit /b 1
)

echo [OK] AWS CLI found
echo.

REM Verify AWS credentials
echo Verifying AWS credentials...
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] AWS credentials not configured
    echo Please run: aws configure
    pause
    exit /b 1
)

echo [OK] AWS credentials verified
echo.

REM Get AWS account info
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set AWS_ACCOUNT_ID=%%i
for /f "tokens=*" %%i in ('aws configure get region') do set AWS_REGION=%%i

if "%AWS_REGION%"=="" set AWS_REGION=us-east-1

echo AWS Account ID: %AWS_ACCOUNT_ID%
echo AWS Region: %AWS_REGION%
echo.

echo ==========================================
echo Manual Configuration Required
echo ==========================================
echo.
echo Since Terraform is not deployed, you need to:
echo.
echo 1. Create AWS resources manually OR
echo 2. Install Terraform and deploy infrastructure OR
echo 3. Use existing AWS resources
echo.
echo Let's configure with your existing/manual resources...
echo.

REM Prompt for resource details
echo Please enter your AWS resource details:
echo (Press Enter to skip if not available)
echo.

set /p DB_HOST="RDS Endpoint (e.g., mydb.xxxxx.us-east-1.rds.amazonaws.com): "
set /p DB_NAME="Database Name (default: neurocode): "
set /p DB_USER="Database Username (default: neurocode_admin): "
set /p DB_PASSWORD="Database Password: "

if "%DB_NAME%"=="" set DB_NAME=neurocode
if "%DB_USER%"=="" set DB_USER=neurocode_admin

echo.
set /p S3_DATASETS_BUCKET="S3 Datasets Bucket Name: "
set /p S3_MODELS_BUCKET="S3 Models Bucket Name: "

echo.
set /p SQS_ANALYSIS_QUEUE_URL="SQS Analysis Queue URL: "
set /p SQS_TRAINING_QUEUE_URL="SQS Training Queue URL: "

echo.
set /p SAGEMAKER_ROLE_ARN="SageMaker Role ARN (optional): "

echo.

REM Generate JWT secret
set JWT_SECRET=manual-setup-%RANDOM%%RANDOM%%RANDOM%

REM Create backend .env file
set BACKEND_ENV_FILE=backend\api-gateway\.env
echo Creating backend environment file...

if not exist "backend\api-gateway" mkdir "backend\api-gateway"

(
echo # NeuroCode AI - Backend Environment Configuration
echo # Generated: %DATE% %TIME%
echo # Manual Setup - No Terraform
echo.
echo # Node Environment
echo NODE_ENV=development
echo PORT=4000
echo.
echo # AWS Configuration
echo AWS_REGION=%AWS_REGION%
echo.
echo # Database
echo DB_HOST=%DB_HOST%
echo DB_PORT=5432
echo DB_NAME=%DB_NAME%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo POSTGRES_URL=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:5432/%DB_NAME%
echo.
echo # S3 Buckets
echo S3_DATASETS_BUCKET=%S3_DATASETS_BUCKET%
echo S3_MODELS_BUCKET=%S3_MODELS_BUCKET%
echo.
echo # SQS Queues
echo SQS_ANALYSIS_QUEUE_URL=%SQS_ANALYSIS_QUEUE_URL%
echo SQS_TRAINING_QUEUE_URL=%SQS_TRAINING_QUEUE_URL%
echo.
echo # SageMaker
echo SAGEMAKER_ROLE_ARN=%SAGEMAKER_ROLE_ARN%
echo.
echo # JWT
echo JWT_SECRET=%JWT_SECRET%
echo.
echo # Redis (local^)
echo REDIS_URL=redis://localhost:6379
echo.
echo # RabbitMQ (local^)
echo RABBITMQ_URL=amqp://localhost:5672
echo.
echo # CORS
echo CORS_ORIGIN=http://localhost:3000
echo.
echo # Logging
echo LOG_LEVEL=info
) > "%BACKEND_ENV_FILE%"

echo [OK] Backend .env file created
echo.

REM Create ML training .env file
set ML_ENV_FILE=ml\sagemaker-training\.env
echo Creating ML training environment file...

if not exist "ml\sagemaker-training" mkdir "ml\sagemaker-training"

(
echo # NeuroCode AI - ML Training Environment Configuration
echo # Generated: %DATE% %TIME%
echo.
echo # AWS Configuration
echo AWS_REGION=%AWS_REGION%
echo PROJECT_NAME=neurocode-ai
echo.
echo # S3 Buckets
echo S3_DATASETS_BUCKET=%S3_DATASETS_BUCKET%
echo S3_MODELS_BUCKET=%S3_MODELS_BUCKET%
echo.
echo # SageMaker
echo SAGEMAKER_ROLE_ARN=%SAGEMAKER_ROLE_ARN%
echo.
echo # SQS
echo SQS_TRAINING_QUEUE_URL=%SQS_TRAINING_QUEUE_URL%
) > "%ML_ENV_FILE%"

echo [OK] ML training .env file created
echo.

REM Create root .env file
set ROOT_ENV_FILE=.env
echo Creating root environment file...

(
echo # NeuroCode AI - Root Environment Configuration
echo # Generated: %DATE% %TIME%
echo.
echo # AWS Configuration
echo AWS_REGION=%AWS_REGION%
echo AWS_ACCOUNT_ID=%AWS_ACCOUNT_ID%
echo.
echo # Database
echo DB_HOST=%DB_HOST%
echo DB_PORT=5432
echo DB_NAME=%DB_NAME%
echo DB_USER=%DB_USER%
echo.
echo # S3 Buckets
echo S3_DATASETS_BUCKET=%S3_DATASETS_BUCKET%
echo S3_MODELS_BUCKET=%S3_MODELS_BUCKET%
echo.
echo # SQS Queues
echo SQS_ANALYSIS_QUEUE_URL=%SQS_ANALYSIS_QUEUE_URL%
echo SQS_TRAINING_QUEUE_URL=%SQS_TRAINING_QUEUE_URL%
echo.
echo # SageMaker
echo SAGEMAKER_ROLE_ARN=%SAGEMAKER_ROLE_ARN%
) > "%ROOT_ENV_FILE%"

echo [OK] Root .env file created
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Environment files created:
echo   - %BACKEND_ENV_FILE%
echo   - %ML_ENV_FILE%
echo   - %ROOT_ENV_FILE%
echo.
echo Next steps:
echo   1. Review the .env files and update as needed
echo   2. Create AWS resources if not done:
echo      - RDS PostgreSQL database
echo      - S3 buckets for datasets and models
echo      - SQS queues for analysis and training
echo      - SageMaker IAM role
echo   3. Test connections: npm run test:aws
echo   4. Start local development: start-local.bat
echo.
echo For automated infrastructure deployment:
echo   1. Install Terraform: https://www.terraform.io/downloads
echo   2. Run: cd infra\terraform
echo   3. Run: terraform init
echo   4. Run: terraform apply
echo.
pause
