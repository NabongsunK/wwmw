'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NAV_ITEMS } from '@/types/nav'
import { ThemeToggle } from './ui/theme/themeToggle'
import { LanguageSwitcher } from './LanguageSwitcherSafe'

export function Header() {
  const pathname = usePathname()
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
            <span className="text-xl font-semibold tracking-wide font-soonbatang">위무위</span>
            {/* <span className="text-xs text-muted-foreground">WWE</span> */}
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                // TODO: 나중에 메인페이지 변경 시 수정해줘야함. 26.03.07 - 김무겸
                className={`
                  relative hover:text-foreground transition
                  ${item.href === pathname ? 'text-foreground' : pathname === '/' && item.label === '심법 뽑기' ? 'text-foreground' : 'text-muted-foreground'}
                `}
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
