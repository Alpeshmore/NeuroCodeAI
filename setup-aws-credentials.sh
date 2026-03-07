#!/bin/bash

# NeuroCode AI - AWS Credentials Setup Script
# This script automatically configures all AWS API keys and credentials

set -e

echo "=========================================="
echo "NeuroCode AI - AWS Credentials Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq is not installed. Installing...${NC}"
    # Try to install jq based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y jq || sudo yum install -y jq
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    else
        echo -e "${RED}Please install jq manually: https://stedolan.github.io/jq/${NC}"
        exit 1
    fi
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Please run: aws configure"
    exit 1
fi

echo -e "${GREEN}✓ AWS credentials verified${NC}"
echo ""

# Get AWS account info
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"
echo ""

# Check if Terraform is deployed
TERRAFORM_DIR="infra/terraform"
if [ ! -d "$TERRAFORM_DIR" ]; then
    echo -e "${RED}Error: Terraform directory not found${NC}"
    exit 1
fi

cd "$TERRAFORM_DIR"

if [ ! -f "terraform.tfstate" ]; then
    echo -e "${YELLOW}Warning: Terraform state not found${NC}"
    echo "Have you deployed the infrastructure? (terraform apply)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Retrieving Terraform outputs..."
echo ""

# Get Terraform outputs
get_output() {
    terraform output -raw "$1" 2>/dev/null || echo ""
}

RDS_ENDPOINT=$(get_output "rds_endpoint")
RDS_DATABASE_NAME=$(get_output "rds_database_name")
DB_SECRET_ARN=$(get_output "db_secret_arn")
S3_DATASETS_BUCKET=$(get_output "s3_datasets_bucket")
S3_MODELS_BUCKET=$(get_output "s3_models_bucket")
SQS_ANALYSIS_QUEUE_URL=$(get_output "sqs_analysis_queue_url")
SQS_TRAINING_QUEUE_URL=$(get_output "sqs_training_queue_url")
SAGEMAKER_ROLE_ARN=$(get_output "sagemaker_role_arn")
EC2_PUBLIC_IP=$(get_output "ec2_public_ip")

# Validate outputs
if [ -z "$RDS_ENDPOINT" ] || [ -z "$S3_DATASETS_BUCKET" ]; then
    echo -e "${RED}Error: Could not retrieve Terraform outputs${NC}"
    echo "Please ensure Terraform is deployed successfully"
    exit 1
fi

echo -e "${GREEN}✓ Terraform outputs retrieved${NC}"
echo ""

# Retrieve database password from Secrets Manager
echo "Retrieving database password from Secrets Manager..."
DB_PASSWORD=$(aws secretsmanager get-secret-value \
    --secret-id "$DB_SECRET_ARN" \
    --query SecretString \
    --output text 2>/dev/null | jq -r .password)

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Could not retrieve database password${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database password retrieved${NC}"
echo ""

# Extract RDS host from endpoint (remove :5432)
DB_HOST="${RDS_ENDPOINT%:*}"
DB_PORT="5432"
DB_USER="neurocode_admin"
DB_NAME="${RDS_DATABASE_NAME:-neurocode}"

# Generate JWT secret if not exists
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "change-this-in-production-$(date +%s)")

# Go back to project root
cd ../..

# Create backend .env file
BACKEND_ENV_FILE="backend/api-gateway/.env"
echo "Creating backend environment file: $BACKEND_ENV_FILE"

mkdir -p "$(dirname "$BACKEND_ENV_FILE")"

cat > "$BACKEND_ENV_FILE" << EOF
# NeuroCode AI - Backend Environment Configuration
# Generated: $(date)

# Node Environment
NODE_ENV=production
PORT=4000

# AWS Configuration
AWS_REGION=$AWS_REGION

# Database (RDS)
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
POSTGRES_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME

# S3 Buckets
S3_DATASETS_BUCKET=$S3_DATASETS_BUCKET
S3_MODELS_BUCKET=$S3_MODELS_BUCKET

# SQS Queues
SQS_ANALYSIS_QUEUE_URL=$SQS_ANALYSIS_QUEUE_URL
SQS_TRAINING_QUEUE_URL=$SQS_TRAINING_QUEUE_URL

# SageMaker
SAGEMAKER_ROLE_ARN=$SAGEMAKER_ROLE_ARN

# Secrets Manager
DB_SECRET_ARN=$DB_SECRET_ARN

# JWT
JWT_SECRET=$JWT_SECRET

# Redis (local)
REDIS_URL=redis://localhost:6379

# RabbitMQ (local)
RABBITMQ_URL=amqp://localhost:5672

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
EOF

echo -e "${GREEN}✓ Backend .env file created${NC}"
echo ""

# Create ML training .env file
ML_ENV_FILE="ml/sagemaker-training/.env"
echo "Creating ML training environment file: $ML_ENV_FILE"

mkdir -p "$(dirname "$ML_ENV_FILE")"

cat > "$ML_ENV_FILE" << EOF
# NeuroCode AI - ML Training Environment Configuration
# Generated: $(date)

# AWS Configuration
AWS_REGION=$AWS_REGION
PROJECT_NAME=neurocode-ai

# S3 Buckets
S3_DATASETS_BUCKET=$S3_DATASETS_BUCKET
S3_MODELS_BUCKET=$S3_MODELS_BUCKET

# SageMaker
SAGEMAKER_ROLE_ARN=$SAGEMAKER_ROLE_ARN

# SQS
SQS_TRAINING_QUEUE_URL=$SQS_TRAINING_QUEUE_URL
EOF

echo -e "${GREEN}✓ ML training .env file created${NC}"
echo ""

# Create root .env file for convenience
ROOT_ENV_FILE=".env"
echo "Creating root environment file: $ROOT_ENV_FILE"

cat > "$ROOT_ENV_FILE" << EOF
# NeuroCode AI - Root Environment Configuration
# Generated: $(date)

# AWS Configuration
AWS_REGION=$AWS_REGION
AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID

# Infrastructure
EC2_PUBLIC_IP=$EC2_PUBLIC_IP
RDS_ENDPOINT=$RDS_ENDPOINT

# S3 Buckets
S3_DATASETS_BUCKET=$S3_DATASETS_BUCKET
S3_MODELS_BUCKET=$S3_MODELS_BUCKET

# SQS Queues
SQS_ANALYSIS_QUEUE_URL=$SQS_ANALYSIS_QUEUE_URL
SQS_TRAINING_QUEUE_URL=$SQS_TRAINING_QUEUE_URL

# SageMaker
SAGEMAKER_ROLE_ARN=$SAGEMAKER_ROLE_ARN

# Database
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_SECRET_ARN=$DB_SECRET_ARN
EOF

echo -e "${GREEN}✓ Root .env file created${NC}"
echo ""

# Verify connections
echo "=========================================="
echo "Verifying AWS Connections"
echo "=========================================="
echo ""

# Test S3 access
echo "Testing S3 access..."
if aws s3 ls "s3://$S3_DATASETS_BUCKET" &> /dev/null; then
    echo -e "${GREEN}✓ S3 datasets bucket accessible${NC}"
else
    echo -e "${YELLOW}⚠ S3 datasets bucket not accessible (may not exist yet)${NC}"
fi

if aws s3 ls "s3://$S3_MODELS_BUCKET" &> /dev/null; then
    echo -e "${GREEN}✓ S3 models bucket accessible${NC}"
else
    echo -e "${YELLOW}⚠ S3 models bucket not accessible (may not exist yet)${NC}"
fi

# Test SQS access
echo "Testing SQS access..."
if aws sqs get-queue-attributes --queue-url "$SQS_ANALYSIS_QUEUE_URL" --attribute-names All &> /dev/null; then
    echo -e "${GREEN}✓ SQS analysis queue accessible${NC}"
else
    echo -e "${YELLOW}⚠ SQS analysis queue not accessible${NC}"
fi

if aws sqs get-queue-attributes --queue-url "$SQS_TRAINING_QUEUE_URL" --attribute-names All &> /dev/null; then
    echo -e "${GREEN}✓ SQS training queue accessible${NC}"
else
    echo -e "${YELLOW}⚠ SQS training queue not accessible${NC}"
fi

# Test Secrets Manager access
echo "Testing Secrets Manager access..."
if aws secretsmanager describe-secret --secret-id "$DB_SECRET_ARN" &> /dev/null; then
    echo -e "${GREEN}✓ Secrets Manager accessible${NC}"
else
    echo -e "${YELLOW}⚠ Secrets Manager not accessible${NC}"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Environment files created:"
echo "  - $BACKEND_ENV_FILE"
echo "  - $ML_ENV_FILE"
echo "  - $ROOT_ENV_FILE"
echo ""
echo "Next steps:"
echo "  1. Review the .env files"
echo "  2. Test database connection: psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
echo "  3. Start the application: ./start-local.bat"
echo "  4. Deploy to EC2: ssh ec2-user@$EC2_PUBLIC_IP"
echo ""
echo -e "${GREEN}All AWS credentials configured successfully!${NC}"
