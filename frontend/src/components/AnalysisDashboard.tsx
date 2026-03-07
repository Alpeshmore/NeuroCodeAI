'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useAnalysisStatus } from '@/hooks/useAnalysisStatus'

interface AnalysisDashboardProps {
  analysisId: string | null
}

export default function AnalysisDashboard({ analysisId }: AnalysisDashboardProps) {
  const { status, segments, loading } = useAnalysisStatus(analysisId)

  if (!analysisId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Submit code to start analysis</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="text-gray-600 dark:text-gray-300">Analyzing code...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Analysis Dashboard
      </h2>

      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          {status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : status === 'failed' ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-500" />
          )}
          <span className="font-medium capitalize">{status}</span>
        </div>
      </div>

      {/* Segments */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
          Code Segments ({segments.length})
        </h3>
        
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Segment {index + 1}: {segment.type}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  segment.confusion_score > 0.7
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : segment.confusion_score > 0.4
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}
              >
                Confusion: {(segment.confusion_score * 100).toFixed(0)}%
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Complexity: {segment.complexity.toFixed(1)} | Lines: {segment.line_start}-{segment.line_end}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
