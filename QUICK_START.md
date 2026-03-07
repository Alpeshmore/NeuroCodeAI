# 🚀 NeuroCode AI - Quick Start Guide

## For Windows Users - Get Running in 5 Minutes!

### Step 1: Prerequisites (2 minutes)

Install these if you haven't already:

1. **Docker Desktop** - https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop
   - Wait for it to fully start (whale icon in system tray)

2. **Node.js 18+** - https://nodejs.org/
   - Download and install LTS version
   - Verify: Open PowerShell and run `node --version`

### Step 2: One-Click Setup (1 minute)

Double-click: **`start-local.bat`**

This will:
- ✅ Start PostgreSQL, Redis, RabbitMQ
- ✅ Install all dependencies
- ✅ Set up the environment

### Step 3: Start Backend (30 seconds)

Double-click: **`start-backend.bat`**

Wait for: `API Gateway running on port 4000`

### Step 4: Start Frontend (30 seconds)

Double-click: **`start-frontend.bat`**

Wait for: `Ready on http://localhost:3000`

### Step 5: Open Application (10 seconds)

Open your browser: **http://localhost:3000**

## 🎬 Demo Time!

### Try This Code:

```python
def calculate_fibonacci(n):
    """Calculate Fibonacci number recursively"""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Calculate Fibonacci(10)
result = calculate_fibonacci(10)
print(f"Fibonacci(10) = {result}")
```

### What to Show:

1. **Paste the code** in the editor
2. **Select "Python"** from dropdown
3. **Click "Analyze Code"** button
4. **Watch the magic:**
   - Code gets segmented
   - Complexity analyzed
   - Confusion points detected
   - Heatmap generated
   - Explanations created

5. **Switch learning levels:**
   - Try "Beginner" - Simple explanations
   - Try "Advanced" - Technical details

## 📊 What's Running

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main UI |
| **Backend API** | http://localhost:4000 | REST API |
| **API Health** | http://localhost:4000/health | Health check |
| **RabbitMQ UI** | http://localhost:15672 | Queue management (guest/guest) |

## 🎯 Demo Script (5 minutes)

### Minute 1: Introduction
"NeuroCode AI is a learning-first platform that helps developers understand code through AI-powered analysis and adaptive explanations."

### Minute 2: Show the Interface
- Clean, modern UI
- Monaco code editor
- Real-time analysis
- Confusion heatmap

### Minute 3: Analyze Code
- Paste complex code
- Click analyze
- Show segmentation
- Point out complexity scores

### Minute 4: Confusion Detection
- Show heatmap visualization
- Explain confusion scores
- Highlight problematic areas
- Red = high confusion, Green = low

### Minute 5: Adaptive Explanations
- Switch between learning levels
- Show how explanations adapt
- Demonstrate learning-first approach
- Rate explanations

## 🐛 Troubleshooting

### Docker Not Running?
```powershell
# Check Docker status
docker info

# If not running, start Docker Desktop
# Wait for whale icon in system tray
```

### Port Already in Use?
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Services Not Starting?
```powershell
# Restart everything
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs
```

### Frontend Build Error?
```powershell
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 🛑 Stop Everything

```powershell
# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)

# Stop Docker services
docker-compose down
```

## 📝 Sample Code Snippets

### Python - Recursion
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```

### JavaScript - Async
```javascript
async function fetchUserData(userId) {
    const response = await fetch(`/api/users/${userId}`)
    const data = await response.json()
    return data
}
```

### Python - Complex Logic
```python
def find_prime_factors(n):
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors
```

## 🎨 Features to Demonstrate

### 1. Code Segmentation
- Shows how code is broken into logical units
- Each segment analyzed independently
- Complexity scores for each segment

### 2. Confusion Detection
- Real-time analysis of confusion points
- Visual heatmap representation
- Color-coded by confusion level

### 3. Adaptive Explanations
- Beginner: Simple language, analogies
- Intermediate: Technical with context
- Advanced: Concise, design patterns

### 4. Learning Progress
- Track concepts mastered
- See learning journey
- Get recommendations

## 💡 Pro Tips

1. **Keep it Simple**: Start with simple code, then show complex
2. **Show Progression**: Demonstrate learning level differences
3. **Interactive**: Let audience suggest code to analyze
4. **Emphasize Learning**: Focus on understanding, not just output
5. **Show Real-Time**: Keep logs visible to show processing

## 🆘 Need Help?

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
```

### Reset Everything
```powershell
docker-compose down -v
docker-compose up -d
```

## 📚 Next Steps

### For Development
- Modify components in `frontend/src/components/`
- Add API endpoints in `backend/api-gateway/src/routes/`
- Changes auto-reload

### For Production
- Follow `infra/README.md` for AWS deployment
- Use production environment variables
- Enable security features

### For ML Training
- See `ml/sagemaker-training/` for training scripts
- Follow AWS deployment guide
- Use SageMaker for training

## 🎉 You're Ready!

Everything is set up and running. Open http://localhost:3000 and start exploring!

**Time to setup**: 5 minutes
**Time to demo**: 5-10 minutes
**Wow factor**: High! ✨

---

**Questions?** Check the full documentation in `LOCAL_SETUP.md`

**Issues?** See troubleshooting section above

**Ready to deploy?** See `infra/README.md` for AWS deployment
