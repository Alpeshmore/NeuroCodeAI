@echo off
REM Quick AWS Resource Creation Script
REM Creates S3 buckets, SQS queues, and IAM role for NeuroCode AI

echo ==========================================
echo NeuroCode AI - Quick AWS Resource Setup
echo ==========================================
echo.

REM Set AWS credentials
set AWS_ACCESS_KEY_ID=AKIAWT6OT7TZ3KYYURCM
set AWS_SECRET_ACCESS_KEY=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
set AWS_DEFAULT_REGION=us-east-1

REM Check AWS CLI
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] AWS CLI not installed
    pause
    exit /b 1
)

echo [OK] AWS CLI found
echo.

REM Verify credentials
echo Verifying AWS credentials...
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] AWS credentials invalid
    pause
    exit /b 1
)

echo [OK] AWS credentials verified
echo.

REM Get account ID
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set AWS_ACCOUNT_ID=%%i
echo AWS Account ID: %AWS_ACCOUNT_ID%
echo.

echo This script will create:
echo   - 2 S3 buckets (datasets and models)
echo   - 2 SQS queues (analysis and training)
echo   - 1 IAM role (SageMaker)
echo.
echo Estimated cost: ~$13/month
echo.
set /p CONTINUE="Continue? (y/n): "
if /i not "%CONTINUE%"=="y" exit /b 0

echo.
echo Creating AWS resources...
echo.

REM Generate unique suffix
set TIMESTAMP=%RANDOM%%RANDOM%

REM Create S3 buckets
echo [1/5] Creating S3 datasets bucket...
set DATASETS_BUCKET=neurocode-ai-datasets-%TIMESTAMP%
aws s3 mb s3://%DATASETS_BUCKET% --region us-east-1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Created: %DATASETS_BUCKET%
) else (
    echo [ERROR] Failed to create datasets bucket
)

echo.
echo [2/5] Creating S3 models bucket...
set MODELS_BUCKET=neurocode-ai-models-%TIMESTAMP%
aws s3 mb s3://%MODELS_BUCKET% --region us-east-1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Created: %MODELS_BUCKET%
) else (
    echo [ERROR] Failed to create models bucket
)

echo.
echo [3/5] Creating SQS analysis queue...
for /f "tokens=*" %%i in ('aws sqs create-queue --queue-name neurocode-ai-analysis-queue --query QueueUrl --output text') do set ANALYSIS_QUEUE_URL=%%i
if defined ANALYSIS_QUEUE_URL (
    echo [OK] Created: %ANALYSIS_QUEUE_URL%
) else (
    echo [ERROR] Failed to create analysis queue
)

echo.
echo [4/5] Creating SQS training queue...
for /f "tokens=*" %%i in ('aws sqs create-queue --queue-name neurocode-ai-training-queue --query QueueUrl --output text') do set TRAINING_QUEUE_URL=%%i
if defined TRAINING_QUEUE_URL (
    echo [OK] Created: %TRAINING_QUEUE_URL%
) else (
    echo [ERROR] Failed to create training queue
)

echo.
echo [5/5] Creating SageMaker IAM role...

REM Create trust policy file
(
echo {
echo   "Version": "2012-10-17",
echo   "Statement": [{
echo     "Effect": "Allow",
echo     "Principal": {"Service": "sagemaker.amazonaws.com"},
echo     "Action": "sts:AssumeRole"
echo   }]
echo }
) > sagemaker-trust-policy.json

REM Create role
aws iam create-role ^
  --role-name neurocode-ai-sagemaker-role ^
  --assume-role-policy-document file://sagemaker-trust-policy.json >nul 2>nul

REM Attach policies
aws iam attach-role-policy ^
  --role-name neurocode-ai-sagemaker-role ^
  --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess >nul 2>nul

aws iam attach-role-policy ^
  --role-name neurocode-ai-sagemaker-role ^
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess >nul 2>nul

REM Get role ARN
for /f "tokens=*" %%i in ('aws iam get-role --role-name neurocode-ai-sagemaker-role --query Role.Arn --output text 2^>nul') do set SAGEMAKER_ROLE_ARN=%%i

if defined SAGEMAKER_ROLE_ARN (
    echo [OK] Created: %SAGEMAKER_ROLE_ARN%
) else (
    echo [WARNING] Role may already exist
    set SAGEMAKER_ROLE_ARN=arn:aws:iam::%AWS_ACCOUNT_ID%:role/neurocode-ai-sagemaker-role
)

REM Clean up
del sagemaker-trust-policy.json >nul 2>nul

echo.
echo ==========================================
echo Resources Created Successfully!
echo ==========================================
echo.
echo S3 Datasets Bucket: %DATASETS_BUCKET%
echo S3 Models Bucket: %MODELS_BUCKET%
echo SQS Analysis Queue: %ANALYSIS_QUEUE_URL%
echo SQS Training Queue: %TRAINING_QUEUE_URL%
echo SageMaker Role ARN: %SAGEMAKER_ROLE_ARN%
echo.

REM Update .env files
echo Updating configuration files...
echo.

REM Update backend .env
powershell -Command "(Get-Content 'backend\api-gateway\.env') -replace 'S3_DATASETS_BUCKET=.*', 'S3_DATASETS_BUCKET=%DATASETS_BUCKET%' | Set-Content 'backend\api-gateway\.env'"
powershell -Command "(Get-Content 'backend\api-gateway\.env') -replace 'S3_MODELS_BUCKET=.*', 'S3_MODELS_BUCKET=%MODELS_BUCKET%' | Set-Content 'backend\api-gateway\.env'"
powershell -Command "(Get-Content 'backend\api-gateway\.env') -replace 'SQS_ANALYSIS_QUEUE_URL=.*', 'SQS_ANALYSIS_QUEUE_URL=%ANALYSIS_QUEUE_URL%' | Set-Content 'backend\api-gateway\.env'"
powershell -Command "(Get-Content 'backend\api-gateway\.env') -replace 'SQS_TRAINING_QUEUE_URL=.*', 'SQS_TRAINING_QUEUE_URL=%TRAINING_QUEUE_URL%' | Set-Content 'backend\api-gateway\.env'"
powershell -Command "(Get-Content 'backend\api-gateway\.env') -replace 'SAGEMAKER_ROLE_ARN=.*', 'SAGEMAKER_ROLE_ARN=%SAGEMAKER_ROLE_ARN%' | Set-Content 'backend\api-gateway\.env'"

REM Update ML .env
powershell -Command "(Get-Content 'ml\sagemaker-training\.env') -replace 'S3_DATASETS_BUCKET=.*', 'S3_DATASETS_BUCKET=%DATASETS_BUCKET%' | Set-Content 'ml\sagemaker-training\.env'"
powershell -Command "(Get-Content 'ml\sagemaker-training\.env') -replace 'S3_MODELS_BUCKET=.*', 'S3_MODELS_BUCKET=%MODELS_BUCKET%' | Set-Content 'ml\sagemaker-training\.env'"
powershell -Command "(Get-Content 'ml\sagemaker-training\.env') -replace 'SQS_TRAINING_QUEUE_URL=.*', 'SQS_TRAINING_QUEUE_URL=%TRAINING_QUEUE_URL%' | Set-Content 'ml\sagemaker-training\.env'"
powershell -Command "(Get-Content 'ml\sagemaker-training\.env') -replace 'SAGEMAKER_ROLE_ARN=.*', 'SAGEMAKER_ROLE_ARN=%SAGEMAKER_ROLE_ARN%' | Set-Content 'ml\sagemaker-training\.env'"

REM Update root .env
powershell -Command "(Get-Content '.env') -replace 'S3_DATASETS_BUCKET=.*', 'S3_DATASETS_BUCKET=%DATASETS_BUCKET%' | Set-Content '.env'"
powershell -Command "(Get-Content '.env') -replace 'S3_MODELS_BUCKET=.*', 'S3_MODELS_BUCKET=%MODELS_BUCKET%' | Set-Content '.env'"
powershell -Command "(Get-Content '.env') -replace 'SQS_ANALYSIS_QUEUE_URL=.*', 'SQS_ANALYSIS_QUEUE_URL=%ANALYSIS_QUEUE_URL%' | Set-Content '.env'"
powershell -Command "(Get-Content '.env') -replace 'SQS_TRAINING_QUEUE_URL=.*', 'SQS_TRAINING_QUEUE_URL=%TRAINING_QUEUE_URL%' | Set-Content '.env'"
powershell -Command "(Get-Content '.env') -replace 'SAGEMAKER_ROLE_ARN=.*', 'SAGEMAKER_ROLE_ARN=%SAGEMAKER_ROLE_ARN%' | Set-Content '.env'"

echo [OK] Configuration files updated
echo.

echo ==========================================
echo Next Steps:
echo ==========================================
echo.
echo 1. Create RDS database (optional for local dev):
echo    - Go to: https://console.aws.amazon.com/rds/
echo    - Create PostgreSQL database
echo    - Update DB_HOST and DB_PASSWORD in backend\api-gateway\.env
echo.
echo 2. Test connections:
echo    npm install
echo    npm run test:aws
echo.
echo 3. Start local development:
echo    start-local.bat
echo.
echo 4. Or deploy to EC2:
echo    See infra/README.md
echo.
echo Monthly cost: ~$13 (without RDS)
echo With RDS: ~$25/month
echo.
pause
