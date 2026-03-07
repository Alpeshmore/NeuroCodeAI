# AWS Manual Setup Guide (Without Terraform)

## Overview

This guide helps you set up AWS resources manually if you don't have Terraform installed or prefer manual configuration.

## Prerequisites

- AWS Account with admin access
- AWS CLI installed and configured
- Basic understanding of AWS services

## Option 1: Quick Setup with Existing Resources

If you already have AWS resources, run:

```bash
setup-aws-manual.bat
```

This will prompt you for your existing resource details and create the necessary .env files.

## Option 2: Create AWS Resources Manually

### Step 1: Create RDS PostgreSQL Database

1. Go to [RDS Console](https://console.aws.amazon.com/rds/)
2. Click "Create database"
3. Choose:
   - Engine: PostgreSQL
   - Version: 14 or later
   - Template: Free tier (or Dev/Test)
   - DB instance identifier: `neurocode-ai-db`
   - Master username: `neurocode_admin`
   - Master password: (create a strong password)
   - DB instance class: db.t3.micro
   - Storage: 20 GB
   - Public access: No (for security)
4. Click "Create database"
5. Wait for status to become "Available"
6. Note the endpoint (e.g., `neurocode-ai-db.xxxxx.us-east-1.rds.amazonaws.com`)

**Cost:** ~$12/month

### Step 2: Create S3 Buckets

#### Datasets Bucket

```bash
# Create bucket
aws s3 mb s3://neurocode-ai-datasets-$(date +%s)

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket neurocode-ai-datasets-xxxxx \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket neurocode-ai-datasets-xxxxx \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

#### Models Bucket

```bash
# Create bucket
aws s3 mb s3://neurocode-ai-models-$(date +%s)

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket neurocode-ai-models-xxxxx \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket neurocode-ai-models-xxxxx \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

**Cost:** ~$0.23/month for 10GB

### Step 3: Create SQS Queues

#### Analysis Queue

```bash
aws sqs create-queue \
  --queue-name neurocode-ai-analysis-queue \
  --attributes '{
    "VisibilityTimeout": "300",
    "MessageRetentionPeriod": "345600",
    "ReceiveMessageWaitTimeSeconds": "10"
  }'
```

#### Training Queue

```bash
aws sqs create-queue \
  --queue-name neurocode-ai-training-queue \
  --attributes '{
    "VisibilityTimeout": "3600",
    "MessageRetentionPeriod": "345600",
    "ReceiveMessageWaitTimeSeconds": "10"
  }'
```

**Get Queue URLs:**

```bash
aws sqs get-queue-url --queue-name neurocode-ai-analysis-queue
aws sqs get-queue-url --queue-name neurocode-ai-training-queue
```

**Cost:** ~$0.40/month for 1M requests

### Step 4: Create IAM Role for SageMaker

#### Create Trust Policy

Create file `sagemaker-trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "sagemaker.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Create Role

```bash
# Create role
aws iam create-role \
  --role-name neurocode-ai-sagemaker-role \
  --assume-role-policy-document file://sagemaker-trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name neurocode-ai-sagemaker-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess

aws iam attach-role-policy \
  --role-name neurocode-ai-sagemaker-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Get role ARN
aws iam get-role --role-name neurocode-ai-sagemaker-role --query 'Role.Arn' --output text
```

**Cost:** Free

### Step 5: Store Database Password in Secrets Manager (Optional)

```bash
aws secretsmanager create-secret \
  --name neurocode-ai-db-password \
  --description "Database password for NeuroCode AI" \
  --secret-string '{"password":"YOUR_DB_PASSWORD"}'
```

**Cost:** ~$0.40/month

### Step 6: Configure Security Groups

If your RDS is not publicly accessible, you'll need to:

1. Create an EC2 instance in the same VPC
2. Configure security groups to allow:
   - EC2 → RDS on port 5432
   - Your IP → EC2 on port 22 (SSH)

## Step 7: Run Manual Setup Script

Now that you have all resources, run:

```bash
setup-aws-manual.bat
```

Enter the details when prompted:
- RDS Endpoint: `neurocode-ai-db.xxxxx.us-east-1.rds.amazonaws.com`
- Database Name: `neurocode`
- Database Username: `neurocode_admin`
- Database Password: (your password)
- S3 Datasets Bucket: `neurocode-ai-datasets-xxxxx`
- S3 Models Bucket: `neurocode-ai-models-xxxxx`
- SQS Analysis Queue URL: `https://sqs.us-east-1.amazonaws.com/.../neurocode-ai-analysis-queue`
- SQS Training Queue URL: `https://sqs.us-east-1.amazonaws.com/.../neurocode-ai-training-queue`
- SageMaker Role ARN: `arn:aws:iam::account:role/neurocode-ai-sagemaker-role`

## Step 8: Test Connections

```bash
npm install
npm run test:aws
```

## Quick Resource Creation Script

Save this as `create-aws-resources.sh`:

```bash
#!/bin/bash

# Set variables
PROJECT_NAME="neurocode-ai"
REGION="us-east-1"
TIMESTAMP=$(date +%s)

echo "Creating AWS resources for NeuroCode AI..."

# Create S3 buckets
echo "Creating S3 buckets..."
DATASETS_BUCKET="${PROJECT_NAME}-datasets-${TIMESTAMP}"
MODELS_BUCKET="${PROJECT_NAME}-models-${TIMESTAMP}"

aws s3 mb s3://${DATASETS_BUCKET} --region ${REGION}
aws s3 mb s3://${MODELS_BUCKET} --region ${REGION}

# Create SQS queues
echo "Creating SQS queues..."
ANALYSIS_QUEUE_URL=$(aws sqs create-queue \
  --queue-name ${PROJECT_NAME}-analysis-queue \
  --region ${REGION} \
  --query 'QueueUrl' \
  --output text)

TRAINING_QUEUE_URL=$(aws sqs create-queue \
  --queue-name ${PROJECT_NAME}-training-queue \
  --region ${REGION} \
  --query 'QueueUrl' \
  --output text)

# Create IAM role for SageMaker
echo "Creating SageMaker IAM role..."
cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "sagemaker.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role \
  --role-name ${PROJECT_NAME}-sagemaker-role \
  --assume-role-policy-document file:///tmp/trust-policy.json

aws iam attach-role-policy \
  --role-name ${PROJECT_NAME}-sagemaker-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess

aws iam attach-role-policy \
  --role-name ${PROJECT_NAME}-sagemaker-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

SAGEMAKER_ROLE_ARN=$(aws iam get-role \
  --role-name ${PROJECT_NAME}-sagemaker-role \
  --query 'Role.Arn' \
  --output text)

# Output summary
echo ""
echo "==========================================
echo "AWS Resources Created Successfully!"
echo "=========================================="
echo ""
echo "S3 Datasets Bucket: ${DATASETS_BUCKET}"
echo "S3 Models Bucket: ${MODELS_BUCKET}"
echo "SQS Analysis Queue: ${ANALYSIS_QUEUE_URL}"
echo "SQS Training Queue: ${TRAINING_QUEUE_URL}"
echo "SageMaker Role ARN: ${SAGEMAKER_ROLE_ARN}"
echo ""
echo "Save these values for the setup script!"
echo ""
```

Make it executable and run:

```bash
chmod +x create-aws-resources.sh
./create-aws-resources.sh
```

## Cost Summary (Manual Setup)

| Resource | Monthly Cost |
|----------|--------------|
| RDS db.t3.micro | $12.41 |
| S3 (10GB) | $0.23 |
| SQS (1M requests) | $0.40 |
| Secrets Manager | $0.40 |
| **Total** | **~$13.44/month** |

Note: This is cheaper than full Terraform deployment as it doesn't include EC2 instance.

## Troubleshooting

### Cannot Connect to RDS

**Issue:** Connection timeout

**Solution:** 
- Check security group allows inbound on port 5432
- Ensure RDS is in same VPC as your application
- Or enable public access (not recommended for production)

### S3 Access Denied

**Issue:** Cannot list/upload to S3

**Solution:**
```bash
# Check your IAM permissions
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME

# Attach S3 full access policy
aws iam attach-user-policy \
  --user-name YOUR_USERNAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

### SQS Queue Not Found

**Issue:** Queue URL not working

**Solution:**
```bash
# List all queues
aws sqs list-queues

# Get specific queue URL
aws sqs get-queue-url --queue-name neurocode-ai-analysis-queue
```

## Next Steps

After manual setup:

1. ✅ Resources created
2. ✅ Configuration files generated
3. Test connections: `npm run test:aws`
4. Start local development: `start-local.bat`
5. Consider Terraform for production deployment

## Terraform Alternative

For easier management, consider installing Terraform:

1. Download: https://www.terraform.io/downloads
2. Install and add to PATH
3. Run:
   ```bash
   cd infra/terraform
   terraform init
   terraform apply
   ```

This automates everything and includes additional features like:
- VPC and networking
- Security groups
- CloudWatch monitoring
- Automated backups
- Cost optimization

---

**Need Help?**
- Check AWS Console for resource status
- Review CloudWatch logs for errors
- Run `npm run test:aws` for diagnostics
