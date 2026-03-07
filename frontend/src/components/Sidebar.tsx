'use client'

import { Code, Brain, TrendingUp, History, BookOpen, BarChart3, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Code Analysis', href: '/', icon: Code, color: 'from-blue-500 to-cyan-500' },
  { name: 'Learning Progress', href: '/progress', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { name: 'Confusion Insights', href: '/insights', icon: Brain, color: 'from-purple-500 to-pink-500' },
  { name: 'History', href: '/history', icon: History, color: 'from-orange-500 to-red-500' },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen, color: 'from-indigo-500 to-blue-500' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'from-yellow-500 to-orange-500' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 glass border-r border-gray-200/50 dark:border-gray-700/50">
      <nav className="flex flex-col h-full p-6 space-y-2">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Navigation
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            AI-powered code intelligence
          </p>
        </motion.div>

        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-102'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full bg-white"
                  />
                )}
              </Link>
            </motion.div>
          )
        })}

        <div className="flex-1" />

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="card p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              💡 Pro Tip
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Use keyboard shortcuts for faster navigation
            </p>
          </div>
        </motion.div>
      </nav>
    </aside>
  )
}
