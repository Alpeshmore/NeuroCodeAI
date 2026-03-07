'use client'

import { Code, Search, Users, Settings, Star } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Code Analysis', href: '/', icon: Code },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-12 flex flex-col items-center py-4 bg-gray-900 border-r border-gray-700/50 space-y-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.name}
            href={item.href}
            title={item.name}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Icon className="w-5 h-5" />
          </Link>
        )
      })}

      <div className="flex-1" />

      <Link
        href="/favorites"
        title="Favorites"
        className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all duration-200"
      >
        <Star className="w-5 h-5" />
      </Link>
    </aside>
  )
}
