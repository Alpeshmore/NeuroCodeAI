'use client'

import { useState } from 'react'
import CodeEditor from '@/components/CodeEditor'
import AnalysisDashboard from '@/components/AnalysisDashboard'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import StatusBar from '@/components/StatusBar'

export default function Home() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-hidden flex">
          {/* Left Panel - Code Editor */}
          <div className="flex-1 flex flex-col min-w-0 p-2 pr-1">
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              onLanguageChange={setLanguage}
              onAnalyze={setAnalysisId}
            />
          </div>

          {/* Right Panel - AI Analysis */}
          <div className="w-80 lg:w-96 flex flex-col p-2 pl-1">
            <AnalysisDashboard analysisId={analysisId} />
          </div>
        </main>

        <StatusBar language={language} />
      </div>
    </div>
  )
}
