import { Router } from 'express'
import { logger } from '../utils/logger'

const router = Router()

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    res.json({
      success: true,
      data: {
        explanation_id: id,
        level: 'intermediate',
        content: {
          summary: 'This is a recursive function that calculates Fibonacci numbers.',
          detailed: 'The function uses recursion to break down the problem into smaller subproblems...',
          examples: ['fibonacci(0) = 0', 'fibonacci(1) = 1', 'fibonacci(5) = 5'],
        },
      },
    })
  } catch (error) {
    logger.error('Get explanation error:', error)
    res.status(500).json({ success: false, error: 'Failed to get explanation' })
  }
})

router.post('/generate', async (req, res) => {
  try {
    const { segmentId, level } = req.body
    
    logger.info('Generate explanation', { segmentId, level })
    
    res.json({
      success: true,
      data: {
        explanation_id: 'exp_' + Date.now(),
        level,
        content: {
          summary: 'Generated explanation for the code segment.',
          detailed: 'Detailed explanation based on your learning level...',
        },
      },
    })
  } catch (error) {
    logger.error('Generate explanation error:', error)
    res.status(500).json({ success: false, error: 'Failed to generate explanation' })
  }
})

export default router
