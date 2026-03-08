import { useState } from 'react'

function ScoreRing({ score, max = 10, color, label, icon }) {
  const pct = (score / max) * 100
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - pct / 100)

  const colorMap = {
    blue: { stroke: '#6366f1', text: 'text-neural-400', bg: 'from-neural-900/40 to-neural-800/20' },
    red: { stroke: '#ef4444', text: 'text-red-400', bg: 'from-red-900/30 to-red-800/10' },
    green: { stroke: '#10b981', text: 'text-emerald-400', bg: 'from-emerald-900/30 to-emerald-800/10' },
    amber: { stroke: '#f59e0b', text: 'text-amber-400', bg: 'from-amber-900/30 to-amber-800/10' },
  }

  const cfg = colorMap[color] || colorMap.blue

  return (
    <div className={`flex flex-col items-center p-4 rounded-xl bg-gradient-to-br ${cfg.bg} border border-white/5`}>
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          {/* Background track */}
          <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          {/* Progress */}
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={cfg.stroke}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold font-mono ${cfg.text}`}>{score}</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="text-lg">{icon}</div>
        <div className="text-xs font-medium text-slate-300 mt-0.5">{label}</div>
        <div className="text-xs text-slate-500">/ {max}</div>
      </div>
    </div>
  )
}

function HotspotBar({ analysis }) {
  if (!analysis?.length) return null

  const hotspots = analysis.filter(a => a.confusion_hotspot)
  if (!hotspots.length) return null

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <span className="text-red-400">⚠</span> Confusion Hotspots
      </h4>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {hotspots.map(item => (
          <div key={item.line} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-950/20 border border-red-800/30">
            <span className="font-mono text-xs text-red-400 flex-shrink-0 mt-0.5">L{item.line}</span>
            <div className="min-w-0 flex-1">
              <code className="text-xs text-red-300/80 block truncate">{item.code.trim()}</code>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DifficultyBreakdown({ analysis }) {
  if (!analysis?.length) return null

  const counts = analysis.reduce((acc, item) => {
    acc[item.difficulty] = (acc[item.difficulty] || 0) + 1
    return acc
  }, {})

  const total = analysis.length
  const bars = [
    { key: 'easy', label: 'Easy', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { key: 'medium', label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-400' },
    { key: 'hard', label: 'Hard', color: 'bg-red-500', textColor: 'text-red-400' },
  ]

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty Breakdown</h4>
      <div className="space-y-2">
        {bars.map(bar => {
          const count = counts[bar.key] || 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={bar.key} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className={bar.textColor}>{bar.label}</span>
                <span className="text-slate-500 font-mono">{count} lines</span>
              </div>
              <div className="h-1.5 rounded-full bg-dark-800/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${bar.color} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConceptCards({ concepts }) {
  if (!concepts?.length) return null

  const CONCEPT_ICONS = {
    'Loops': '🔄',
    'Loops & Iteration': '🔄',
    'Iteration': '🔄',
    'Functions': '⚡',
    'Functions & Scope': '⚡',
    'Recursion': '🌀',
    'Object-Oriented Programming': '📦',
    'Classes': '📦',
    'OOP': '📦',
    'List Comprehensions': '📋',
    'Lambda Functions': 'λ',
    'Error Handling': '🛡️',
    'Async Programming': '⏳',
    'Generators': '🔧',
    'Conditionals': '🔀',
    'Variables': '📌',
    'Imports': '📥',
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <span>📚</span> Recommended to Study
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {concepts.map(concept => (
          <div
            key={concept}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-neural-900/30 border border-neural-800/30 hover:border-neural-600/40 transition-colors group"
          >
            <span className="text-base">{CONCEPT_ICONS[concept] || '📖'}</span>
            <span className="text-xs text-slate-300 group-hover:text-white transition-colors leading-tight">
              {concept}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlockTree({ blocks }) {
  if (!blocks?.length) return null

  const TYPE_COLORS = {
    function: 'text-yellow-400',
    recursive_function: 'text-purple-400',
    class: 'text-cyan-400',
    for_loop: 'text-emerald-400',
    while_loop: 'text-emerald-300',
    conditional: 'text-blue-400',
    try_except: 'text-orange-400',
  }

  const TYPE_ICONS = {
    function: '⚡',
    recursive_function: '🌀',
    class: '📦',
    for_loop: '🔄',
    while_loop: '↩️',
    conditional: '🔀',
    try_except: '🛡️',
  }

  const topLevel = blocks.filter(b => b.type !== 'statement').slice(0, 8)
  if (!topLevel.length) return null

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <span>🏗️</span> Code Structure
      </h4>
      <div className="space-y-1.5">
        {topLevel.map((block, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-dark-800/40 border border-neural-900/30 group hover:border-neural-700/30 transition-colors">
            <span className="text-sm">{TYPE_ICONS[block.type] || '📝'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${TYPE_COLORS[block.type] || 'text-slate-300'}`}>
                  {block.name || block.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-600 font-mono">L{block.start_line}–{block.end_line}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(block.complexity, 5) }, (_, i) => (
                <div key={i} className={`w-1 h-3 rounded-sm ${
                  block.complexity <= 2 ? 'bg-emerald-500' :
                  block.complexity <= 4 ? 'bg-amber-500' : 'bg-red-500'
                } opacity-${60 + i * 10}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyInsights() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-neural-900/40 border border-neural-700/20 flex items-center justify-center animate-float">
        <span className="text-2xl">🧠</span>
      </div>
      <div>
        <h3 className="text-slate-300 font-medium text-sm mb-1">Learning Insights</h3>
        <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
          Analyze code to see confusion scores, complexity metrics, and concept recommendations.
        </p>
      </div>
    </div>
  )
}

export default function InsightsPanel({ analysis, complexityScore, confusionScore, blocks, recommendedConcepts, loading }) {
  const hasData = analysis?.length > 0

  const getScoreLabel = (score) => {
    if (score <= 3) return 'Low'
    if (score <= 6) return 'Medium'
    return 'High'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-sm font-semibold text-slate-200">Learning Insights</span>
        </div>
        {hasData && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/30 text-purple-400">
            {analysis.length} analyzed
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-neural-500/20 animate-ping" />
              <div className="absolute inset-1 rounded-full border-2 border-t-neural-400 animate-spin" />
            </div>
            <span className="text-slate-500 text-xs animate-pulse">Computing insights...</span>
          </div>
        ) : !hasData ? (
          <EmptyInsights />
        ) : (
          <div className="p-4 space-y-5">
            {/* Score meters */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <ScoreRing
                  score={confusionScore}
                  color={confusionScore > 6 ? 'red' : confusionScore > 3 ? 'amber' : 'green'}
                  label="Confusion"
                  icon="🌀"
                />
                <ScoreRing
                  score={complexityScore}
                  color={complexityScore > 6 ? 'red' : complexityScore > 3 ? 'amber' : 'blue'}
                  label="Complexity"
                  icon="⚡"
                />
              </div>

              {/* Score interpretation */}
              <div className="p-3 rounded-xl bg-dark-800/40 border border-neural-800/20 text-xs text-slate-400 leading-relaxed">
                {confusionScore > 6
                  ? '🔴 High confusion detected — several advanced patterns may be difficult to follow. Review hotspots.'
                  : confusionScore > 3
                  ? '🟡 Moderate complexity — some sections may need extra attention.'
                  : '🟢 Code is relatively easy to follow. Great for learning!'}
              </div>
            </div>

            <div className="h-px bg-neural-800/30" />
            <DifficultyBreakdown analysis={analysis} />

            {blocks?.length > 0 && (
              <>
                <div className="h-px bg-neural-800/30" />
                <BlockTree blocks={blocks} />
              </>
            )}

            {analysis.some(a => a.confusion_hotspot) && (
              <>
                <div className="h-px bg-neural-800/30" />
                <HotspotBar analysis={analysis} />
              </>
            )}

            {recommendedConcepts?.length > 0 && (
              <>
                <div className="h-px bg-neural-800/30" />
                <ConceptCards concepts={recommendedConcepts} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
