# NeuroCode AI — AWS Deployment Guide

## Architecture Overview

```
┌─────────────┐        ┌──────────────────┐
│   Frontend   │──API──▶│  FastAPI Backend  │
│  (React/S3)  │◀──────│  (EC2 / ECS)     │
└─────────────┘        └────────┬─────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                  │
        ┌─────▼─────┐   ┌──────▼──────┐   ┌──────▼──────┐
        │    S3      │   │  DynamoDB   │   │   Bedrock   │
        │ (snippets/ │   │ (analyses)  │   │  (Claude 3) │
        │  uploads)  │   └──────▲──────┘   └─────────────┘
        └─────┬─────┘          │
              │          ┌─────┴──────┐
              │          │   Lambda   │ ◀── SQS Queue
              └─────────▶│ (process)  │     (async jobs)
                         └────────────┘
                                │
                         ┌──────▼──────┐
                         │ CloudWatch  │
                         │ (logs +     │
                         │  metrics)   │
                         └─────────────┘
```

### Data Flow

1. **User submits code** → Frontend calls `POST /analyze`
2. **Backend analyzes** → Bedrock (AI) + local engines produce explanations
3. **Code stored in S3** → Encrypted at rest with KMS
4. **Metadata stored in DynamoDB** → analysis_id, scores, results
5. **Background job queued to SQS** → deep analysis task
6. **Lambda processes the job** → reads from S3, runs extended analysis
7. **Results written to DynamoDB** → status updated to "processed"
8. **Frontend polls** → `GET /analysis/{id}` returns full results
9. **CloudWatch** → structured logs + custom metrics (latency, error rates)

---

## 1. Prerequisites

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Configure credentials (for local dev only — use IAM roles on AWS)
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Output (json)

# Install Terraform
# https://developer.hashicorp.com/terraform/downloads
```

---

## 2. Deploy Infrastructure with Terraform

```bash
cd infra/

# Initialize Terraform
terraform init

# Preview changes
terraform plan -var="environment=production" -var="aws_region=us-east-1"

# Apply
terraform apply -var="environment=production" -var="aws_region=us-east-1"

# Note the outputs:
# s3_bucket           = "neurocode-ai-production-snippets"
# dynamodb_table      = "neurocode-ai-production-analyses"
# sqs_queue_url       = "https://sqs.us-east-1.amazonaws.com/..."
# lambda_function     = "neurocode-ai-production-process-job"
# backend_instance_profile = "neurocode-ai-production-backend-profile"
```

---

## 3. Deploy with AWS CLI (Alternative)

If you prefer CLI over Terraform:

### 3a. Create S3 Bucket

```bash
aws s3 mb s3://neurocode-ai-snippets --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket neurocode-ai-snippets \
  --versioning-configuration Status=Enabled

# Enable default encryption
aws s3api put-bucket-encryption \
  --bucket neurocode-ai-snippets \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms"}, "BucketKeyEnabled": true}]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket neurocode-ai-snippets \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### 3b. Create DynamoDB Table

```bash
aws dynamodb create-table \
  --table-name neurocode-analyses \
  --attribute-definitions \
    AttributeName=analysis_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
    AttributeName=created_at,AttributeType=S \
  --key-schema AttributeName=analysis_id,KeyType=HASH \
  --global-secondary-indexes '[
    {
      "IndexName": "user_id-created_at-index",
      "KeySchema": [
        {"AttributeName": "user_id", "KeyType": "HASH"},
        {"AttributeName": "created_at", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"}
    }
  ]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 3c. Create SQS Queue

```bash
# Create dead-letter queue first
aws sqs create-queue --queue-name neurocode-jobs-dlq

# Get DLQ ARN
DLQ_ARN=$(aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name neurocode-jobs-dlq --query QueueUrl --output text) \
  --attribute-names QueueArn --query Attributes.QueueArn --output text)

# Create main queue with DLQ
aws sqs create-queue \
  --queue-name neurocode-jobs \
  --attributes '{
    "VisibilityTimeout": "300",
    "MessageRetentionPeriod": "86400",
    "ReceiveMessageWaitTimeSeconds": "10",
    "RedrivePolicy": "{\"deadLetterTargetArn\":\"'$DLQ_ARN'\",\"maxReceiveCount\":\"3\"}"
  }'
```

### 3d. Deploy Lambda

```bash
# Package
cd backend/
zip lambda_handler.zip lambda_handler.py

# Create function (requires lambda-role ARN)
aws lambda create-function \
  --function-name neurocode-process-job \
  --runtime python3.12 \
  --handler lambda_handler.lambda_handler \
  --role arn:aws:iam::ACCOUNT_ID:role/neurocode-ai-lambda-role \
  --zip-file fileb://lambda_handler.zip \
  --timeout 300 \
  --memory-size 256 \
  --environment "Variables={DYNAMODB_TABLE=neurocode-analyses,S3_BUCKET=neurocode-ai-snippets}"

# Wire SQS trigger
aws lambda create-event-source-mapping \
  --function-name neurocode-process-job \
  --event-source-arn arn:aws:sqs:us-east-1:ACCOUNT_ID:neurocode-jobs \
  --batch-size 5
```

---

## 4. IAM Policies

### Backend (EC2/ECS) Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::neurocode-ai-snippets", "arn:aws:s3:::neurocode-ai-snippets/*"]
    },
    {
      "Sid": "DynamoDB",
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:Query"],
      "Resource": ["arn:aws:dynamodb:us-east-1:*:table/neurocode-analyses", "arn:aws:dynamodb:us-east-1:*:table/neurocode-analyses/index/*"]
    },
    {
      "Sid": "SQSSend",
      "Effect": "Allow",
      "Action": ["sqs:SendMessage", "sqs:GetQueueAttributes"],
      "Resource": ["arn:aws:sqs:us-east-1:*:neurocode-jobs"]
    },
    {
      "Sid": "LambdaInvoke",
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": ["arn:aws:lambda:us-east-1:*:function:neurocode-process-job"]
    },
    {
      "Sid": "BedrockInvoke",
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": ["arn:aws:bedrock:us-east-1::foundation-model/*"]
    },
    {
      "Sid": "CloudWatch",
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "cloudwatch:PutMetricData"],
      "Resource": ["*"]
    }
  ]
}
```

### Lambda Execution Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Read",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::neurocode-ai-snippets/*"]
    },
    {
      "Sid": "DynamoDB",
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"],
      "Resource": ["arn:aws:dynamodb:us-east-1:*:table/neurocode-analyses"]
    },
    {
      "Sid": "SQSConsume",
      "Effect": "Allow",
      "Action": ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"],
      "Resource": ["arn:aws:sqs:us-east-1:*:neurocode-jobs"]
    },
    {
      "Sid": "Logs",
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": ["arn:aws:logs:us-east-1:*:*"]
    }
  ]
}
```

---

## 5. Configure the Backend

Copy `.env.example` → `.env` and fill in Terraform outputs:

```bash
cp .env.example .env

# Update with actual values from `terraform output`:
AWS_REGION=us-east-1
S3_BUCKET=neurocode-ai-production-snippets
DYNAMODB_TABLE=neurocode-ai-production-analyses
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/neurocode-ai-production-jobs
LAMBDA_FUNCTION_NAME=neurocode-ai-production-process-job
CLOUDWATCH_LOG_GROUP=/neurocode-ai/backend
ENVIRONMENT=production
LOG_LEVEL=INFO
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

---

## 6. Run the Backend

```bash
cd backend/
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 7. API Endpoints

| Method | Path                     | Description                        |
|--------|--------------------------|------------------------------------|
| GET    | `/`                      | API status                         |
| GET    | `/health`                | Health check + service status      |
| POST   | `/analyze`               | Analyze code (returns analysis_id) |
| POST   | `/upload`                | Upload file to S3 + trigger Lambda |
| GET    | `/analysis/{id}`         | Get analysis results from DynamoDB |
| GET    | `/analyses?user_id=...`  | List user's recent analyses        |
| GET    | `/files?user_id=...`     | List user's uploaded files         |
| GET    | `/download-url?key=...`  | Get pre-signed S3 download URL     |
| GET    | `/queue-status`          | SQS queue depth                    |

---

## 8. Security Best Practices

- **IAM Roles** — EC2 instance profile / ECS task role; no access keys in code or env
- **Least-privilege IAM** — each service gets only the actions it needs
- **S3 encryption** — KMS server-side encryption + public access blocked
- **DynamoDB encryption** — enabled by default (AWS-managed keys)
- **SQS dead-letter queue** — failed jobs captured after 3 retries
- **CORS restricted** — `ALLOWED_ORIGINS` limits frontend domains
- **HTTPS only** — terminate TLS at ALB or API Gateway
- **CloudWatch alarms** — set up on `ErrorCount` and `AnalysisLatencyMs`

---

## 9. Scalability Guidelines

- **DynamoDB** — PAY_PER_REQUEST auto-scales; switch to PROVISIONED with auto-scaling at predictable load
- **SQS + Lambda** — inherently scalable; Lambda concurrency controls prevent runaway costs
- **S3** — unlimited scale; use Glacier lifecycle for cost optimization
- **Backend** — deploy behind ALB with ECS Fargate auto-scaling or EC2 ASG
- **CloudWatch** — set metric alarms for latency > 5s and error rate > 5%
