'use client'

import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Save, Download, ChevronDown, X, Clipboard, Upload, Code2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { analyzeCode } from '@/lib/api'
import toast from 'react-hot-toast'

interface CodeEditorProps {
  code: string
  language: string
  onChange: (code: string) => void
  onLanguageChange: (language: string) => void
  onAnalyze: (analysisId: string) => void
}

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
]

interface FileTab {
  name: string
  content: string
  language: string
}

export default function CodeEditor({
  code,
  language,
  onChange,
  onLanguageChange,
  onAnalyze,
}: CodeEditorProps) {
  const { theme } = useTheme()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeView, setActiveView] = useState<'editor' | 'diff'>('editor')
  const [tabs, setTabs] = useState<FileTab[]>([
    { name: 'main.py', content: '', language: 'python' },
    { name: 'utils.py', content: '', language: 'python' },
  ])
  const [activeTab, setActiveTab] = useState(0)
  const [hasCode, setHasCode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeCode(code, language)
      onAnalyze(result.data?.analysis_id)
      toast.success('🎉 Code analysis started!')
    } catch (error) {
      toast.error('❌ Failed to analyze code. Check that the backend is running.')
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handlePasteSnippet = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        onChange(text)
        setHasCode(true)
        toast.success('📋 Code pasted from clipboard!')
      } else {
        toast('📋 Clipboard is empty. Type or paste code manually.', { icon: 'ℹ️' })
        setHasCode(true)
      }
    } catch {
      // Clipboard API may not be available, just show the editor
      setHasCode(true)
      toast('📝 Editor ready — paste your code with Ctrl+V', { icon: 'ℹ️' })
    }
  }

  const handleUploadFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      onChange(content)
      setHasCode(true)

      // Update the active tab name to the uploaded file name
      const newTabs = [...tabs]
      newTabs[activeTab] = { ...newTabs[activeTab], name: file.name, content }
      setTabs(newTabs)

      // Auto-detect language from extension
      const ext = file.name.split('.').pop()?.toLowerCase()
      const langMap: Record<string, string> = {
        py: 'python', js: 'javascript', ts: 'typescript',
        java: 'java', cpp: 'cpp', c: 'cpp',
      }
      if (ext && langMap[ext]) {
        onLanguageChange(langMap[ext])
      }

      toast.success(`📁 Loaded ${file.name}`)
    }
    reader.readAsText(file)
    // Reset input so same file can be re-uploaded
    e.target.value = ''
  }

  const handleSaveFile = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = tabs[activeTab]?.name || 'code.py'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('💾 File saved!')
  }

  const handleDownloadFile = () => {
    handleSaveFile()
  }

  const handleCloseTab = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length <= 1) return
    const newTabs = tabs.filter((_, i) => i !== index)
    setTabs(newTabs)
    if (activeTab >= newTabs.length) {
      setActiveTab(newTabs.length - 1)
    }
  }

  const handleTabClick = (index: number) => {
    setActiveTab(index)
    onChange(tabs[index].content)
  }

  const showEmptyState = !hasCode && !code.trim()

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700/50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".py,.js,.ts,.java,.cpp,.c,.txt,.jsx,.tsx"
        onChange={handleFileChange}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700/50">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="w-px h-5 bg-gray-600 mx-1" />

          <button
            onClick={handleSaveFile}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200"
            title="Save file"
          >
            <Save className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadFile}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setActiveView('editor')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeView === 'editor'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              EDITOR
            </button>
            <button
              onClick={() => setActiveView('diff')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeView === 'diff'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              DIFF
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !hasCode}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg font-semibold text-sm text-white transition-all ${
              isAnalyzing || !hasCode
                ? 'bg-blue-600/50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" fill="currentColor" />
                <span>Analyze Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex items-center bg-gray-850 border-b border-gray-700/50 px-2" style={{ backgroundColor: '#1a1f2e' }}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === index
                ? 'border-blue-500 text-gray-200 bg-gray-800/50'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{tab.name}</span>
            {activeTab === index && tabs.length > 1 && (
              <X
                className="w-3 h-3 text-gray-500 hover:text-gray-200 cursor-pointer"
                onClick={(e) => handleCloseTab(index, e)}
              />
            )}
          </button>
        ))}
      </div>

      {/* Editor / Empty State */}
      <div className="flex-1 relative">
        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 border-2 border-blue-500/30 flex items-center justify-center mb-6">
              <Code2 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Code Submitted</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-sm">
              Paste your Python code here or upload a file to start the intelligent AI analysis.
            </p>
            <div className="flex flex-col space-y-3 w-full max-w-sm">
              <button
                onClick={handlePasteSnippet}
                className="flex items-center justify-center space-x-2 w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors border border-gray-600"
              >
                <Clipboard className="w-4 h-4" />
                <span>Paste Snippet</span>
              </button>
              <button
                onClick={handleUploadFile}
                className="flex items-center justify-center space-x-2 w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors border border-gray-600"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Source File</span>
              </button>
            </div>
          </div>
        ) : (
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => {
              onChange(value || '')
              if (value && value.trim()) setHasCode(true)
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        )}
      </div>
    </div>
  )
}
