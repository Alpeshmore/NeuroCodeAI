import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import authRoutes from './routes/auth'
import codeRoutes from './routes/code'
import confusionRoutes from './routes/confusion'
import explanationRoutes from './routes/explanation'
import learningRoutes from './routes/learning'
import { initializeWebSocket } from './websocket'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(rateLimiter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/code', codeRoutes)
app.use('/api/v1/confusion', confusionRoutes)
app.use('/api/v1/explanations', explanationRoutes)
app.use('/api/v1/learning', learningRoutes)

// Error handling
app.use(errorHandler)

// Initialize WebSocket
initializeWebSocket(io)

const PORT = parseInt(process.env.PORT || '4000', 10)
const FALLBACK_PORTS = [4001, 4002, 5000, 5001, 8080]

// Function to find available port
function findAvailablePort(startPort: number, fallbackPorts: number[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = httpServer.listen(startPort)
    
    server.once('listening', () => {
      const address = server.address()
      const port = typeof address === 'object' && address !== null ? address.port : startPort
      resolve(port)
    })
    
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`Port ${startPort} is already in use, trying next port...`)
        
        if (fallbackPorts.length > 0) {
          const nextPort = fallbackPorts.shift()!
          // Close current attempt and try next port
          server.close(() => {
            resolve(findAvailablePort(nextPort, fallbackPorts))
          })
        } else {
          // Use random port as last resort
          logger.warn('All fallback ports in use, using random available port...')
          server.close(() => {
            resolve(findAvailablePort(0, []))
          })
        }
      } else {
        logger.error('Server error:', err)
        reject(err)
      }
    })
  })
}

// Start server with port conflict handling
async function startServer() {
  try {
    const availablePort = await findAvailablePort(PORT, [...FALLBACK_PORTS])
    
    logger.info(`🚀 API Gateway running on port ${availablePort}`)
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
    logger.info(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`)
    logger.info(`✅ Server started successfully at http://localhost:${availablePort}`)
    
    if (availablePort !== PORT) {
      logger.warn(`⚠️  Note: Using port ${availablePort} instead of ${PORT} (port was in use)`)
    }
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  httpServer.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

export { app, io }
