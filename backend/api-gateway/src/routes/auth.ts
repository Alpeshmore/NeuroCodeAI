import { Router } from 'express'
import { logger } from '../utils/logger'

const router = Router()

// Mock authentication for demo
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    
    logger.info('User registration attempt', { email })
    
    // Mock response
    res.json({
      success: true,
      data: {
        user: {
          id: 'user_' + Date.now(),
          email,
          learning_level: 'intermediate',
        },
        token: 'mock_jwt_token_' + Date.now(),
      },
    })
  } catch (error) {
    logger.error('Registration error:', error)
    res.status(500).json({ success: false, error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    logger.info('User login attempt', { email })
    
    // Mock response
    res.json({
      success: true,
      data: {
        user: {
          id: 'user_123',
          email,
          learning_level: 'intermediate',
        },
        token: 'mock_jwt_token_' + Date.now(),
      },
    })
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

router.post('/logout', async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
})

export default router
