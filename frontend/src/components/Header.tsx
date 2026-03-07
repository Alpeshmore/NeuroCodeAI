'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, User, Settings, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="glass border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute -bottom-1 -right-1" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">
              NeuroCode AI
            </h1>
          </div>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg"
          >
            ENTERPRISE
          </motion.span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
            aria-label="User profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </header>
  )
}
