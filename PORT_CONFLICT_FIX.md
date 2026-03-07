# ✅ Port Conflict Fix - EADDRINUSE Error Resolved

## Problem Identified

**Error:** `EADDRINUSE: address already in use :::4000`  
**Cause:** Another process is using port 4000  
**Impact:** Backend server fails to start

## Solutions Implemented

### 1. Automatic Port Detection

The backend now automatically finds an available port if 4000 is in use.

**Updated:** `backend/api-gateway/src/index.ts`

```typescript
const PORT = parseInt(process.env.PORT || '4000', 10)
const FALLBACK_PORTS = [4001, 4002, 5000, 5001, 8080]

async function findAvailablePort(startPort: number): Promise<number> {
  // Automatically tries fallback ports if primary port is in use
  // Falls back to random port if all specified ports are taken
}
```

**Port Priority:**
1. Port 4000 (default)
2. Port 4001 (fallback 1)
3. Port 4002 (fallback 2)
4. Port 5000 (fallback 3)
5. Port 5001 (fallback 4)
6. Port 8080 (fallback 5)
7. Random available port (last resort)

### 2. Enhanced Error Handling

Added comprehensive error handling:

```typescript
// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => { ... })

// Graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', () => { ... })

// Handle uncaught exceptions
process.on('uncaughtException', (error) => { ... })

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => { ... })
```

### 3. Improved Logging

Enhanced server startup logging:

```
🚀 API Gateway running on port 4000
📍 Environment: development
🌐 CORS Origin: http://localhost:3000
✅ Server started successfully at http://localhost:4000

⚠️  Note: Using port 4001 instead of 4000 (port was in use)
```

### 4. Port Conflict Detection Script

**Created:** `kill-port-4000.bat`

Utility script to kill processes using port 4000:

```bash
# Run this if you need to free port 4000
kill-port-4000.bat
```

Features:
- Detects process using port 4000
- Shows process name and PID
- Asks for confirmation before killing
- Provides clear feedback

### 5. Enhanced Start Script

**Updated:** `start-backend.bat`

Now includes:
- Port conflict detection
- Interactive options menu
- Automatic process killing option
- Clear status messages

**Options when port is in use:**
1. Kill the process using port 4000
2. Start backend on a different port
3. Cancel

## How to Use

### Option 1: Automatic Port Selection (Recommended)

Just start the backend normally:

```bash
cd "NeuroCode AI"
start-backend.bat
```

The server will automatically find an available port.

### Option 2: Kill Process on Port 4000

If you want to use port 4000 specifically:

```bash
# Method 1: Use the utility script
kill-port-4000.bat

# Method 2: Use the start script's option
start-backend.bat
# Choose option 1 when prompted
```

### Option 3: Manual Port Selection

Set a specific port via environment variable:

```bash
# Windows
set PORT=5000
start-backend.bat

# Or in .env file
PORT=5000
```

## Verification

### Check What's Using Port 4000

```bash
# Windows
netstat -ano | findstr :4000

# Find process details
tasklist | findstr <PID>
```

### Test Backend Connection

```bash
# After backend starts, test health endpoint
curl http://localhost:4000/health

# Or open in browser
http://localhost:4000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-07T..."
}
```

## Common Scenarios

### Scenario 1: Port 4000 in Use by Another App

**Solution:** Backend automatically uses port 4001

```
[WARN] Port 4000 is already in use, trying next port...
🚀 API Gateway running on port 4001
⚠️  Note: Using port 4001 instead of 4000 (port was in use)
```

### Scenario 2: Previous Backend Instance Still Running

**Solution:** Kill the old process

```bash
# Use the utility script
kill-port-4000.bat

# Or use start script option 1
start-backend.bat
```

### Scenario 3: Multiple Backend Instances

**Solution:** Each instance gets a different port

```
Instance 1: Port 4000
Instance 2: Port 4001
Instance 3: Port 4002
```

### Scenario 4: All Fallback Ports Taken

**Solution:** System assigns random available port

```
🚀 API Gateway running on port 54321
⚠️  Note: Using port 54321 instead of 4000 (port was in use)
```

## Frontend Configuration

If backend starts on a different port, update frontend:

**File:** `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_WS_URL=ws://localhost:4001
```

Or set dynamically in code:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
```

## Troubleshooting

### Issue: "Access Denied" when killing process

**Solution:** Run script as Administrator

```bash
# Right-click kill-port-4000.bat
# Select "Run as administrator"
```

### Issue: Backend starts but frontend can't connect

**Solution:** Check the actual port backend is using

```bash
# Look for this in backend console:
🚀 API Gateway running on port 4001

# Update frontend API URL to match
```

### Issue: Port keeps getting taken

**Solution:** Find what's using the port

```bash
# Windows
netstat -ano | findstr :4000
tasklist | findstr <PID>

# Common culprits:
# - Previous Node.js instance
# - Another development server
# - Docker container
# - System service
```

### Issue: Nodemon not restarting properly

**Solution:** Clear nodemon cache

```bash
cd backend/api-gateway
npx nodemon --clear
npm run dev
```

## Benefits

✅ **No More Manual Port Killing** - Automatic fallback  
✅ **Graceful Error Handling** - Clear error messages  
✅ **Better Logging** - Know exactly what port is used  
✅ **Multiple Instances** - Run multiple backends simultaneously  
✅ **Production Ready** - Handles port conflicts in any environment  
✅ **Developer Friendly** - Interactive options and clear feedback  

## Testing Checklist

- [x] Backend starts on port 4000 when available
- [x] Backend falls back to 4001 when 4000 is in use
- [x] Backend falls back to 4002 when 4001 is in use
- [x] Backend uses random port when all fallbacks fail
- [x] Graceful shutdown on Ctrl+C
- [x] Graceful shutdown on SIGTERM
- [x] Error handling for uncaught exceptions
- [x] Error handling for unhandled rejections
- [x] Port conflict detection in start script
- [x] Kill port utility works correctly
- [x] Clear logging messages
- [x] Health endpoint accessible

## Status

- **Port Conflict Handling:** ✅ Implemented
- **Automatic Fallback:** ✅ Working
- **Error Handling:** ✅ Enhanced
- **Utility Scripts:** ✅ Created
- **Documentation:** ✅ Complete
- **Production Ready:** ✅ Yes

---

**Fixed:** 2026-03-07  
**Status:** ✅ Complete  
**Backend:** Ready to start on any available port
