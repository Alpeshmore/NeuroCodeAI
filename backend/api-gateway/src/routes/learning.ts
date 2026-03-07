import { Router } from 'express'
import { logger } from '../utils/logger'

const router = Router()

router.get('/progress', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user_id: 'user_123',
        learning_level: 'intermediate',
        concepts_mastered: 15,
        total_concepts: 50,
        progress_percentage: 30,
      },
    })
  } catch (error) {
    logger.error('Get progress error:', error)
    res.status(500).json({ success: false, error: 'Failed to get progress' })
  }
})

router.get('/concepts', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        concepts: [
          { id: 'c1', name: 'Recursion', mastery: 75 },
          { id: 'c2', name: 'Loops', mastery: 90 },
          { id: 'c3', name: 'Functions', mastery: 85 },
        ],
      },
    })
  } catch (error) {
    logger.error('Get concepts error:', error)
    res.status(500).json({ success: false, error: 'Failed to get concepts' })
  }
})

router.post('/feedback', async (req, res) => {
  try {
    const { explanation_id, rating, helpful } = req.body
    
    logger.info('Feedback received', { explanation_id, rating, helpful })
    
    res.json({
      success: true,
      message: 'Feedback recorded',
    })
  } catch (error) {
    logger.error('Feedback error:', error)
    res.status(500).json({ success: false, error: 'Failed to record feedback' })
  }
})

export default router
