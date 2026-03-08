import { useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import MonacoEditor from '../components/MonacoEditor'
import ExplanationPanel from '../components/ExplanationPanel'
import InsightsPanel from '../components/InsightsPanel'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [complexityScore, setComplexityScore] = useState(null)
  const [confusionScore, setConfusionScore] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [summary, setSummary] = useState('')
  const [recommendedConcepts, setRecommendedConcepts] = useState([])

  const analyzeCode = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please enter some code first')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Analyzing your code with AI...')

    try {
      const response = await axios.post(`${API_BASE}/analyze`, {
        code,
        language,
        user_id: 'anonymous',
      }, { timeout: 30000 })

      const data = response.data

      setAnalysis(data.analysis)
      setComplexityScore(data.complexity_score)
      setConfusionScore(data.confusion_score)
      setBlocks(data.blocks || [])
      setSummary(data.summary || '')
      setRecommendedConcepts(data.recommended_concepts || [])

      toast.success(`Analysis complete! Found ${data.analysis.length} explanations.`, { id: toastId })



    } catch (error) {
      console.error('Analysis error:', error)
      const msg = error.response?.data?.detail || error.message || 'Analysis failed'
      toast.error(`Error: ${msg}`, { id: toastId })
    } finally {
      setLoading(false)
    }
  }, [code, language])

  return (
    <div className="h-screen flex flex-col bg-dark-950 overflow-hidden">
      <Navbar />

      {/* Main content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Top stats bar */}
        {analysis && !loading && (
          <div className="flex items-center gap-4 px-4 py-2 bg-dark-900/40 border-b border-neural-800/30 text-xs font-mono overflow-x-auto flex-shrink-0">
            <span className="text-slate-600 whitespace-nowrap">Analysis:</span>
            <span className="text-slate-400 whitespace-nowrap">
              <span className="text-neural-400">{analysis.length}</span> lines
            </span>
            <span className="text-slate-600">|</span>
            <span className="whitespace-nowrap">
              Confusion:{' '}
              <span className={confusionScore > 6 ? 'text-red-400' : confusionScore > 3 ? 'text-amber-400' : 'text-emerald-400'}>
                {confusionScore}/10
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="whitespace-nowrap">
              Complexity:{' '}
              <span className={complexityScore > 6 ? 'text-red-400' : complexityScore > 3 ? 'text-amber-400' : 'text-neural-400'}>
                {complexityScore}/10
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="whitespace-nowrap text-red-400">
              {analysis.filter(a => a.confusion_hotspot).length} hotspots
            </span>
            {summary && (
              <>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 truncate max-w-xs">{summary}</span>
              </>
            )}
          </div>
        )}

        {/* 3-panel grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[2fr_1.8fr_1.4fr] gap-0">
          {/* Left: Editor */}
          <div className="panel rounded-none lg:rounded-tl-none border-r border-neural-800/30 flex flex-col min-h-0 border-0 border-b lg:border-b-0">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-sm font-semibold text-slate-200 ml-1">Code Editor</span>
                <span className="text-xs text-slate-600 font-mono capitalize">{language}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-neural-600 animate-pulse-slow" />
                <span className="font-mono">neurocode-ai</span>
              </div>
            </div>

            <div className="flex-1 min-h-0 h-[400px] lg:h-auto">
              <MonacoEditor
                code={code}
                language={language}
                onCodeChange={setCode}
                onLanguageChange={setLanguage}
                onAnalyze={analyzeCode}
                loading={loading}
                analysisData={analysis}
              />
            </div>
          </div>

          {/* Center: Explanation */}
          <div className="panel rounded-none border-r border-neural-800/30 flex flex-col min-h-0 border-0 border-b lg:border-b-0 h-[400px] lg:h-auto overflow-hidden">
            <ExplanationPanel
              analysis={analysis}
              loading={loading}
              summary={summary}
            />
          </div>

          {/* Right: Insights */}
          <div className="panel rounded-none flex flex-col min-h-0 border-0 h-[400px] lg:h-auto overflow-hidden">
            <InsightsPanel
              analysis={analysis}
              complexityScore={complexityScore}
              confusionScore={confusionScore}
              blocks={blocks}
              recommendedConcepts={recommendedConcepts}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
