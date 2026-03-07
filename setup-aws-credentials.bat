@echo off
REM NeuroCode AI - AWS Credentials Setup Script (Windows)
REM This script automatically configures all AWS API keys and credentials

echo ==========================================
echo NeuroCode AI - AWS Credentials Setup
echo ==========================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: AWS CLI is not installed
    echo Please install AWS CLI: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

REM Check AWS credentials
echo Checking AWS credentials...
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: AWS credentials not configured
    echo Please run: aws configure
    pause
    exit /b 1
)

echo [OK] AWS credentials verified
echo.

REM Set default region
if "%AWS_REGION%"=="" set AWS_REGION=us-east-1

REM Get AWS account info
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set AWS_ACCOUNT_ID=%%i

echo AWS Account ID: %AWS_ACCOUNT_ID%
echo AWS Region: %AWS_REGION%
echo.

REM Check if Terraform directory exists
if not exist "infra\terraform" (
    echo Error: Terraform directory not found
    pause
    exit /b 1
)

cd infra\terraform

if not exist "terraform.tfstate" (
    echo Warning: Terraform state not found
    echo Have you deployed the infrastructure? (terraform apply)
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

echo Retrieving Terraform outputs...
echo.

REM Get Terraform outputs
for /f "tokens=*" %%i in ('terraform output -raw rds_endpoint 2^>nul') do set RDS_ENDPOINT=%%i
for /f "tokens=*" %%i in ('terraform output -raw rds_database_name 2^>nul') do set RDS_DATABASE_NAME=%%i
for /f "tokens=*" %%i in ('terraform output -raw db_secret_arn 2^>nul') do set DB_SECRET_ARN=%%i
for /f "tokens=*" %%i in ('terraform output -raw s3_datasets_bucket 2^>nul') do set S3_DATASETS_BUCKET=%%i
for /f "tokens=*" %%i in ('terraform output -raw s3_models_bucket 2^>nul') do set S3_MODELS_BUCKET=%%i
for /f "tokens=*" %%i in ('terraform output -raw sqs_analysis_queue_url 2^>nul') do set SQS_ANALYSIS_QUEUE_URL=%%i
for /f "tokens=*" %%i in ('terraform output -raw sqs_training_queue_url 2^>nul') do set SQS_TRAINING_QUEUE_URL=%%i
for /f "tokens=*" %%i in ('terraform output -raw sagemaker_role_arn 2^>nul') do set SAGEMAKER_ROLE_ARN=%%i
for /f "tokens=*" %%i in ('terraform output -raw ec2_public_ip 2^>nul') do set EC2_PUBLIC_IP=%%i

REM Validate outputs
if "%RDS_ENDPOINT%"=="" (
    echo Error: Could not retrieve Terraform outputs
    echo Please ensure Terraform is deployed successfully
    cd ..\..
    pause
    exit /b 1
)

echo [OK] Terraform outputs retrieved
echo.

REM Retrieve database password from Secrets Manager
echo Retrieving database password from Secrets Manager...
for /f "tokens=*" %%i in ('aws secretsmanager get-secret-value --secret-id "%DB_SECRET_ARN%" --query SecretString --output text') do set SECRET_JSON=%%i

REM Parse password from JSON (simplified - assumes password is the only field)
REM For production, use PowerShell or jq for proper JSON parsing
echo %SECRET_JSON% > temp_secret.json
for /f "tokens=2 delims=:}" %%i in ('type temp_secret.json ^| findstr "password"') do set DB_PASSWORD_RAW=%%i
set DB_PASSWORD=%DB_PASSWORD_RAW:"=%
set DB_PASSWORD=%DB_PASSWORD: =%
del temp_secret.json

if "%DB_PASSWORD%"=="" (
    echo Error: Could not retrieve database password
    echo Please retrieve manually: aws secretsmanager get-secret-value --secret-id %DB_SECRET_ARN%
    cd ..\..
    pause
    exit /b 1
)

echo [OK] Database password retrieved
echo.

REM Extract RDS host from endpoint
for /f "tokens=1 delims=:" %%i in ("%RDS_ENDPOINT%") do set DB_HOST=%%i
set DB_PORT=5432
set DB_USER=neurocode_admin
if "%RDS_DATABASE_NAME%"=="" set RDS_DATABASE_NAME=neurocode
set DB_NAME=%RDS_DATABASE_NAME%

REM Generate JWT secret
set JWT_SECRET=change-this-in-production-%RANDOM%%RANDOM%%RANDOM%

REM Go back to project root
cd ..\..

REM Create backend .env file
set BACKEND_ENV_FILE=backend\api-gateway\.env
echo Creating backend environment file: %BACKEND_ENV_FILE%

if not exist "backend\api-gateway" mkdir "backend\api-gateway"

(
echo # NeuroCode AI - Backend Environment Configuration
echo # Generated: %DATE% %TIME%
echo.
echo # Node Environment
echo NODE_ENV=production
echo PORT=4000
echo.
echo # AWS Configuration
echo AWS_REGION=%AWS_REGION%
echo.
echo # Database (RDS^)
echo DB_HOST=%DB_HOST%
echo DB_PORT=%DB_PORT%
echo DB_NAME=%DB_NAME%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo POSTGRES_URL=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%
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
echo # Secrets Manager
echo DB_SECRET_ARN=%DB_SECRET_ARN%
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
echo Creating ML training environment file: %ML_ENV_FILE%

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
echo Creating root environment file: %ROOT_ENV_FILE%

(
echo # NeuroCode AI - Root Environment Configuration
echo # Generated: %DATE% %TIME%
echo.
echo # AWS Configuration
echo AWS_REGION=%AWS_REGION%
echo AWS_ACCOUNT_ID=%AWS_ACCOUNT_ID%
echo.
echo # Infrastructure
echo EC2_PUBLIC_IP=%EC2_PUBLIC_IP%
echo RDS_ENDPOINT=%RDS_ENDPOINT%
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
echo # Database
echo DB_HOST=%DB_HOST%
echo DB_PORT=%DB_PORT%
echo DB_NAME=%DB_NAME%
echo DB_USER=%DB_USER%
echo DB_SECRET_ARN=%DB_SECRET_ARN%
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
echo   1. Review the .env files
echo   2. Test database connection
echo   3. Start the application: start-local.bat
echo   4. Deploy to EC2: ssh ec2-user@%EC2_PUBLIC_IP%
echo.
echo All AWS credentials configured successfully!
echo.
pause
