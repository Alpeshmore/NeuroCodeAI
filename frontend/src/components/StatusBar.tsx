'use client'

import { GitBranch, AlertCircle, AlertTriangle } from 'lucide-react'

interface StatusBarProps {
  language: string
  line?: number
  col?: number
}

const LANGUAGE_VERSIONS: Record<string, string> = {
  python: 'PYTHON 3.10.X',
  javascript: 'JAVASCRIPT ES2022',
  typescript: 'TYPESCRIPT 5.3',
  java: 'JAVA 17',
  cpp: 'C++ 20',
}

export default function StatusBar({ language, line = 1, col = 1 }: StatusBarProps) {
  return (
    <footer className="flex items-center justify-between px-4 py-1 bg-gray-800 border-t border-gray-700/50 text-xs">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 bg-green-600/20 text-green-400 px-2 py-0.5 rounded">
          <GitBranch className="w-3 h-3" />
          <span className="font-semibold">MAIN*</span>
        </div>
        <div className="flex items-center space-x-1 text-green-400">
          <AlertCircle className="w-3 h-3" />
          <span>0 ERRORS</span>
        </div>
        <div className="flex items-center space-x-1 text-green-400">
          <AlertTriangle className="w-3 h-3" />
          <span>0 WARNINGS</span>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-gray-400">
        <span>UTF-8</span>
        <span>{LANGUAGE_VERSIONS[language] || language.toUpperCase()}</span>
        <span>LN {line}, COL {col}</span>
      </div>
    </footer>
  )
}
