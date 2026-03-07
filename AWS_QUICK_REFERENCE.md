# AWS Quick Reference - NeuroCode AI

## Quick Setup Commands

### Windows
```bash
# Run automated setup
setup-aws-credentials.bat

# Test connections
npm run test:aws
```

### Linux/Mac
```bash
# Make script executable
chmod +x setup-aws-credentials.sh

# Run automated setup
./setup-aws-credentials.sh

# Test connections
npm run test:aws
```

## Manual Configuration Steps

### 1. Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region: us-east-1
# Default output format: json
```

### 2. Verify AWS Access
```bash
# Check credentials
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# List SQS queues
aws sqs list-queues
```

### 3. Get Terraform Outputs
```bash
cd "NeuroCode AI/infra/terraform"

# Get all outputs
terraform output

# Get specific values
terraform output -raw rds_endpoint
terraform output -raw s3_datasets_bucket
terraform output -raw sqs_analysis_queue_url
```

### 4. Retrieve Database Password
```bash
# Get secret ARN
SECRET_ARN=$(terraform output -raw db_secret_arn)

# Get password
aws secretsmanager get-secret-value \
  --secret-id $SECRET_ARN \
  --query SecretString \
  --output text | jq -r .password
```

## Environment Variables Reference

### Backend (.env location: `backend/api-gateway/.env`)

```env
# AWS Configuration
AWS_REGION=us-east-1

# Database
DB_HOST=<rds-endpoint>
DB_PORT=5432
DB_NAME=neurocode
DB_USER=neurocode_admin
DB_PASSWORD=<from-secrets-manager>
POSTGRES_URL=postgresql://user:pass@host:5432/db

# S3
S3_DATASETS_BUCKET=neurocode-ai-datasets-xxxxx
S3_MODELS_BUCKET=neurocode-ai-models-xxxxx

# SQS
SQS_ANALYSIS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
SQS_TRAINING_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...

# SageMaker
SAGEMAKER_ROLE_ARN=arn:aws:iam::account:role/...

# Secrets Manager
DB_SECRET_ARN=arn:aws:secretsmanager:...

# Application
JWT_SECRET=<random-secure-string>
PORT=4000
NODE_ENV=production
```

### ML Training (.env location: `ml/sagemaker-training/.env`)

```env
AWS_REGION=us-east-1
PROJECT_NAME=neurocode-ai
S3_DATASETS_BUCKET=neurocode-ai-datasets-xxxxx
S3_MODELS_BUCKET=neurocode-ai-models-xxxxx
SAGEMAKER_ROLE_ARN=arn:aws:iam::account:role/...
SQS_TRAINING_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
```

## Common AWS Commands

### S3 Operations
```bash
# List bucket contents
aws s3 ls s3://neurocode-ai-datasets-xxxxx/

# Upload file
aws s3 cp dataset.json s3://neurocode-ai-datasets-xxxxx/datasets/

# Download file
aws s3 cp s3://neurocode-ai-models-xxxxx/model.tar.gz ./

# Sync directory
aws s3 sync ./local-dir s3://neurocode-ai-datasets-xxxxx/data/
```

### SQS Operations
```bash
# Send message
aws sqs send-message \
  --queue-url <queue-url> \
  --message-body '{"type":"analysis","code":"..."}'

# Receive messages
aws sqs receive-message \
  --queue-url <queue-url> \
  --max-number-of-messages 10

# Get queue depth
aws sqs get-queue-attributes \
  --queue-url <queue-url> \
  --attribute-names ApproximateNumberOfMessages
```

### RDS Operations
```bash
# Connect to database
psql -h <rds-endpoint> -U neurocode_admin -d neurocode

# Create backup
aws rds create-db-snapshot \
  --db-instance-identifier neurocode-ai-db \
  --db-snapshot-identifier backup-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier neurocode-ai-db
```

### Secrets Manager Operations
```bash
# Get secret value
aws secretsmanager get-secret-value \
  --secret-id <secret-arn> \
  --query SecretString \
  --output text

# Update secret
aws secretsmanager update-secret \
  --secret-id <secret-arn> \
  --secret-string '{"password":"new-password"}'

# List secrets
aws secretsmanager list-secrets
```

### SageMaker Operations
```bash
# List training jobs
aws sagemaker list-training-jobs

# Describe training job
aws sagemaker describe-training-job \
  --training-job-name <job-name>

# Stop training job
aws sagemaker stop-training-job \
  --training-job-name <job-name>

# View logs
aws logs tail /aws/sagemaker/TrainingJobs --follow
```

### EC2 Operations
```bash
# Get instance info
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=neurocode-ai-*"

# Start instance
aws ec2 start-instances --instance-ids <instance-id>

# Stop instance
aws ec2 stop-instances --instance-ids <instance-id>

# SSH to instance
ssh -i ~/.ssh/id_rsa ec2-user@<public-ip>
```

## Testing Connections

### Test S3 Access
```javascript
// Using AWS SDK
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const s3 = new S3Client({ region: 'us-east-1' });
const response = await s3.send(new ListObjectsV2Command({
  Bucket: 'neurocode-ai-datasets-xxxxx'
}));
```

### Test SQS Access
```javascript
// Using AWS SDK
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const sqs = new SQSClient({ region: 'us-east-1' });
const response = await sqs.send(new SendMessageCommand({
  QueueUrl: 'https://sqs.us-east-1.amazonaws.com/...',
  MessageBody: JSON.stringify({ test: true })
}));
```

### Test Database Connection
```javascript
// Using pg
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST,
  port: 5432,
  database: 'neurocode',
  user: 'neurocode_admin',
  password: process.env.DB_PASSWORD
});
await client.connect();
const result = await client.query('SELECT NOW()');
await client.end();
```

## Troubleshooting

### Issue: "Credentials not configured"
```bash
# Solution: Configure AWS CLI
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_DEFAULT_REGION=us-east-1
```

### Issue: "Access Denied"
```bash
# Check IAM permissions
aws iam get-user
aws iam list-attached-user-policies --user-name <username>

# Verify resource exists
aws s3 ls s3://bucket-name/
aws sqs get-queue-url --queue-name queue-name
```

### Issue: "Cannot connect to RDS"
```bash
# Check security group
aws ec2 describe-security-groups --group-ids <sg-id>

# Test network connectivity
telnet <rds-endpoint> 5432
nc -zv <rds-endpoint> 5432

# Check from EC2 instance
ssh ec2-user@<ec2-ip>
psql -h <rds-endpoint> -U neurocode_admin -d neurocode
```

### Issue: "Secret not found"
```bash
# List all secrets
aws secretsmanager list-secrets

# Check secret details
aws secretsmanager describe-secret --secret-id <secret-name>

# Verify region
aws secretsmanager list-secrets --region us-east-1
```

## Cost Monitoring

### Check Current Costs
```bash
# Current month
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost"

# By service
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=SERVICE
```

### Set Billing Alerts
```bash
# Create SNS topic
aws sns create-topic --name billing-alerts

# Subscribe email
aws sns subscribe \
  --topic-arn <topic-arn> \
  --protocol email \
  --notification-endpoint your-email@example.com

# Create CloudWatch alarm
aws cloudwatch put-metric-alarm \
  --alarm-name billing-alert-100 \
  --alarm-description "Alert when charges exceed $100" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions <sns-topic-arn>
```

## Security Best Practices

1. **Rotate credentials every 90 days**
   ```bash
   aws iam create-access-key --user-name <username>
   aws iam delete-access-key --access-key-id <old-key> --user-name <username>
   ```

2. **Enable MFA for AWS console**
   ```bash
   aws iam enable-mfa-device --user-name <username> --serial-number <mfa-arn> --authentication-code1 <code1> --authentication-code2 <code2>
   ```

3. **Use IAM roles on EC2 instead of access keys**
   - Already configured in Terraform
   - No need to store credentials on EC2

4. **Enable CloudTrail for audit logging**
   ```bash
   aws cloudtrail create-trail --name neurocode-audit --s3-bucket-name audit-logs
   aws cloudtrail start-logging --name neurocode-audit
   ```

5. **Review IAM policies regularly**
   ```bash
   aws iam get-policy-version --policy-arn <policy-arn> --version-id <version>
   ```

## Quick Links

- [AWS Console](https://console.aws.amazon.com/)
- [S3 Console](https://s3.console.aws.amazon.com/)
- [RDS Console](https://console.aws.amazon.com/rds/)
- [SQS Console](https://console.aws.amazon.com/sqs/)
- [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
- [IAM Console](https://console.aws.amazon.com/iam/)
- [Secrets Manager Console](https://console.aws.amazon.com/secretsmanager/)
- [SageMaker Console](https://console.aws.amazon.com/sagemaker/)

## Support Resources

- **Documentation**: See AWS_SETUP_GUIDE.md
- **Terraform Outputs**: `cd infra/terraform && terraform output`
- **Test Script**: `npm run test:aws`
- **AWS CLI Docs**: https://docs.aws.amazon.com/cli/
- **AWS SDK Docs**: https://docs.aws.amazon.com/sdk-for-javascript/

---

**Last Updated**: 2026-03-07
**Version**: 1.0.0
