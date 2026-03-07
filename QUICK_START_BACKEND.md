# 🚀 Quick Start - Backend Server

## Current Status

✅ Port conflict handling implemented  
✅ Automatic port fallback configured  
✅ Enhanced error handling added  
✅ Utility scripts created  

## Start Backend (3 Methods)

### Method 1: Automatic (Recommended)

```bash
cd "NeuroCode AI"
start-backend.bat
```

**What happens:**
- Checks if port 4000 is in use
- Offers options if port is taken
- Automatically finds available port
- Starts server with clear logging

### Method 2: Kill Port First

```bash
cd "NeuroCode AI"

# Kill process on port 4000
kill-port-4000.bat

# Then start backend
start-backend.bat
```

### Method 3: Manual Port

```bash
cd "NeuroCode AI"

# Set custom port
set PORT=5000

# Start backend
start-backend.bat
```

## What You'll See

### Successful Start

```
==========================================
Starting NeuroCode AI Backend
==========================================

Starting backend server...

[INFO] Backend will start on port 4000 or next available port
[INFO] Check console output for actual port number

🚀 API Gateway running on port 4000
📍 Environment: development
🌐 CORS Origin: http://localhost:3000
✅ Server started successfully at http://localhost:4000
```

### Port Conflict (Automatic Fallback)

```
[WARN] Port 4000 is already in use, trying next port...
🚀 API Gateway running on port 4001
📍 Environment: development
🌐 CORS Origin: http://localhost:3000
✅ Server started successfully at http://localhost:4001
⚠️  Note: Using port 4001 instead of 4000 (port was in use)
```

## Test Backend

### Health Check

```bash
# Open in browser
http://localhost:4000/health

# Or use curl
curl http://localhost:4000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-07T..."
}
```

### API Endpoints

```bash
# Code analysis
POST http://localhost:4000/api/v1/code/analyze

# Get analysis
GET http://localhost:4000/api/v1/code/analysis/:id

# Confusion detection
POST http://localhost:4000/api/v1/confusion/detect

# Explanations
GET http://localhost:4000/api/v1/explanations/:id
```

## Current Port Status

**Port 4000:** Currently in use (PID: 16900)

**Options:**
1. Let backend use port 4001 automatically
2. Kill process 16900 to free port 4000
3. Use custom port (e.g., 5000)

## Kill Process on Port 4000

### Option 1: Use Utility Script

```bash
kill-port-4000.bat
```

### Option 2: Manual

```bash
# Find PID
netstat -ano | findstr :4000

# Kill process (replace 16900 with actual PID)
taskkill /F /PID 16900
```

## Connect Frontend to Backend

If backend starts on a different port, update frontend:

**Create:** `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_WS_URL=ws://localhost:4001
```

## Full Stack Startup

### Terminal 1: Local Services
```bash
start-local.bat
```

### Terminal 2: Backend
```bash
start-backend.bat
```

### Terminal 3: Frontend
```bash
start-frontend.bat
```

## Troubleshooting

### Backend won't start

**Check:**
1. Node.js installed? `node --version`
2. Dependencies installed? `cd backend/api-gateway && npm install`
3. .env file exists? Check `backend/api-gateway/.env`

### Port still in use

**Solution:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Or restart computer
```

### Can't connect from frontend

**Check:**
1. Backend actually running?
2. Correct port in frontend config?
3. CORS configured correctly?
4. Firewall blocking connection?

## Environment Variables

**File:** `backend/api-gateway/.env`

```env
# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Database
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/neurocode

# AWS (already configured)
AWS_REGION=us-east-1
S3_DATASETS_BUCKET=neurocode-ai-datasets-509913599
S3_MODELS_BUCKET=neurocode-ai-models-509913599
SQS_ANALYSIS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
SQS_TRAINING_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
SAGEMAKER_ROLE_ARN=arn:aws:iam::455162985715:role/...

# JWT
JWT_SECRET=your-secret-key

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
```

## Development Commands

```bash
cd backend/api-gateway

# Start development server
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## Status Indicators

✅ **Server Running** - Logs show "Server started successfully"  
⚠️ **Port Changed** - Using fallback port  
❌ **Error** - Check logs for details  
🔄 **Restarting** - Nodemon detected changes  

## Next Steps

1. ✅ Start backend server
2. ✅ Verify health endpoint
3. ✅ Start frontend
4. ✅ Test full stack integration
5. ✅ Start coding!

---

**Ready to Start:** ✅ Yes  
**Port Handling:** ✅ Automatic  
**Error Handling:** ✅ Enhanced  
**Status:** 🚀 Ready to Launch
