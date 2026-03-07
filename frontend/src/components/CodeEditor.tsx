'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Upload, Download, Code2, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
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
  { value: 'python', label: '🐍 Python', color: 'from-blue-500 to-yellow-500' },
  { value: 'javascript', label: '⚡ JavaScript', color: 'from-yellow-400 to-yellow-600' },
  { value: 'typescript', label: '💙 TypeScript', color: 'from-blue-600 to-blue-800' },
  { value: 'java', label: '☕ Java', color: 'from-red-600 to-orange-600' },
  { value: 'cpp', label: '⚙️ C++', color: 'from-blue-700 to-purple-700' },
]

export default function CodeEditor({
  code,
  language,
  onChange,
  onLanguageChange,
  onAnalyze,
}: CodeEditorProps) {
  const { theme } = useTheme()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
      toast.error('❌ Failed to analyze code')
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const currentLang = LANGUAGES.find(l => l.value === language)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full card overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Code Editor</h3>
          </div>
          
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
            title="Upload file"
          >
            <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
            title="Download file"
          >
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all ${
              isAnalyzing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r ' + (currentLang?.color || 'from-blue-600 to-purple-600') + ' hover:scale-105'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="spinner border-white border-t-transparent" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze Code</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => onChange(value || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </motion.div>
  )
}
