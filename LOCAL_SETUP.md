# NeuroCode AI - Local Development Setup

## 🚀 Quick Start (Windows)

Run NeuroCode AI on your local machine for demo and development.

## Prerequisites

1. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
2. **Node.js 18+** - [Download](https://nodejs.org/)
3. **Git** - [Download](https://git-scm.com/)

## 🎯 5-Minute Setup

### Step 1: Install Dependencies

```powershell
# Check installations
node --version
npm --version
docker --version
docker-compose --version
```

### Step 2: Install Project Dependencies

```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend/api-gateway
npm install
cd ../..
```

### Step 3: Start Backend Services

```powershell
# Start PostgreSQL, Redis, RabbitMQ
docker-compose up -d

# Wait for services to be ready (30 seconds)
timeout /t 30

# Check services are running
docker-compose ps
```

### Step 4: Start Backend API

```powershell
# In a new terminal
cd backend/api-gateway
npm run dev
```

### Step 5: Start Frontend

```powershell
# In another new terminal
cd frontend
npm run dev
```

### Step 6: Access Application

Open your browser:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Health**: http://localhost:4000/health

## 🎬 Demo Walkthrough

### 1. Open the Application
Navigate to http://localhost:3000

### 2. Write Some Code
```python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

result = calculate_fibonacci(10)
print(f"Fibonacci(10) = {result}")
```

### 3. Click "Analyze Code"
Watch the system:
- Segment the code
- Analyze complexity
- Detect potential confusion points
- Generate explanations

### 4. View Results
- **Analysis Dashboard**: See code segments and complexity scores
- **Confusion Heatmap**: Visual representation of confusion points
- **Explanations**: Adaptive explanations based on your level

## 📊 What's Running

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Frontend | 3000 | http://localhost:3000 | Next.js UI |
| API Gateway | 4000 | http://localhost:4000 | Backend API |
| PostgreSQL | 5432 | localhost:5432 | Database |
| Redis | 6379 | localhost:6379 | Cache |
| RabbitMQ | 5672 | localhost:5672 | Message Queue |
| RabbitMQ UI | 15672 | http://localhost:15672 | Queue Management |

## 🔧 Useful Commands

### Check Service Status
```powershell
docker-compose ps
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Restart Services
```powershell
docker-compose restart
```

### Stop Everything
```powershell
# Stop backend services
docker-compose down

# Stop frontend (Ctrl+C in terminal)
# Stop API (Ctrl+C in terminal)
```

### Clean Start
```powershell
# Remove all data and restart
docker-compose down -v
docker-compose up -d
```

## 🐛 Troubleshooting

### Port Already in Use

**Error**: Port 3000/4000/5432 already in use

**Solution**:
```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Docker Not Running

**Error**: Cannot connect to Docker daemon

**Solution**:
1. Start Docker Desktop
2. Wait for it to fully start
3. Try again

### Database Connection Failed

**Error**: Cannot connect to PostgreSQL

**Solution**:
```powershell
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Frontend Build Errors

**Error**: Module not found

**Solution**:
```powershell
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

## 📝 Environment Variables

Create `.env` files if needed:

### Backend (.env)
```env
NODE_ENV=development
PORT=4000
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/neurocode
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=dev-secret-key-change-in-production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## 🎨 Demo Features

### 1. Code Analysis
- Paste code in the editor
- Select language (Python, JavaScript, etc.)
- Click "Analyze Code"
- View segmentation and analysis

### 2. Confusion Detection
- System analyzes code complexity
- Identifies potential confusion points
- Shows heatmap visualization

### 3. Adaptive Explanations
- Switch between Beginner/Intermediate/Advanced
- Get explanations tailored to your level
- Rate explanations (thumbs up/down)

### 4. Learning Progress
- Track your learning journey
- See concept mastery
- Get personalized recommendations

## 🚀 Next Steps

### For Development
1. Modify components in `frontend/src/components/`
2. Add API endpoints in `backend/api-gateway/src/routes/`
3. Hot reload will update automatically

### For Demo
1. Prepare sample code snippets
2. Show different complexity levels
3. Demonstrate adaptive explanations
4. Show confusion heatmap

### For Production
1. Follow AWS deployment guide
2. Use production environment variables
3. Enable security features
4. Set up monitoring

## 📚 Additional Resources

- **API Documentation**: http://localhost:4000/api/docs
- **RabbitMQ Dashboard**: http://localhost:15672 (guest/guest)
- **Database**: Use any PostgreSQL client to connect

## 🎯 Demo Script

### 5-Minute Demo

**Minute 1**: Introduction
- "NeuroCode AI helps developers learn code through AI-powered analysis"
- Show the clean interface

**Minute 2**: Code Input
- Paste a complex function
- Explain the confusion-aware approach

**Minute 3**: Analysis
- Click analyze
- Show real-time segmentation
- Point out complexity scores

**Minute 4**: Confusion Detection
- Show heatmap
- Explain how it detects confusion points
- Highlight problematic areas

**Minute 5**: Adaptive Explanations
- Switch between learning levels
- Show how explanations adapt
- Demonstrate the learning-first approach

## 💡 Pro Tips

1. **Use Sample Code**: Keep interesting code snippets ready
2. **Show Progression**: Start simple, then show complex code
3. **Highlight Differences**: Show beginner vs advanced explanations
4. **Interactive**: Let audience suggest code to analyze
5. **Emphasize Learning**: Focus on understanding, not just output

## 🎬 Recording Demo

### Preparation
```powershell
# Start all services
docker-compose up -d
cd backend/api-gateway && npm run dev
cd frontend && npm run dev

# Open browser to localhost:3000
# Have sample code ready
# Clear browser cache for clean demo
```

### During Demo
- Keep terminal windows visible
- Show logs in real-time
- Demonstrate error handling
- Show responsive design

## 🆘 Quick Fixes

### Reset Everything
```powershell
# Stop all
docker-compose down -v
taskkill /F /IM node.exe

# Clean install
npm install
cd frontend && npm install && cd ..
cd backend/api-gateway && npm install && cd ../..

# Restart
docker-compose up -d
# Start backend and frontend in separate terminals
```

### Check Health
```powershell
# API health
curl http://localhost:4000/health

# Database
docker-compose exec postgres psql -U postgres -c "SELECT version();"

# Redis
docker-compose exec redis redis-cli ping
```

---

**Ready to demo! 🚀**

**Time to setup**: 5 minutes
**Time to demo**: 5-10 minutes
**Wow factor**: High! ✨
