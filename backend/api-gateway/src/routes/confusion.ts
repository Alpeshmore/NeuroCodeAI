import { Router } from 'express'
import { logger } from '../utils/logger'

const router = Router()

router.post('/detect', async (req, res) => {
  try {
    const { segment_id, user_behavior } = req.body
    
    logger.info('Confusion detection', { segment_id })
    
    res.json({
      success: true,
      data: {
        segment_id,
        confusion_score: 0.65,
        confusion_type: 'logic',
        confidence: 0.85,
      },
    })
  } catch (error) {
    logger.error('Confusion detection error:', error)
    res.status(500).json({ success: false, error: 'Detection failed' })
  }
})

router.get('/heatmap/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    res.json({
      success: true,
      data: {
        analysis_id: id,
        heatmap: Array.from({ length: 20 }, (_, i) => ({
          line: i + 1,
          score: Math.random(),
        })),
      },
    })
  } catch (error) {
    logger.error('Heatmap error:', error)
    res.status(500).json({ success: false, error: 'Failed to get heatmap' })
  }
})

export default router
