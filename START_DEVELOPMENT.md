# 🚀 Start Development - Quick Guide

## ✅ AWS Setup Complete!

All AWS resources are created and working:
- ✅ S3 buckets (datasets & models)
- ✅ SQS queues (analysis & training)
- ✅ IAM role (SageMaker)
- ✅ Configuration files updated
- ✅ Dependencies installed

**Monthly Cost:** $0.63

---

## 🎯 Start Developing Now

### Option 1: Local Development (Recommended)

Use local services for development, AWS for storage/ML:

#### Step 1: Start Local Services

```bash
# Open Terminal 1
cd "NeuroCode AI"
start-local.bat
```

This starts:
- PostgreSQL (database)
- Redis (caching)
- RabbitMQ (messaging)

**Wait for:** "All services started successfully"

#### Step 2: Start Backend

```bash
# Open Terminal 2
cd "NeuroCode AI"
start-backend.bat
```

This starts:
- API Gateway on port 4000
- WebSocket server
- AWS integrations

**Wait for:** "Server running on http://localhost:4000"

#### Step 3: Start Frontend

```bash
# Open Terminal 3
cd "NeuroCode AI"
start-frontend.bat
```

This starts:
- Next.js frontend on port 3000
- Hot reload enabled

**Wait for:** "Ready on http://localhost:3000"

#### Step 4: Access Application

Open browser: **http://localhost:3000**

---

## 🧪 Test AWS Integration

### Upload Test File to S3

```bash
# Create test file
echo '{"test": "data"}' > test.json

# Upload to datasets bucket
aws s3 cp test.json s3://neurocode-ai-datasets-509913599/test/

# Verify upload
aws s3 ls s3://neurocode-ai-datasets-509913599/test/
```

### Send Test Message to SQS

```bash
# Send analysis request
aws sqs send-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/455162985715/neurocode-ai-analysis-queue \
  --message-body '{"type":"test","timestamp":"2026-03-07"}'

# Check queue
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/455162985715/neurocode-ai-analysis-queue \
  --attribute-names ApproximateNumberOfMessages
```

### Test from Code

Create `test-aws.js`:

```javascript
const { S3Service } = require('./backend/aws-integration/s3-client');
const { SQSService } = require('./backend/aws-integration/sqs-client');

async function test() {
  // Test S3
  console.log('Testing S3...');
  await S3Service.uploadDataset('test-dataset', {
    samples: [1, 2, 3],
    labels: ['a', 'b', 'c']
  });
  console.log('✓ S3 upload successful');

  // Test SQS
  console.log('Testing SQS...');
  await SQSService.sendMessage(
    process.env.SQS_ANALYSIS_QUEUE_URL,
    { type: 'test', data: 'hello' }
  );
  console.log('✓ SQS message sent');

  // List files
  const files = await S3Service.listFiles(
    process.env.S3_DATASETS_BUCKET,
    'datasets/'
  );
  console.log('✓ Files in S3:', files);
}

test().catch(console.error);
```

Run:
```bash
node test-aws.js
```

---

## 📊 Development Workflow

### 1. Code Analysis Feature

```javascript
// In your backend code
const { SQSService } = require('./backend/aws-integration/sqs-client');

// Queue analysis request
await SQSService.sendMessage(
  process.env.SQS_ANALYSIS_QUEUE_URL,
  {
    type: 'code_analysis',
    code: userCode,
    userId: userId,
    timestamp: new Date().toISOString()
  }
);
```

### 2. Store Results in S3

```javascript
const { S3Service } = require('./backend/aws-integration/s3-client');

// Save analysis results
await S3Service.uploadFile(
  process.env.S3_DATASETS_BUCKET,
  `results/${analysisId}.json`,
  JSON.stringify(results),
  'application/json'
);
```

### 3. Train ML Model

```bash
cd ml/sagemaker-training

# Prepare dataset
python prepare_dataset.py

# Upload to S3
aws s3 cp dataset.json s3://neurocode-ai-datasets-509913599/datasets/

# Launch training
python launch_training.py train s3://neurocode-ai-datasets-509913599/datasets/dataset.json

# Monitor progress
python launch_training.py status <job-name>
```

---

## 🔧 Configuration

### Environment Variables

All configured in `backend/api-gateway/.env`:

```env
# AWS Services (Already configured!)
S3_DATASETS_BUCKET=neurocode-ai-datasets-509913599
S3_MODELS_BUCKET=neurocode-ai-models-509913599
SQS_ANALYSIS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/455162985715/neurocode-ai-analysis-queue
SQS_TRAINING_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/455162985715/neurocode-ai-training-queue
SAGEMAKER_ROLE_ARN=arn:aws:iam::455162985715:role/neurocode-ai-sagemaker-role

# Local Services
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/neurocode
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

### Database Setup

Local PostgreSQL is used by default. To initialize:

```bash
# Connect to database
psql -U postgres -d neurocode

# Run migrations (if available)
npm run migrate

# Or create tables manually
# See backend/database/schema.sql
```

---

## 📚 Useful Commands

### Development

```bash
# Start all services
start-local.bat && start-backend.bat && start-frontend.bat

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart backend
# Ctrl+C in backend terminal, then start-backend.bat again
```

### AWS

```bash
# List S3 files
aws s3 ls s3://neurocode-ai-datasets-509913599/ --recursive

# Download from S3
aws s3 cp s3://neurocode-ai-datasets-509913599/file.json ./

# Check SQS messages
aws sqs receive-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/455162985715/neurocode-ai-analysis-queue

# Monitor costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost"
```

### Testing

```bash
# Test AWS connections
npm run test:aws

# Run backend tests
cd backend/api-gateway
npm test

# Run frontend tests
cd frontend
npm test
```

---

## 🐛 Troubleshooting

### Services won't start

```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :5432

# Stop Docker and restart
docker-compose down
docker-compose up -d
```

### Cannot connect to AWS

```bash
# Verify credentials
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://neurocode-ai-datasets-509913599/

# Re-run connection test
npm run test:aws
```

### Database connection fails

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres

# Use correct connection string
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/neurocode
```

---

## 🎯 Next Steps

1. ✅ **Start local development** (above)
2. 📝 **Implement features** using AWS services
3. 🧪 **Test with sample data**
4. 🤖 **Train first ML model**
5. 🚀 **Deploy to production** (see infra/README.md)

---

## 📖 Documentation

- **AWS_SETUP_SUCCESS.md** - Setup summary
- **AWS_INTEGRATION_README.md** - Complete AWS guide
- **AWS_QUICK_REFERENCE.md** - Command cheat sheet
- **DEMO_GUIDE.md** - Demo walkthrough
- **LOCAL_SETUP.md** - Detailed local setup

---

## ✅ You're Ready!

Everything is set up and working. Start developing with:

```bash
start-local.bat
start-backend.bat
start-frontend.bat
```

Then open: **http://localhost:3000**

Happy coding! 🚀
