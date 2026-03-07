'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import CodeEditor from '@/components/CodeEditor'
import AnalysisDashboard from '@/components/AnalysisDashboard'
import ConfusionHeatmap from '@/components/ConfusionHeatmap'
import ExplanationPanel from '@/components/ExplanationPanel'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  const [code, setCode] = useState(`# Welcome to NeuroCode AI! 🚀
# Paste your code here and click "Analyze Code" to get started

def fibonacci(n):
    """Calculate Fibonacci number recursively"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(10)
print(f"Fibonacci(10) = {result}")`)
  const [language, setLanguage] = useState('python')
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Code Editor */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col space-y-6"
            >
              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
                onLanguageChange={setLanguage}
                onAnalyze={setAnalysisId}
              />
              
              <ConfusionHeatmap analysisId={analysisId} />
            </motion.div>

            {/* Right Panel - Analysis & Explanations */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col space-y-6 overflow-y-auto custom-scrollbar"
            >
              <AnalysisDashboard analysisId={analysisId} />
              
              <ExplanationPanel analysisId={analysisId} />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
