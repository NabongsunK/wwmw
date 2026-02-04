'use client'
import { Header } from './Header'
import { Footer } from './Footer'
import { ThemeProvider } from 'next-themes'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-6">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
