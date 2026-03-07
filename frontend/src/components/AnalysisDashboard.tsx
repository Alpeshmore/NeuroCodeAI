'use client'

import { useState } from 'react'
import { Activity, AlertCircle, CheckCircle, Clock, MoreHorizontal, Zap, Shield, Bot, Send } from 'lucide-react'
import { useAnalysisStatus } from '@/hooks/useAnalysisStatus'

interface AnalysisDashboardProps {
  analysisId: string | null
}

export default function AnalysisDashboard({ analysisId }: AnalysisDashboardProps) {
  const { status, segments, loading } = useAnalysisStatus(analysisId)
  const [aiQuestion, setAiQuestion] = useState('')

  const handleAskAI = () => {
    if (aiQuestion.trim()) {
      // Placeholder for AI question functionality
      setAiQuestion('')
    }
  }

  if (!analysisId) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Analysis</h2>
          </div>
          <button className="p-1 rounded hover:bg-gray-700 transition-colors">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-16 h-16 rounded-full bg-green-600/10 flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-sm text-gray-500 text-center italic">
            Explanations will appear here after analysis
          </p>
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 pb-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Quick Suggestions
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-sm font-semibold text-white">Optimize Complexity</span>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                Let NeuroCode AI find O(n²) bottlenecks in your current script.
              </p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span className="text-sm font-semibold text-white">Security Audit</span>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                Check for SQL injection and insecure dependency usage.
              </p>
            </div>
          </div>
        </div>

        {/* AI Chat Input */}
        <div className="p-3 border-t border-gray-700/50">
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg border border-gray-700 px-3 py-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder="Ask AI a question about your code..."
              className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={handleAskAI}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Analysis</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-gray-300">Analyzing code...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Analysis</h2>
        </div>
        <button className="p-1 rounded hover:bg-gray-700 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Status */}
      <div className="px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center space-x-2">
          {status === 'completed' ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : status === 'failed' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <Clock className="w-4 h-4 text-yellow-400" />
          )}
          <span className="text-sm font-medium text-gray-200 capitalize">{status}</span>
        </div>
      </div>

      {/* Segments */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Code Segments ({segments.length})
        </h3>
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="p-3 bg-gray-800 rounded-lg border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">
                Segment {index + 1}: {segment.type}
              </span>
              <span
                className={`px-2 py-0.5 text-xs rounded ${
                  segment.confusion_score > 0.7
                    ? 'bg-red-900/50 text-red-300 border border-red-700/50'
                    : segment.confusion_score > 0.4
                    ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50'
                    : 'bg-green-900/50 text-green-300 border border-green-700/50'
                }`}
              >
                Confusion: {(segment.confusion_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Complexity: {segment.complexity.toFixed(1)} | Lines: {segment.line_start}-{segment.line_end}
            </div>
          </div>
        ))}
      </div>

      {/* AI Chat Input */}
      <div className="p-3 border-t border-gray-700/50">
        <div className="flex items-center space-x-2 bg-gray-800 rounded-lg border border-gray-700 px-3 py-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="Ask AI a question about your code..."
            className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={handleAskAI}
            className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
