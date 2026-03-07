import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getAnalysis, getSegments } from '@/lib/api'
import { setAnalysisStatus, setSegments } from '@/store/slices/analysisSlice'

export function useAnalysisStatus(analysisId: string | null) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('idle')
  const [segments, setSegmentsData] = useState<any[]>([])

  useEffect(() => {
    if (!analysisId) return

    const fetchAnalysisStatus = async () => {
      setLoading(true)
      try {
        const analysis = await getAnalysis(analysisId)
        const statusValue = String(analysis.data?.status || analysis.status || 'idle') as 'idle' | 'pending' | 'completed' | 'failed'
        setStatus(statusValue)
        dispatch(setAnalysisStatus(statusValue))

        if (statusValue === 'completed') {
          const segmentsData = await getSegments(analysisId)
          const segments = segmentsData.data?.segments || []
          setSegmentsData(segments)
          dispatch(setSegments(segments))
        }
      } catch (error) {
        console.error('Failed to fetch analysis status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysisStatus()

    // Poll for status updates
    const interval = setInterval(() => {
      if (status !== 'completed' && status !== 'failed') {
        fetchAnalysisStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [analysisId, status, dispatch])

  return { status, segments, loading }
}
