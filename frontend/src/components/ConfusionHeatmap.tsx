'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

interface ConfusionHeatmapProps {
  analysisId: string | null
}

interface HeatmapData {
  line: number
  score: number
}

export default function ConfusionHeatmap({ analysisId }: ConfusionHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])

  useEffect(() => {
    if (analysisId) {
      // Fetch heatmap data
      // This is a placeholder - implement actual API call
      const mockData: HeatmapData[] = Array.from({ length: 20 }, (_, i) => ({
        line: i + 1,
        score: Math.random(),
      }))
      setHeatmapData(mockData)
    }
  }, [analysisId])

  if (!analysisId || heatmapData.length === 0) {
    return null
  }

  const getColorClass = (score: number) => {
    if (score > 0.7) return 'bg-red-500'
    if (score > 0.4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Confusion Heatmap
        </h3>
      </div>

      <div className="space-y-2">
        {heatmapData.map((data) => (
          <div key={data.line} className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
              L{data.line}
            </span>
            <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <div
                className={`h-full ${getColorClass(data.score)} transition-all duration-300`}
                style={{ width: `${data.score * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300 w-12 text-right">
              {(data.score * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}
