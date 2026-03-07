# AWS Integration for NeuroCode AI

## Overview

This guide covers the complete AWS integration for NeuroCode AI, including all required API keys, credentials, and service configurations.

## What's Included

NeuroCode AI integrates with the following AWS services:

- **RDS PostgreSQL** - Primary database
- **S3** - Dataset and model storage
- **SQS** - Message queuing for async processing
- **Secrets Manager** - Secure credential storage
- **SageMaker** - ML model training
- **EC2** - Application hosting
- **CloudWatch** - Monitoring and logging
- **IAM** - Access management

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup-aws-credentials.bat
```

**Linux/Mac:**
```bash
chmod +x setup-aws-credentials.sh
./setup-aws-credentials.sh
```

This will:
1. ✅ Verify AWS CLI configuration
2. ✅ Retrieve all Terraform outputs
3. ✅ Get database password from Secrets Manager
4. ✅ Create all required .env files
5. ✅ Test all AWS connections

### Option 2: Manual Setup

See [AWS_SETUP_GUIDE.md](AWS_SETUP_GUIDE.md) for detailed manual setup instructions.

## Prerequisites

Before running the setup:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```
3. **Terraform** infrastructure deployed
   ```bash
   cd infra/terraform
   terraform apply
   ```
4. **Node.js** >= 18.0.0 installed

## Testing Your Setup

After running the setup script, test all connections:

```bash
# Install dependencies
npm install

# Run connection tests
npm run test:aws
```

This will verify:
- ✅ AWS credentials
- ✅ S3 bucket access
- ✅ SQS queue access
- ✅ Secrets Manager access
- ✅ Database connectivity
- ✅ Environment variables

## Configuration Files

The setup creates three .env files:

### 1. Backend Configuration
**Location:** `backend/api-gateway/.env`

Contains:
- Database connection details
- AWS service endpoints
- Application secrets
- API configuration

### 2. ML Training Configuration
**Location:** `ml/sagemaker-training/.env`

Contains:
- SageMaker configuration
- S3 bucket names
- Training job settings

### 3. Root Configuration
**Location:** `.env`

Contains:
- Infrastructure details
- Quick reference values
- Deployment information

## AWS Services Configuration

### RDS PostgreSQL

**Purpose:** Primary application database

**Configuration:**
```env
DB_HOST=<rds-endpoint>
DB_PORT=5432
DB_NAME=neurocode
DB_USER=neurocode_admin
DB_PASSWORD=<from-secrets-manager>
```

**Test Connection:**
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

### S3 Buckets

**Purpose:** Store datasets and ML models

**Buckets:**
- `neurocode-ai-datasets-xxxxx` - Training datasets
- `neurocode-ai-models-xxxxx` - Trained models

**Configuration:**
```env
S3_DATASETS_BUCKET=neurocode-ai-datasets-xxxxx
S3_MODELS_BUCKET=neurocode-ai-models-xxxxx
```

**Test Access:**
```bash
aws s3 ls s3://$S3_DATASETS_BUCKET/
aws s3 ls s3://$S3_MODELS_BUCKET/
```

### SQS Queues

**Purpose:** Async message processing

**Queues:**
- Analysis Queue - Code analysis requests
- Training Queue - ML training jobs

**Configuration:**
```env
SQS_ANALYSIS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
SQS_TRAINING_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
```

**Test Access:**
```bash
aws sqs get-queue-attributes --queue-url $SQS_ANALYSIS_QUEUE_URL --attribute-names All
```

### Secrets Manager

**Purpose:** Secure credential storage

**Secrets:**
- Database password
- API keys
- JWT secrets

**Configuration:**
```env
DB_SECRET_ARN=arn:aws:secretsmanager:us-east-1:...
```

**Test Access:**
```bash
aws secretsmanager get-secret-value --secret-id $DB_SECRET_ARN
```

### SageMaker

**Purpose:** ML model training

**Configuration:**
```env
SAGEMAKER_ROLE_ARN=arn:aws:iam::account:role/neurocode-ai-sagemaker-role
```

**Launch Training:**
```bash
cd ml/sagemaker-training
python launch_training.py train s3://bucket/dataset.json
```

## Usage Examples

### Upload Dataset to S3

```javascript
const { S3Service } = require('./backend/aws-integration/s3-client');

await S3Service.uploadDataset('dataset-001', {
  code_samples: [...],
  labels: [...]
});
```

### Send Analysis Request to SQS

```javascript
const { SQSService } = require('./backend/aws-integration/sqs-client');

await SQSService.sendMessage(
  process.env.SQS_ANALYSIS_QUEUE_URL,
  {
    type: 'code_analysis',
    code: 'function example() { ... }',
    userId: 'user-123'
  }
);
```

### Query Database

```javascript
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

await client.connect();
const result = await client.query('SELECT * FROM analyses');
await client.end();
```

### Train ML Model

```bash
cd ml/sagemaker-training

# Upload dataset
aws s3 cp dataset.json s3://$S3_DATASETS_BUCKET/datasets/

# Launch training
python launch_training.py train s3://$S3_DATASETS_BUCKET/datasets/dataset.json

# Monitor progress
python launch_training.py status <job-name>

# Download trained model
python launch_training.py download <job-name>
```

## Security Best Practices

### 1. Credential Management

- ✅ Never commit .env files to git (already in .gitignore)
- ✅ Use Secrets Manager for sensitive data
- ✅ Rotate credentials every 90 days
- ✅ Use IAM roles on EC2 instead of access keys

### 2. Network Security

- ✅ RDS in private subnet (no public access)
- ✅ Security groups restrict access
- ✅ VPC isolation for resources
- ✅ Encryption in transit (TLS/SSL)

### 3. Data Security

- ✅ Encryption at rest (S3, RDS, EBS)
- ✅ Versioning enabled on S3 buckets
- ✅ Automated backups for RDS
- ✅ Access logging enabled

### 4. Access Control

- ✅ Least privilege IAM policies
- ✅ MFA for console access
- ✅ CloudTrail for audit logging
- ✅ Regular permission reviews

## Cost Optimization

### Monthly Cost Breakdown

| Service | Cost |
|---------|------|
| EC2 (t3.small) | $15.18 |
| RDS (db.t3.micro) | $12.41 |
| S3 Storage (10GB) | $0.23 |
| SQS (1M requests) | $0.40 |
| Secrets Manager | $0.40 |
| Data Transfer | $0.45 |
| **Total Base** | **~$38/month** |
| SageMaker Training | $30-50/month |
| **Grand Total** | **$68-88/month** |

### Cost Saving Tips

1. **Stop EC2 when not in use**
   ```bash
   aws ec2 stop-instances --instance-ids <instance-id>
   ```
   Saves: ~$0.50/day

2. **Use SageMaker Spot Instances**
   - Already configured in training scripts
   - Saves: ~70% on training costs

3. **Enable S3 Lifecycle Policies**
   - Already configured in Terraform
   - Moves old data to Glacier after 30 days

4. **Monitor with CloudWatch Alarms**
   - Billing alerts at $100, $150, $180
   - Idle resource detection

## Monitoring & Logging

### CloudWatch Dashboard

Access at: https://console.aws.amazon.com/cloudwatch

Metrics tracked:
- EC2 CPU utilization
- RDS connections
- SQS queue depth
- S3 request count
- Estimated charges

### Application Logs

**View logs:**
```bash
# On EC2
ssh ec2-user@<ec2-ip>
cd neurocode-ai
./view-logs.sh

# In CloudWatch
aws logs tail /aws/ec2/neurocode-ai --follow
```

### Cost Monitoring

```bash
# Current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost"
```

## Troubleshooting

### Common Issues

#### 1. "Access Denied" Errors

**Cause:** Insufficient IAM permissions

**Solution:**
```bash
# Check current permissions
aws iam get-user
aws iam list-attached-user-policies --user-name <username>

# Attach required policy
aws iam attach-user-policy \
  --user-name <username> \
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
```

#### 2. "Cannot Connect to RDS"

**Cause:** Security group or network issue

**Solution:**
```bash
# Check security group
aws ec2 describe-security-groups --group-ids <sg-id>

# Test from EC2
ssh ec2-user@<ec2-ip>
telnet <rds-endpoint> 5432
```

#### 3. "Secret Not Found"

**Cause:** Wrong region or secret ARN

**Solution:**
```bash
# List all secrets
aws secretsmanager list-secrets --region us-east-1

# Get secret details
aws secretsmanager describe-secret --secret-id <secret-arn>
```

#### 4. "S3 Bucket Does Not Exist"

**Cause:** Terraform not deployed or wrong bucket name

**Solution:**
```bash
# List all buckets
aws s3 ls

# Check Terraform outputs
cd infra/terraform
terraform output s3_datasets_bucket
```

### Getting Help

1. **Check logs:** `npm run test:aws` for detailed diagnostics
2. **Review documentation:** See AWS_SETUP_GUIDE.md
3. **AWS Support:** Basic support included with account
4. **CloudWatch Logs:** Check for detailed error messages

## Deployment Workflow

### Local Development

1. Run setup script
2. Test connections
3. Start local services
4. Develop and test

```bash
./setup-aws-credentials.sh
npm run test:aws
./start-local.bat
```

### Deploy to EC2

1. SSH to EC2 instance
2. Clone repository
3. Run setup script
4. Start application

```bash
ssh ec2-user@<ec2-ip>
git clone <repo-url>
cd neurocode-ai
./setup-aws-credentials.sh
./start-app.sh
```

### CI/CD Integration

Environment variables can be set in CI/CD:

```yaml
# GitHub Actions example
env:
  AWS_REGION: ${{ secrets.AWS_REGION }}
  DB_HOST: ${{ secrets.DB_HOST }}
  S3_DATASETS_BUCKET: ${{ secrets.S3_DATASETS_BUCKET }}
  # ... other variables
```

## Additional Resources

### Documentation
- [AWS Setup Guide](AWS_SETUP_GUIDE.md) - Detailed setup instructions
- [AWS Quick Reference](AWS_QUICK_REFERENCE.md) - Command cheat sheet
- [Infrastructure README](infra/README.md) - Terraform deployment guide
- [Cost Estimation](infra/COST_ESTIMATION.md) - Detailed cost breakdown

### AWS Documentation
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)
- [SQS Developer Guide](https://docs.aws.amazon.com/sqs/)
- [SageMaker Developer Guide](https://docs.aws.amazon.com/sagemaker/)

### Tools
- [AWS Console](https://console.aws.amazon.com/)
- [AWS Cost Explorer](https://console.aws.amazon.com/cost-management/)
- [CloudWatch Dashboard](https://console.aws.amazon.com/cloudwatch/)

## Support

For issues or questions:
- **GitHub Issues**: Create an issue in the repository
- **Email**: support@neurocode.ai
- **Documentation**: Check the docs listed above

---

**Status:** ✅ Ready for AWS Integration
**Last Updated:** 2026-03-07
**Version:** 1.0.0
