'use client'

import { useState } from 'react'
import { MessageSquare, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react'

interface ExplanationPanelProps {
  analysisId: string | null
}

type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced'

export default function ExplanationPanel({ analysisId }: ExplanationPanelProps) {
  const [level, setLevel] = useState<ExplanationLevel>('intermediate')
  const [explanations, setExplanations] = useState<any[]>([])

  if (!analysisId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Explanations will appear here after analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Adaptive Explanations
        </h2>
        
        <div className="flex items-center space-x-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as ExplanationLevel)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Explanation Cards */}
      <div className="space-y-4">
        {explanations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Generating explanations...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        ) : (
          explanations.map((explanation, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {explanation.title}
                </h3>
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {explanation.content}
                </p>
              </div>

              {/* Feedback */}
              <div className="flex items-center space-x-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Was this helpful?
                </span>
                <button className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">Yes</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-sm">No</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
