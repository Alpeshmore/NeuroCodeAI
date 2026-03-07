# 🚀 Run NeuroCode AI Project - Quick Guide

## Current Status
Docker Desktop is **NOT RUNNING** on your system.

## Step-by-Step Instructions

### Option 1: Full Docker Setup (Recommended for Demo)

#### 1. Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully start (whale icon in system tray should be steady)
- Verify by running: `docker info`

#### 2. Run the Complete Setup
```bash
# This will start all services (PostgreSQL, Redis, RabbitMQ, InfluxDB)
start-local.bat
```

This script will:
- ✓ Start all backend services with Docker Compose
- ✓ Install all dependencies
- ✓ Set up the database
- ✓ Configure environment variables

#### 3. Start Backend API (New Terminal)
```bash
cd backend\api-gateway
npm run dev
```

Backend will run on: http://localhost:4000

#### 4. Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:3000

#### 5. Open Your Browser
Navigate to: **http://localhost:3000**

---

### Option 2: Quick Start (Backend + Frontend Only)

If you want to skip Docker services and just run the application with mock data:

#### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend\api-gateway
npm install
cd ..\..

# Frontend dependencies
cd frontend
npm install
cd ..
```

#### 2. Start Backend (Terminal 1)
```bash
cd backend\api-gateway
npm run dev
```

The backend has mock data built-in, so it will work without database.

#### 3. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

#### 4. Open Browser
http://localhost:3000

---

## 🎯 What You'll See

### Frontend (http://localhost:3000)
- Code editor with syntax highlighting
- Real-time code analysis
- Confusion heatmap visualization
- Adaptive explanations panel
- Learning progress tracking

### Backend API (http://localhost:4000)
- Health check: http://localhost:4000/health
- API docs: http://localhost:4000/api/v1/docs
- WebSocket for real-time updates

### Services (if using Docker)
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- RabbitMQ: localhost:5672
- RabbitMQ UI: http://localhost:15672 (admin/admin)
- InfluxDB: localhost:8086

---

## 🧪 Test the Application

### 1. Paste Sample Code
```python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

result = calculate_fibonacci(10)
print(result)
```

### 2. Click "Analyze Code"
- Watch the confusion heatmap highlight complex areas
- See recursive call detection
- Get adaptive explanations

### 3. Try Different Languages
- Python, JavaScript, Java, C++, Go
- Each with language-specific analysis

---

## 🛠 Troubleshooting

### Docker Not Starting
```bash
# Check Docker status
docker info

# If error, restart Docker Desktop
# Then run: start-local.bat
```

### Port Already in Use
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install
```

### Backend Not Connecting
- Check if Docker services are running: `docker-compose ps`
- Restart services: `docker-compose restart`
- View logs: `docker-compose logs -f`

---

## 📊 Demo Script (10 Minutes)

Follow the **DEMO_GUIDE.md** for a complete walkthrough:
1. Code analysis demo (2 min)
2. Confusion detection (2 min)
3. Adaptive explanations (2 min)
4. Learning memory (2 min)
5. Real-time updates (2 min)

---

## 🔄 Stop the Project

### Stop Frontend/Backend
Press `Ctrl+C` in each terminal

### Stop Docker Services
```bash
docker-compose down
```

### Stop Everything
```bash
docker-compose down -v
# This removes volumes too (cleans database)
```

---

## 📚 Next Steps

- **Local Demo**: Follow QUICK_START.md
- **AWS Deployment**: Follow infra/README.md
- **Full Documentation**: See DOCUMENTATION_INDEX.md

---

## ⚡ Quick Commands Reference

```bash
# Start everything
start-local.bat

# Start backend only
cd backend\api-gateway && npm run dev

# Start frontend only
cd frontend && npm run dev

# Check Docker services
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down
```

---

**Ready to run?** Start Docker Desktop, then run `start-local.bat`!
