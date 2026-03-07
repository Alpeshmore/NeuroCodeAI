'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { ThemeProvider } from 'next-themes'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '@/lib/apollo'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </ApolloProvider>
    </Provider>
  )
}
