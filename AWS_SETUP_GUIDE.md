# AWS API Keys Setup Guide

## Overview

This guide will help you connect all required AWS API keys and credentials for NeuroCode AI.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Terraform deployed infrastructure (or manual AWS resource setup)

## Required AWS Services & Credentials

### 1. AWS CLI Configuration

First, configure your AWS CLI with your credentials:

```bash
aws configure
```

You'll need:
- **AWS Access Key ID**: Your IAM user access key
- **AWS Secret Access Key**: Your IAM user secret key
- **Default region**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

### 2. Required Environment Variables

The following AWS-related environment variables need to be configured:

#### Database (RDS)
- `DB_HOST` - RDS endpoint
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: neurocode)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password (from Secrets Manager)
- `POSTGRES_URL` - Full PostgreSQL connection string

#### S3 Buckets
- `S3_DATASETS_BUCKET` - Bucket for storing datasets
- `S3_MODELS_BUCKET` - Bucket for storing ML models
- `AWS_REGION` - AWS region (default: us-east-1)

#### SQS Queues
- `SQS_ANALYSIS_QUEUE_URL` - Queue URL for analysis requests
- `SQS_TRAINING_QUEUE_URL` - Queue URL for training jobs

#### SageMaker
- `SAGEMAKER_ROLE_ARN` - IAM role ARN for SageMaker execution

#### Secrets Manager
- `DB_SECRET_ARN` - ARN of the database password secret

## Setup Methods

### Method 1: Automatic Setup (After Terraform Deployment)

If you've deployed using Terraform, run this script:

```bash
cd "NeuroCode AI"
./setup-aws-credentials.sh
```

This will:
1. Extract all outputs from Terraform
2. Retrieve database password from Secrets Manager
3. Create `.env` file with all credentials
4. Validate the configuration

### Method 2: Manual Setup

#### Step 1: Get Terraform Outputs

```bash
cd "NeuroCode AI/infra/terraform"
terraform output -json > outputs.json
```

#### Step 2: Retrieve Database Password

```bash
# Get the secret ARN from Terraform outputs
SECRET_ARN=$(terraform output -raw db_secret_arn)

# Retrieve the password
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id $SECRET_ARN \
  --query SecretString \
  --output text | jq -r .password)
```

#### Step 3: Create Environment File

Create `backend/api-gateway/.env`:

```env
# Node Environment
NODE_ENV=production
PORT=4000

# AWS Configuration
AWS_REGION=us-east-1

# Database (RDS)
DB_HOST=<your-rds-endpoint>
DB_PORT=5432
DB_NAME=neurocode
DB_USER=neurocode_admin
DB_PASSWORD=<password-from-secrets-manager>
POSTGRES_URL=postgresql://neurocode_admin:<password>@<rds-endpoint>:5432/neurocode

# S3 Buckets
S3_DATASETS_BUCKET=<your-datasets-bucket>
S3_MODELS_BUCKET=<your-models-bucket>

# SQS Queues
SQS_ANALYSIS_QUEUE_URL=<your-analysis-queue-url>
SQS_TRAINING_QUEUE_URL=<your-training-queue-url>

# SageMaker
SAGEMAKER_ROLE_ARN=<your-sagemaker-role-arn>

# Secrets Manager
DB_SECRET_ARN=<your-secret-arn>

# JWT
JWT_SECRET=<generate-secure-random-string>

# Redis (if using)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

#### Step 4: Create ML Training Environment

Create `ml/sagemaker-training/.env`:

```env
# AWS Configuration
AWS_REGION=us-east-1
PROJECT_NAME=neurocode-ai

# S3 Buckets
S3_DATASETS_BUCKET=<your-datasets-bucket>
S3_MODELS_BUCKET=<your-models-bucket>

# SageMaker
SAGEMAKER_ROLE_ARN=<your-sagemaker-role-arn>

# SQS
SQS_TRAINING_QUEUE_URL=<your-training-queue-url>
```

### Method 3: Using AWS Systems Manager Parameter Store (Recommended for Production)

Store sensitive credentials in Parameter Store:

```bash
# Store database password
aws ssm put-parameter \
  --name "/neurocode-ai/db/password" \
  --value "<your-db-password>" \
  --type "SecureString" \
  --overwrite

# Store JWT secret
aws ssm put-parameter \
  --name "/neurocode-ai/jwt/secret" \
  --value "<your-jwt-secret>" \
  --type "SecureString" \
  --overwrite
```

Then modify your application to retrieve from Parameter Store at runtime.

## Verification Steps

### 1. Verify AWS CLI Access

```bash
aws sts get-caller-identity
```

Should return your AWS account details.

### 2. Verify S3 Access

```bash
# List datasets bucket
aws s3 ls s3://<your-datasets-bucket>/

# List models bucket
aws s3 ls s3://<your-models-bucket>/
```

### 3. Verify SQS Access

```bash
# Get queue attributes
aws sqs get-queue-attributes \
  --queue-url <your-analysis-queue-url> \
  --attribute-names All
```

### 4. Verify RDS Connection

```bash
# From EC2 or local machine with network access
psql -h <rds-endpoint> -U neurocode_admin -d neurocode -c "SELECT version();"
```

### 5. Verify Secrets Manager Access

```bash
aws secretsmanager get-secret-value \
  --secret-id <your-secret-arn> \
  --query SecretString \
  --output text
```

### 6. Test Application Connection

```bash
cd "NeuroCode AI/backend/api-gateway"
npm install
npm run test:aws-connection
```

## IAM Permissions Required

Your IAM user/role needs these permissions:

### For Development/Deployment
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::neurocode-ai-*",
        "arn:aws:s3:::neurocode-ai-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage",
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:*:*:neurocode-ai-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:neurocode-ai-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sagemaker:CreateTrainingJob",
        "sagemaker:DescribeTrainingJob",
        "sagemaker:StopTrainingJob"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Rotate credentials regularly** - Every 90 days minimum
3. **Use IAM roles on EC2** - Instead of access keys when possible
4. **Enable MFA** - For AWS console access
5. **Use least privilege** - Only grant necessary permissions
6. **Monitor access** - Enable CloudTrail logging
7. **Encrypt at rest** - All S3 buckets and RDS instances
8. **Use VPC endpoints** - For S3 and other services (cost optimization)

## Troubleshooting

### Issue: "Access Denied" errors

**Solution**: Check IAM permissions and ensure your user/role has required policies attached.

```bash
# Check current user permissions
aws iam get-user
aws iam list-attached-user-policies --user-name <your-username>
```

### Issue: "Invalid credentials"

**Solution**: Reconfigure AWS CLI or check if credentials expired.

```bash
aws configure list
aws sts get-caller-identity
```

### Issue: "Cannot connect to RDS"

**Solution**: Check security groups and network connectivity.

```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids <your-sg-id>

# Test from EC2 instance
telnet <rds-endpoint> 5432
```

### Issue: "Secret not found"

**Solution**: Verify secret ARN and region.

```bash
# List all secrets
aws secretsmanager list-secrets

# Get specific secret
aws secretsmanager describe-secret --secret-id <secret-arn>
```

## Quick Reference Commands

```bash
# Get all Terraform outputs
cd infra/terraform && terraform output

# Get RDS endpoint
terraform output -raw rds_endpoint

# Get S3 bucket names
terraform output -raw s3_datasets_bucket
terraform output -raw s3_models_bucket

# Get SQS queue URLs
terraform output -raw sqs_analysis_queue_url
terraform output -raw sqs_training_queue_url

# Get SageMaker role ARN
terraform output -raw sagemaker_role_arn

# Get database password
aws secretsmanager get-secret-value \
  --secret-id $(terraform output -raw db_secret_arn) \
  --query SecretString --output text | jq -r .password
```

## Next Steps

After setting up AWS credentials:

1. ✅ Verify all connections work
2. ✅ Test S3 upload/download
3. ✅ Test SQS message sending
4. ✅ Test database connection
5. ✅ Run application locally with AWS services
6. ✅ Deploy to EC2 if not already done
7. ✅ Monitor CloudWatch for any errors

## Support

If you encounter issues:
- Check CloudWatch Logs for detailed error messages
- Review IAM permissions
- Verify network connectivity (security groups, NACLs)
- Consult AWS documentation for specific services

---

**Status**: Ready for AWS integration
**Time to setup**: 10-15 minutes
**Prerequisites**: AWS account, Terraform deployed
