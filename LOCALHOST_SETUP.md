# 🏠 Run NeuroCode AI on Localhost - Simple Guide

## ✅ Yes! This project runs perfectly on localhost

You have TWO options:

---

## 🚀 Option 1: Quick Start (No Docker - Fastest)

This runs the backend and frontend directly on your machine with mock data.

### Step 1: Install Backend Dependencies
Open **Command Prompt** (not PowerShell) and run:
```cmd
cd backend\api-gateway
npm install
```

### Step 2: Install Frontend Dependencies
In the same or new Command Prompt:
```cmd
cd frontend
npm install
```

### Step 3: Start Backend
In Command Prompt:
```cmd
cd backend\api-gateway
npm run dev
```

You'll see:
```
✓ Backend API running on http://localhost:4000
✓ WebSocket server ready
✓ Mock data loaded
```

### Step 4: Start Frontend (New Command Prompt)
Open a NEW Command Prompt:
```cmd
cd frontend
npm run dev
```

You'll see:
```
✓ Ready on http://localhost:3000
```

### Step 5: Open Browser
Go to: **http://localhost:3000**

**That's it!** Your app is running on localhost with mock data.

---

## 🐳 Option 2: Full Setup (With Docker)

This includes database, Redis, RabbitMQ, etc.

### Step 1: Start Docker Desktop
- Open Docker Desktop application
- Wait until it's fully running

### Step 2: Run Setup Script
In Command Prompt:
```cmd
start-local.bat
```

This will:
- Start PostgreSQL, Redis, RabbitMQ, InfluxDB
- Install all dependencies
- Set up the environment

### Step 3: Start Backend
```cmd
cd backend\api-gateway
npm run dev
```

### Step 4: Start Frontend
```cmd
cd frontend
npm run dev
```

### Step 5: Open Browser
**http://localhost:3000**

---

## 🎯 What You Get on Localhost

### Frontend (Port 3000)
- ✅ Code editor with syntax highlighting
- ✅ Real-time code analysis
- ✅ Confusion heatmap visualization
- ✅ Adaptive explanations
- ✅ Learning progress tracking

### Backend API (Port 4000)
- ✅ REST API endpoints
- ✅ WebSocket for real-time updates
- ✅ Mock data (works without database)
- ✅ All routes functional

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health
- **API Docs**: http://localhost:4000/api/v1/docs

---

## 🧪 Test It Out

Once running, try this:

1. **Paste this code in the editor:**
```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n-1)

result = factorial(5)
print(result)
```

2. **Click "Analyze Code"**

3. **Watch the magic:**
   - Confusion heatmap highlights complex areas
   - Recursive call detection
   - Step-by-step explanations
   - Learning recommendations

---

## 🛠 Troubleshooting

### PowerShell Script Error
**Problem**: "running scripts is disabled"

**Solution**: Use **Command Prompt** instead of PowerShell
- Press `Win + R`
- Type `cmd`
- Press Enter

### Port Already in Use
**Problem**: "Port 3000 is already in use"

**Solution**:
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### npm Not Found
**Problem**: "npm is not recognized"

**Solution**: Install Node.js from https://nodejs.org/
- Download LTS version
- Install
- Restart Command Prompt

### Dependencies Taking Long
**Problem**: npm install is slow

**Solution**: Be patient, first install takes 2-5 minutes
- Backend: ~200 packages
- Frontend: ~300 packages

---

## ⚡ Quick Commands

### Start Backend
```cmd
cd backend\api-gateway
npm run dev
```

### Start Frontend
```cmd
cd frontend
npm run dev
```

### Check if Running
```cmd
curl http://localhost:4000/health
curl http://localhost:3000
```

### Stop Services
Press `Ctrl + C` in each Command Prompt window

---

## 📊 System Requirements

- ✅ Windows (you have this)
- ✅ Node.js 18+ (check: `node --version`)
- ✅ npm 9+ (check: `npm --version`)
- ⚠️ Docker Desktop (optional, only for full setup)

---

## 🎬 Ready to Start?

### Fastest Way (5 minutes):
1. Open Command Prompt
2. `cd backend\api-gateway && npm install`
3. `npm run dev`
4. Open new Command Prompt
5. `cd frontend && npm install`
6. `npm run dev`
7. Open browser: http://localhost:3000

### Need Help?
- Check QUICK_START.md for detailed guide
- Check DEMO_GUIDE.md for demo walkthrough
- Check LOCAL_SETUP.md for troubleshooting

---

**Yes, it runs on localhost! Let's get it started! 🚀**
