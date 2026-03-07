import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'NeuroCode AI - Confusion-Aware Code Intelligence',
  description: 'AI-powered platform for learning and understanding code through adaptive explanations',
  keywords: ['AI', 'code analysis', 'learning', 'education', 'developer tools'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
