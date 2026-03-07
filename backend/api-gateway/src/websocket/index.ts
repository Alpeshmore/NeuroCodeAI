import { Server } from 'socket.io'
import { logger } from '../utils/logger'

export function initializeWebSocket(io: Server) {
  io.on('connection', (socket) => {
    logger.info('Client connected', { socketId: socket.id })

    socket.on('subscribe:analysis', (analysisId: string) => {
      socket.join(`analysis:${analysisId}`)
      logger.info('Client subscribed to analysis', { analysisId, socketId: socket.id })
    })

    socket.on('subscribe:confusion', (sessionId: string) => {
      socket.join(`confusion:${sessionId}`)
      logger.info('Client subscribed to confusion', { sessionId, socketId: socket.id })
    })

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id })
    })
  })

  // Emit analysis updates (mock)
  setInterval(() => {
    io.emit('analysis:update', {
      type: 'progress',
      message: 'Analysis in progress...',
      timestamp: new Date().toISOString(),
    })
  }, 5000)

  logger.info('WebSocket initialized')
}
