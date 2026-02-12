// 모든 Provider 통합

'use client'

import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from './LanguageProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        {children}
      </ThemeProvider>
    </LanguageProvider>
  )
}
