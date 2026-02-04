'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full border border-border bg-surface" />
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="
        relative h-9 w-9 rounded-full
        border border-border
        bg-surface
        transition
        hover:ring-1 hover:ring-accent/40
        flex items-center justify-center
      "
      aria-label="Toggle theme"
    >
      <span
        className={`
          h-3 w-3 rounded-full
          transition-all
          ${
            isDark
              ? 'bg-foreground/70 scale-90'
              : 'bg-accent scale-100 shadow-[0_0_6px_rgb(var(--accent)/0.6)]'
          }
        `}
      />
    </button>
  )
}
