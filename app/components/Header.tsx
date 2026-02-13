'use client'

import Link from 'next/link'
import { ThemeToggle } from './ui/theme/themeToggle'
import { LanguageSwitcher } from './LanguageSwitcherSafe'
import { NAV_ITEMS } from '@/types/nav'

export function Header() {
  return (
    <header
      className="
      sticky top-0 z-50
      bg-surface/85
      border-b border-border/40
      backdrop-blur-md
    "
    >
      <div className="container flex h-16 items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-wide">연운</span>
            {/* <span className="text-xs text-muted-foreground">WWE</span> */}
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="
                  relative text-muted-foreground
                  hover:text-foreground transition
                "
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 설정 */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
