#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=== NeuroCode AI EC2 Setup Started ==="
echo "Timestamp: $(date)"

# Update system
echo "Updating system packages..."
yum update -y

# Install Docker
echo "Installing Docker..."
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install AWS CLI v2
echo "Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Install Git
echo "Installing Git..."
yum install -y git

# Install Node.js 18
echo "Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Python 3.11
echo "Installing Python..."
yum install -y python3.11 python3.11-pip

# Install CloudWatch Agent
echo "Installing CloudWatch Agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm
rm amazon-cloudwatch-agent.rpm

# Configure CloudWatch Agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json <<'EOF'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/user-data.log",
            "log_group_name": "/aws/ec2/${project_name}",
            "log_stream_name": "{instance_id}/user-data"
          },
          {
            "file_path": "/home/ec2-user/neurocode-ai/logs/*.log",
            "log_group_name": "/aws/ec2/${project_name}",
            "log_stream_name": "{instance_id}/application"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "NeuroCodeAI",
    "metrics_collected": {
      "mem": {
        "measurement": [
          {
            "name": "mem_used_percent",
            "rename": "MemoryUtilization",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          {
            "name": "used_percent",
            "rename": "DiskUtilization",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "/"
        ]
      }
    }
  }
}
EOF

# Start CloudWatch Agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

# Get database credentials from Secrets Manager
echo "Retrieving database credentials..."
DB_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id ${db_secret_arn} \
  --region ${aws_region} \
  --query SecretString \
  --output text)

DB_HOST=$(echo $DB_SECRET | jq -r '.host')
DB_PORT=$(echo $DB_SECRET | jq -r '.port')
DB_NAME=$(echo $DB_SECRET | jq -r '.dbname')
DB_USER=$(echo $DB_SECRET | jq -r '.username')
DB_PASSWORD=$(echo $DB_SECRET | jq -r '.password')

# Create application directory
echo "Setting up application directory..."
mkdir -p /home/ec2-user/neurocode-ai
cd /home/ec2-user/neurocode-ai

# Clone repository (replace with your actual repo)
echo "Cloning repository..."
# git clone https://github.com/your-org/neurocode-ai.git .
# For now, we'll create the structure

# Create environment file
echo "Creating environment configuration..."
cat > .env <<EOF
# Environment
NODE_ENV=production
AWS_REGION=${aws_region}

# Database
POSTGRES_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# AWS Services
S3_DATASETS_BUCKET=${s3_datasets_bucket}
S3_MODELS_BUCKET=${s3_models_bucket}
SQS_ANALYSIS_QUEUE_URL=${sqs_analysis_queue}
SQS_TRAINING_QUEUE_URL=${sqs_training_queue}

# Redis (using local container)
REDIS_URL=redis://redis:6379

# API Configuration
PORT=4000
JWT_SECRET=$(openssl rand -base64 32)

# SageMaker
SAGEMAKER_ROLE_ARN=$(aws iam get-role --role-name ${project_name}-sagemaker-role --query 'Role.Arn' --output text)

# Application
PROJECT_NAME=${project_name}
EOF

# Create docker-compose.yml for lean setup
cat > docker-compose.yml <<'COMPOSE_EOF'
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: neurocode-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  api-gateway:
    build:
      context: ./backend/api-gateway
    container_name: neurocode-api
    restart: unless-stopped
    ports:
      - "4000:4000"
    env_file:
      - .env
    depends_on:
      - redis
    volumes:
      - ./logs:/app/logs
      - ./models:/app/models

volumes:
  redis-data:
COMPOSE_EOF

# Create logs directory
mkdir -p logs models

# Set permissions
chown -R ec2-user:ec2-user /home/ec2-user/neurocode-ai

# Create systemd service for auto-start
cat > /etc/systemd/system/neurocode.service <<'SERVICE_EOF'
[Unit]
Description=NeuroCode AI Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/neurocode-ai
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=ec2-user

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Enable service
systemctl daemon-reload
systemctl enable neurocode.service

# Create cost optimization cron jobs
echo "Setting up cost optimization..."

# Auto-stop if idle (runs every hour)
cat > /usr/local/bin/check-idle.sh <<'IDLE_EOF'
#!/bin/bash
CPU_THRESHOLD=5
IDLE_TIME=2 # hours

# Get average CPU over last 2 hours
CPU_AVG=$(aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=$(ec2-metadata --instance-id | cut -d " " -f 2) \
  --start-time $(date -u -d '2 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average \
  --query 'Datapoints[0].Average' \
  --output text)

if (( $(echo "$CPU_AVG < $CPU_THRESHOLD" | bc -l) )); then
  echo "CPU idle ($CPU_AVG%), considering shutdown..."
  # Uncomment to enable auto-shutdown
  # aws ec2 stop-instances --instance-ids $(ec2-metadata --instance-id | cut -d " " -f 2)
fi
IDLE_EOF

chmod +x /usr/local/bin/check-idle.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 * * * * /usr/local/bin/check-idle.sh >> /var/log/idle-check.log 2>&1") | crontab -

# Create helper scripts
cat > /home/ec2-user/start-app.sh <<'START_EOF'
#!/bin/bash
cd /home/ec2-user/neurocode-ai
docker-compose up -d
echo "Application started. Check status with: docker-compose ps"
START_EOF

cat > /home/ec2-user/stop-app.sh <<'STOP_EOF'
#!/bin/bash
cd /home/ec2-user/neurocode-ai
docker-compose down
echo "Application stopped."
STOP_EOF

cat > /home/ec2-user/view-logs.sh <<'LOGS_EOF'
#!/bin/bash
cd /home/ec2-user/neurocode-ai
docker-compose logs -f
LOGS_EOF

chmod +x /home/ec2-user/*.sh
chown ec2-user:ec2-user /home/ec2-user/*.sh

echo "=== NeuroCode AI EC2 Setup Completed ==="
echo "Timestamp: $(date)"
echo ""
echo "Next steps:"
echo "1. SSH into instance: ssh ec2-user@<public-ip>"
echo "2. Navigate to: cd neurocode-ai"
echo "3. Start application: ./start-app.sh"
echo "4. View logs: ./view-logs.sh"
echo ""
echo "Environment variables are in: /home/ec2-user/neurocode-ai/.env"
