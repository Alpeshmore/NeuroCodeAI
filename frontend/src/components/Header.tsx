'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, User, Settings } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="bg-gray-900 border-b border-gray-700/50 px-4 py-2.5 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-white">
              NeuroCode AI
            </h1>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Workspace
            </Link>
            <Link href="/projects" className="text-sm text-gray-400 hover:text-gray-300 font-medium transition-colors">
              Projects
            </Link>
            <Link href="/history" className="text-sm text-gray-400 hover:text-gray-300 font-medium transition-colors">
              History
            </Link>
            <Link href="/docs" className="text-sm text-gray-400 hover:text-gray-300 font-medium transition-colors">
              Documentation
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 text-xs font-bold bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">
            ENTERPRISE
          </span>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </button>
          )}

          <button
            className="p-2 rounded-lg hover:bg-gray-800 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>

          <button
            className="p-1 rounded-lg hover:bg-gray-800 transition-all"
            aria-label="User profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
