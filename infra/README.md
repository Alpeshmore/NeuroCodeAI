# NeuroCode AI - AWS Infrastructure

## 🎯 Cost-Optimized Deployment ($200 Budget for 2-3 Months)

This infrastructure is designed to run NeuroCode AI on AWS with maximum cost efficiency while maintaining production-ready capabilities.

## 📊 Cost Breakdown

### Monthly Costs (Estimated)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| EC2 (t3.small) | 2 vCPU, 2GB RAM | $15.18 |
| RDS (db.t3.micro) | PostgreSQL, Single AZ | $12.41 |
| EBS Storage | 30GB (EC2) + 20GB (RDS) | $5.30 |
| Elastic IP | 1 IP | $3.60 |
| S3 Storage | ~10GB | $0.23 |
| Data Transfer | ~5GB/month | $0.45 |
| SQS | ~1M requests | $0.40 |
| Secrets Manager | 1 secret | $0.40 |
| CloudWatch | Basic monitoring | $0.00 |
| **Base Total** | | **~$38/month** |
| **SageMaker Training** | Spot instances, ~5 hours/month | **$30-50/month** |
| **Grand Total** | | **$68-88/month** |

### Budget Timeline
- **$200 budget** = 2.3 - 2.9 months of operation
- With careful usage: Can extend to 3+ months

## 🚀 Quick Start

### Prerequisites

1. **AWS Account** with $200 credits
2. **AWS CLI** configured
3. **Terraform** >= 1.5.0
4. **SSH Key Pair** for EC2 access

### Step 1: Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### Step 2: Generate SSH Key (if needed)

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
```

### Step 3: Deploy Infrastructure

```bash
cd infra/terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Deploy (takes ~10 minutes)
terraform apply

# Save outputs
terraform output > ../outputs.txt
```

### Step 4: Access Your Instance

```bash
# Get SSH command from outputs
terraform output ssh_command

# SSH into EC2
ssh -i ~/.ssh/id_rsa ec2-user@<PUBLIC_IP>
```

### Step 5: Verify Deployment

```bash
# On EC2 instance
cd neurocode-ai

# Check Docker
docker ps

# Check environment
cat .env

# Start application
./start-app.sh

# View logs
./view-logs.sh
```

## 📁 Infrastructure Components

### 1. VPC & Networking
- **VPC**: 10.0.0.0/16
- **Public Subnet**: 10.0.1.0/24 (EC2)
- **Private Subnet**: 10.0.2.0/24 (RDS)
- **No NAT Gateway**: Cost savings (~$32/month saved)

### 2. EC2 Instance
- **Type**: t3.small (2 vCPU, 2GB RAM)
- **OS**: Amazon Linux 2023
- **Storage**: 30GB GP3 EBS
- **Software**: Docker, Docker Compose, AWS CLI, CloudWatch Agent

### 3. RDS PostgreSQL
- **Type**: db.t3.micro (2 vCPU, 1GB RAM)
- **Storage**: 20GB GP3 (auto-scaling to 50GB)
- **Configuration**: Single AZ, encrypted
- **Backups**: 7 days retention

### 4. S3 Buckets
- **Datasets Bucket**: Versioned, encrypted, lifecycle to Glacier after 30 days
- **Models Bucket**: Versioned, encrypted, old versions deleted after 90 days

### 5. SQS Queues
- **Analysis Queue**: For code analysis events
- **Training Queue**: For ML training triggers
- **Dead Letter Queues**: For failed messages

### 6. IAM Roles
- **EC2 Role**: Access to S3, SQS, Secrets Manager, CloudWatch, SageMaker
- **SageMaker Role**: Access to S3, CloudWatch, ECR

### 7. CloudWatch
- **Log Groups**: Application logs, SageMaker logs
- **Alarms**: Billing alerts ($100, $150, $180), CPU idle, SQS depth
- **Dashboard**: System metrics overview

## 🔧 Configuration

### Environment Variables

All configuration is in `/home/ec2-user/neurocode-ai/.env`:

```env
# Database
POSTGRES_URL=postgresql://...
DB_HOST=...
DB_PORT=5432
DB_NAME=neurocode
DB_USER=...
DB_PASSWORD=... (from Secrets Manager)

# AWS Services
S3_DATASETS_BUCKET=neurocode-ai-datasets-xxxxx
S3_MODELS_BUCKET=neurocode-ai-models-xxxxx
SQS_ANALYSIS_QUEUE_URL=https://sqs...
SQS_TRAINING_QUEUE_URL=https://sqs...

# Application
PORT=4000
JWT_SECRET=...
```

### Secrets Management

Database credentials are stored in AWS Secrets Manager:

```bash
# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id neurocode-ai-db-password-xxxxx \
  --query SecretString \
  --output text | jq .
```

## 🤖 ML Training with SageMaker

### Prepare Dataset

```bash
# On EC2 or locally
cd ml/sagemaker-training

# Upload dataset to S3
aws s3 cp dataset.json s3://neurocode-ai-datasets-xxxxx/datasets/
```

### Launch Training Job

```bash
# Set environment variables
export PROJECT_NAME=neurocode-ai
export AWS_REGION=us-east-1
export S3_DATASETS_BUCKET=neurocode-ai-datasets-xxxxx
export S3_MODELS_BUCKET=neurocode-ai-models-xxxxx
export SAGEMAKER_ROLE_ARN=arn:aws:iam::...

# Launch training
python launch_training.py train s3://neurocode-ai-datasets-xxxxx/datasets/dataset.json
```

### Monitor Training

```bash
# Check status
python launch_training.py status neurocode-ai-confusion-20260124-120000

# View logs in CloudWatch
aws logs tail /aws/sagemaker/TrainingJobs --follow
```

### Download Trained Model

```bash
# Download model artifact
python launch_training.py download neurocode-ai-confusion-20260124-120000

# Extract model
tar -xzf models/neurocode-ai-confusion-20260124-120000.tar.gz -C models/

# Deploy to EC2
scp -i ~/.ssh/id_rsa models/confusion_detector.pth ec2-user@<PUBLIC_IP>:~/neurocode-ai/models/
```

### Training Cost Optimization

- **Spot Instances**: ~70% cost savings
- **ml.g4dn.xlarge**: $0.526/hour (spot) vs $1.505/hour (on-demand)
- **30-minute training**: ~$0.26 (spot) vs $0.75 (on-demand)
- **Monthly budget**: 5 hours = ~$2.63 (spot) vs $7.53 (on-demand)

## 💰 Cost Optimization

### Daily Operations

```bash
cd infra/scripts

# Check current costs
./cost-optimization.sh costs

# Stop EC2 when not in use (saves ~$0.50/day)
./cost-optimization.sh stop

# Start EC2 when needed
./cost-optimization.sh start

# Check for idle resources
./cost-optimization.sh check

# View all resources
./cost-optimization.sh inventory
```

### Automatic Cost Controls

1. **Billing Alerts**: Email notifications at $100, $150, $180
2. **Idle Detection**: CloudWatch alarm if CPU < 5% for 30 minutes
3. **S3 Lifecycle**: Auto-move to Glacier after 30 days
4. **Spot Instances**: SageMaker training uses spot for 70% savings

### Manual Cost Savings

```bash
# Stop EC2 overnight (8 hours = $0.40 saved)
./cost-optimization.sh stop

# Stop RDS when not needed (saves $0.41/day)
aws rds stop-db-instance --db-instance-identifier neurocode-ai-db

# Delete old datasets
aws s3 rm s3://neurocode-ai-datasets-xxxxx/old-data/ --recursive
```

### Emergency Shutdown

If approaching budget limit:

```bash
# Stop all billable resources
./cost-optimization.sh emergency

# Or manually:
terraform destroy
```

## 📊 Monitoring

### CloudWatch Dashboard

Access at: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards

Metrics:
- EC2 CPU utilization
- RDS CPU utilization
- SQS queue depth
- Estimated charges

### Application Logs

```bash
# View logs on EC2
ssh ec2-user@<PUBLIC_IP>
cd neurocode-ai
./view-logs.sh

# View logs in CloudWatch
aws logs tail /aws/ec2/neurocode-ai --follow
```

### Cost Monitoring

```bash
# Current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost"

# Daily costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '7 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics "UnblendedCost"
```

## 🔒 Security

### Best Practices Implemented

1. **Encryption**: All data encrypted at rest (RDS, S3, EBS)
2. **Secrets Management**: Credentials in Secrets Manager
3. **IAM Least Privilege**: Minimal permissions for each role
4. **Security Groups**: Restricted access (RDS only from EC2)
5. **IMDSv2**: Required for EC2 metadata
6. **VPC Isolation**: Private subnet for RDS

### Hardening Checklist

```bash
# Restrict SSH to your IP
terraform apply -var 'allowed_ssh_cidr=["YOUR_IP/32"]'

# Enable MFA for AWS account
# Enable CloudTrail for audit logging
# Rotate secrets regularly
# Review IAM policies quarterly
```

## 🔄 Backup & Recovery

### Automated Backups

- **RDS**: 7-day automated backups
- **S3**: Versioning enabled
- **SageMaker**: Checkpoints for spot instance recovery

### Manual Backup

```bash
# Backup database
aws rds create-db-snapshot \
  --db-instance-identifier neurocode-ai-db \
  --db-snapshot-identifier neurocode-backup-$(date +%Y%m%d)

# Backup S3 to another region
aws s3 sync s3://neurocode-ai-datasets-xxxxx s3://neurocode-backup-bucket --region us-west-2
```

### Disaster Recovery

```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier neurocode-ai-db-restored \
  --db-snapshot-identifier neurocode-backup-20260124

# Restore S3 version
aws s3api get-object \
  --bucket neurocode-ai-datasets-xxxxx \
  --key datasets/important.json \
  --version-id VERSION_ID \
  restored-file.json
```

## 🚀 Scaling Up (When Funding Increases)

### Phase 1: Vertical Scaling ($200-500/month)

```bash
# Upgrade EC2
terraform apply -var 'ec2_instance_type=t3.medium'

# Upgrade RDS
terraform apply -var 'rds_instance_class=db.t3.small'
```

### Phase 2: High Availability ($500-1000/month)

- Enable Multi-AZ RDS
- Add Application Load Balancer
- Add Auto Scaling Group
- Enable RDS Read Replicas

### Phase 3: Production Scale ($1000+/month)

- Migrate to EKS
- Add ElastiCache Redis cluster
- Enable CloudFront CDN
- Add NAT Gateway for private subnets
- Deploy SageMaker endpoints

## 🛠 Troubleshooting

### EC2 Won't Start

```bash
# Check instance status
aws ec2 describe-instance-status --instance-ids i-xxxxx

# View system log
aws ec2 get-console-output --instance-id i-xxxxx
```

### Can't Connect to RDS

```bash
# Check security group
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Test from EC2
psql -h <RDS_ENDPOINT> -U neurocode_admin -d neurocode
```

### SageMaker Training Failed

```bash
# Check training job
aws sagemaker describe-training-job --training-job-name job-name

# View logs
aws logs tail /aws/sagemaker/TrainingJobs --follow
```

### High Costs

```bash
# Identify cost drivers
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=SERVICE

# Stop unused resources
./cost-optimization.sh emergency
```

## 📚 Additional Resources

- [AWS Cost Optimization](https://aws.amazon.com/pricing/cost-optimization/)
- [SageMaker Spot Instances](https://docs.aws.amazon.com/sagemaker/latest/dg/model-managed-spot-training.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Free Tier](https://aws.amazon.com/free/)

## 🆘 Support

- **Issues**: Create GitHub issue
- **Email**: support@neurocode.ai
- **AWS Support**: Basic support included

## 📝 License

MIT License - See LICENSE file for details

---

**Built for startups, optimized for learning, designed for scale.**
