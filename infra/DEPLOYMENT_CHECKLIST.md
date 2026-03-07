# NeuroCode AI - AWS Deployment Checklist

## ✅ Pre-Deployment

### AWS Account Setup
- [ ] AWS account created
- [ ] $200 credits applied
- [ ] Billing alerts configured
- [ ] MFA enabled on root account
- [ ] IAM user created with admin access
- [ ] AWS CLI installed and configured
- [ ] Default region set to `us-east-1`

### Local Environment
- [ ] Terraform >= 1.5.0 installed
- [ ] AWS CLI >= 2.0 installed
- [ ] SSH key pair generated (`~/.ssh/id_rsa`)
- [ ] Git repository cloned
- [ ] Python 3.10+ installed (for SageMaker)
- [ ] Node.js 18+ installed (for backend)

### Cost Safety
- [ ] Budget alert email configured
- [ ] CloudWatch billing alarms enabled
- [ ] Cost Explorer enabled
- [ ] Understand shutdown procedures

## ✅ Infrastructure Deployment

### Step 1: Configure Variables
- [ ] Review `infra/terraform/variables.tf`
- [ ] Update `allowed_ssh_cidr` to your IP
- [ ] Update `billing_alert_email`
- [ ] Verify `aws_region` (default: us-east-1)

### Step 2: Deploy with Terraform
```bash
cd infra/terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

- [ ] Terraform init successful
- [ ] Terraform plan reviewed
- [ ] Terraform apply completed
- [ ] No errors in output
- [ ] Outputs saved to file

### Step 3: Verify Resources
- [ ] EC2 instance running
- [ ] RDS instance available
- [ ] S3 buckets created
- [ ] SQS queues created
- [ ] IAM roles created
- [ ] Security groups configured
- [ ] CloudWatch alarms active

### Step 4: Access EC2
```bash
# Get SSH command from outputs
terraform output ssh_command

# SSH into instance
ssh -i ~/.ssh/id_rsa ec2-user@<PUBLIC_IP>
```

- [ ] SSH connection successful
- [ ] User data script completed
- [ ] Docker installed and running
- [ ] Application directory created
- [ ] Environment variables configured

## ✅ Application Setup

### On EC2 Instance

#### Verify Installation
```bash
# Check Docker
docker --version
docker-compose --version

# Check AWS CLI
aws --version

# Check CloudWatch Agent
sudo systemctl status amazon-cloudwatch-agent
```

- [ ] Docker running
- [ ] Docker Compose installed
- [ ] AWS CLI configured
- [ ] CloudWatch Agent running

#### Configure Application
```bash
cd /home/ec2-user/neurocode-ai

# Review environment
cat .env

# Check database connection
psql $POSTGRES_URL -c "SELECT version();"
```

- [ ] Environment file exists
- [ ] Database credentials correct
- [ ] Database connection successful
- [ ] S3 buckets accessible
- [ ] SQS queues accessible

#### Deploy Application
```bash
# Clone/copy application code
# (Replace with your actual deployment method)

# Start services
./start-app.sh

# Check status
docker-compose ps

# View logs
./view-logs.sh
```

- [ ] Application code deployed
- [ ] Docker containers running
- [ ] API responding on port 4000
- [ ] Logs showing no errors

## ✅ Frontend Deployment

### Vercel Deployment (Free Tier)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

- [ ] Vercel account created
- [ ] Frontend deployed
- [ ] Environment variables configured
- [ ] API endpoint connected
- [ ] Application accessible

### Environment Variables on Vercel
- [ ] `NEXT_PUBLIC_API_URL` = `http://<EC2_PUBLIC_IP>:4000`
- [ ] `NEXT_PUBLIC_WS_URL` = `ws://<EC2_PUBLIC_IP>:4000`

## ✅ ML Training Setup

### Prepare Training Environment

```bash
cd ml/sagemaker-training

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export PROJECT_NAME=neurocode-ai
export AWS_REGION=us-east-1
export S3_DATASETS_BUCKET=<from terraform output>
export S3_MODELS_BUCKET=<from terraform output>
export SAGEMAKER_ROLE_ARN=<from terraform output>
```

- [ ] Python dependencies installed
- [ ] Environment variables set
- [ ] SageMaker role ARN obtained
- [ ] S3 buckets accessible

### Test Training Job

```bash
# Create sample dataset
python create_sample_dataset.py

# Upload to S3
aws s3 cp sample_dataset.json s3://$S3_DATASETS_BUCKET/datasets/

# Launch training
python launch_training.py train s3://$S3_DATASETS_BUCKET/datasets/sample_dataset.json
```

- [ ] Sample dataset created
- [ ] Dataset uploaded to S3
- [ ] Training job launched
- [ ] Training job completed successfully
- [ ] Model artifact saved to S3

## ✅ Monitoring Setup

### CloudWatch

- [ ] Log groups created
- [ ] Metrics flowing
- [ ] Dashboard accessible
- [ ] Alarms configured
- [ ] SNS topic subscribed

### Cost Monitoring

```bash
# Check current costs
cd infra/scripts
./cost-optimization.sh costs
```

- [ ] Cost Explorer enabled
- [ ] Current costs < $5
- [ ] Billing alerts working
- [ ] Cost optimization script tested

## ✅ Security Hardening

### Network Security
- [ ] SSH restricted to your IP
- [ ] RDS not publicly accessible
- [ ] Security groups minimal
- [ ] IMDSv2 enabled on EC2

### Access Control
- [ ] IAM roles follow least privilege
- [ ] No hardcoded credentials
- [ ] Secrets in Secrets Manager
- [ ] MFA enabled on AWS account

### Data Protection
- [ ] RDS encrypted
- [ ] S3 buckets encrypted
- [ ] EBS volumes encrypted
- [ ] Backups enabled

## ✅ Testing

### API Testing
```bash
# Health check
curl http://<EC2_PUBLIC_IP>:4000/health

# Test code analysis
curl -X POST http://<EC2_PUBLIC_IP>:4000/api/v1/code/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "def hello(): print(\"Hello\")", "language": "python"}'
```

- [ ] Health endpoint responding
- [ ] API endpoints working
- [ ] Database queries successful
- [ ] S3 uploads working
- [ ] SQS messages processing

### Frontend Testing
- [ ] Application loads
- [ ] Code editor works
- [ ] Analysis triggers
- [ ] Results display
- [ ] No console errors

### ML Pipeline Testing
- [ ] Dataset upload works
- [ ] Training job launches
- [ ] Model downloads
- [ ] Inference works

## ✅ Documentation

- [ ] README.md reviewed
- [ ] API documentation accessible
- [ ] Deployment guide followed
- [ ] Troubleshooting guide available
- [ ] Cost optimization guide reviewed

## ✅ Backup & Recovery

### Initial Backups
```bash
# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier neurocode-ai-db \
  --db-snapshot-identifier initial-backup

# Backup S3 configuration
aws s3 sync s3://$S3_DATASETS_BUCKET ./backups/datasets
```

- [ ] RDS snapshot created
- [ ] S3 data backed up
- [ ] Terraform state backed up
- [ ] Recovery procedure tested

## ✅ Cost Optimization

### Immediate Actions
- [ ] Stop EC2 when not in use
- [ ] Use spot instances for training
- [ ] Enable S3 lifecycle policies
- [ ] Monitor daily costs

### Weekly Tasks
- [ ] Review cost reports
- [ ] Check for idle resources
- [ ] Optimize instance sizes
- [ ] Clean up old data

## ✅ Post-Deployment

### Day 1
- [ ] Monitor for 24 hours
- [ ] Check all alarms
- [ ] Verify backups
- [ ] Test recovery

### Week 1
- [ ] Review costs daily
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Optimize as needed

### Month 1
- [ ] Review monthly costs
- [ ] Analyze usage patterns
- [ ] Plan scaling strategy
- [ ] Update documentation

## 🚨 Emergency Procedures

### If Costs Spike
```bash
# Immediate shutdown
cd infra/scripts
./cost-optimization.sh emergency

# Or destroy everything
cd infra/terraform
terraform destroy
```

### If System Down
```bash
# Check EC2
aws ec2 describe-instance-status --instance-ids <INSTANCE_ID>

# Restart EC2
aws ec2 reboot-instances --instance-ids <INSTANCE_ID>

# Check RDS
aws rds describe-db-instances --db-instance-identifier neurocode-ai-db
```

### If Data Loss
```bash
# Restore RDS from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier neurocode-ai-db-restored \
  --db-snapshot-identifier <SNAPSHOT_ID>

# Restore S3 from version
aws s3api get-object \
  --bucket <BUCKET> \
  --key <KEY> \
  --version-id <VERSION_ID> \
  restored-file
```

## 📊 Success Criteria

- [ ] Total monthly cost < $90
- [ ] Application uptime > 95%
- [ ] API response time < 3s
- [ ] No security vulnerabilities
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Team trained on operations

## 📝 Notes

**Deployment Date:** _______________

**Deployed By:** _______________

**EC2 Public IP:** _______________

**RDS Endpoint:** _______________

**S3 Buckets:** 
- Datasets: _______________
- Models: _______________

**Issues Encountered:**
- 
- 
- 

**Resolutions:**
- 
- 
- 

---

**Status:** [ ] Not Started [ ] In Progress [ ] Completed [ ] Failed

**Next Review Date:** _______________
