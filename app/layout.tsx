import type { Metadata } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Layout } from './components/Layout'
import { Providers } from './providers/Providers'

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// })

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// })

export const metadata: Metadata = {
  title: 'WWMW - 연운 도구',
  description: 'WWMW - 심법뽑기, 스무고개족보',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  )
}
