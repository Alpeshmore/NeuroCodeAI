import { useState } from 'react'
import toast from 'react-hot-toast'

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    classes: 'difficulty-easy',
    dot: 'bg-emerald-400',
    ring: 'ring-emerald-500/30',
  },
  medium: {
    label: 'Medium',
    classes: 'difficulty-medium',
    dot: 'bg-amber-400',
    ring: 'ring-amber-500/30',
  },
  hard: {
    label: 'Hard',
    classes: 'difficulty-hard',
    dot: 'bg-red-400',
    ring: 'ring-red-500/30',
  },
}

function SkeletonLine({ width = 'w-full' }) {
  return (
    <div className={`h-4 ${width} rounded bg-neural-900/60 shimmer-effect overflow-hidden`} />
  )
}

function LoadingState() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="p-4 rounded-xl bg-dark-900/40 border border-neural-800/30 space-y-2">
          <div className="flex items-center gap-3">
            <SkeletonLine width="w-16" />
            <SkeletonLine width="w-48" />
            <SkeletonLine width="w-16" />
          </div>
          <SkeletonLine width="w-full" />
          <SkeletonLine width="w-3/4" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neural-900/60 border border-neural-700/30 flex items-center justify-center animate-float">
        <svg className="w-8 h-8 text-neural-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-slate-300 font-medium mb-1">No Analysis Yet</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Paste your code in the editor and click <span className="text-neural-400 font-medium">Analyze</span> to get AI-powered explanations.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {['Line-by-line breakdown', 'Confusion detection', 'Concept mapping'].map(f => (
          <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-neural-900/40 border border-neural-800/40 text-neural-400">
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ExplanationPanel({ analysis, loading, summary }) {
  const [expanded, setExpanded] = useState({})
  const [filter, setFilter] = useState('all')
  const [hoveredLine, setHoveredLine] = useState(null)

  const handleCopyAll = () => {
    if (!analysis?.length) return
    const text = analysis.map(item =>
      `Line ${item.line}: ${item.code.trim()}\n→ ${item.explanation}\n[${item.difficulty.toUpperCase()}]${item.confusion_hotspot ? ' ⚠ CONFUSION HOTSPOT' : ''}`
    ).join('\n\n')

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Explanation copied to clipboard!')
    })
  }

  const handleExportJSON = () => {
    if (!analysis?.length) return
    const blob = new Blob([JSON.stringify({ summary, analysis }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'neurocode-analysis.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Analysis exported!')
  }

  const toggleLine = (lineNum) => {
    setExpanded(prev => ({ ...prev, [lineNum]: !prev[lineNum] }))
  }

  const filtered = analysis?.filter(item => {
    if (filter === 'confused') return item.confusion_hotspot
    if (filter === 'hard') return item.difficulty === 'hard'
    if (filter === 'medium') return item.difficulty === 'medium' || item.difficulty === 'hard'
    return true
  }) ?? []

  const hotspotCount = analysis?.filter(a => a.confusion_hotspot).length ?? 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neural-400 animate-pulse" />
          <span className="text-sm font-semibold text-slate-200">AI Explanation</span>
          {analysis?.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-neural-900/60 border border-neural-700/40 text-neural-400 font-mono">
              {analysis.length} lines
            </span>
          )}
          {hotspotCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 border border-red-700/40 text-red-400">
              {hotspotCount} ⚠
            </span>
          )}
        </div>

        {analysis?.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyAll}
              className="text-xs text-slate-500 hover:text-neural-400 px-2 py-1 rounded hover:bg-neural-900/30 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button
              onClick={handleExportJSON}
              className="text-xs text-slate-500 hover:text-neural-400 px-2 py-1 rounded hover:bg-neural-900/30 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              JSON
            </button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      {analysis?.length > 0 && (
        <div className="flex gap-1 px-4 py-2 bg-dark-900/20 border-b border-neural-800/30">
          {[
            { key: 'all', label: 'All' },
            { key: 'confused', label: `Confusing (${hotspotCount})` },
            { key: 'hard', label: 'Hard' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                filter === tab.key
                  ? 'bg-neural-600/50 text-white border border-neural-500/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      {summary && !loading && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-neural-900/30 border border-neural-700/30">
          <div className="flex items-start gap-2">
            <div className="w-1 h-full min-h-[20px] rounded-full bg-gradient-to-b from-neural-400 to-neural-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-neural-400 uppercase tracking-wider">Summary</span>
              <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">{summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState />
        ) : !analysis?.length ? (
          <EmptyState />
        ) : (
          <div className="p-3 space-y-2">
            {filtered.map((item) => {
              const diffConfig = DIFFICULTY_CONFIG[item.difficulty] || DIFFICULTY_CONFIG.easy
              const isExpanded = expanded[item.line]
              const isHovered = hoveredLine === item.line

              return (
                <div
                  key={item.line}
                  className={`rounded-xl border transition-all duration-200 cursor-pointer group ${
                    item.confusion_hotspot
                      ? 'border-red-700/40 bg-red-950/20 hover:bg-red-950/30'
                      : 'border-neural-800/30 bg-dark-900/30 hover:bg-dark-800/40 hover:border-neural-700/40'
                  }`}
                  onClick={() => toggleLine(item.line)}
                  onMouseEnter={() => setHoveredLine(item.line)}
                  onMouseLeave={() => setHoveredLine(null)}
                >
                  {/* Line header */}
                  <div className="flex items-start gap-3 p-3">
                    {/* Line number */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-neural-900/50 border border-neural-800/40">
                      <span className="text-xs font-mono text-neural-500">{item.line}</span>
                    </div>

                    {/* Code snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs font-mono text-slate-300 bg-dark-950/60 px-2 py-0.5 rounded border border-neural-900/50 truncate max-w-[200px]">
                          {item.code.trim()}
                        </code>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffConfig.classes}`}>
                          {diffConfig.label}
                        </span>
                        {item.confusion_hotspot && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 border border-red-700/40 text-red-400">
                            ⚠ Hotspot
                          </span>
                        )}
                        {item.block_type && item.block_type !== 'statement' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/30 border border-purple-700/30 text-purple-400">
                            {item.block_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <p className={`text-sm text-slate-300 mt-1.5 leading-relaxed transition-all ${
                        isExpanded ? '' : 'line-clamp-2'
                      }`}>
                        {item.explanation}
                      </p>

                      {/* Concepts */}
                      {item.concepts?.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {item.concepts.map(c => (
                            <span key={c} className="text-xs px-2 py-0.5 rounded-md bg-neural-900/40 border border-neural-800/30 text-neural-400">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Expand toggle */}
                    <div className={`flex-shrink-0 w-5 h-5 flex items-center justify-center text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                No lines match this filter
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
