// 언어 전환 컴포넌트
'use client'

import dynamic from 'next/dynamic'
import type { Lang } from '@/types/base'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/app/providers/LanguageProvider'

const LANGUAGES = [
  { code: 'ko' as Lang, label: '한국어', flag: '🇰🇷', short: 'KO' },
  { code: 'en' as Lang, label: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'ja' as Lang, label: '日本語', flag: '🇯🇵', short: 'JA' },
  { code: 'zh' as Lang, label: '中文', flag: '🇨🇳', short: 'ZH' },
]

function LanguageSwitcherInner() {
  const { lang, setLang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (!isOpen) return undefined
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative h-9 w-9 rounded-full
          border border-border
          bg-surface
          transition
          hover:ring-1 hover:ring-accent/40
          flex items-center justify-center
          text-xs font-medium
        "
        aria-label="언어 선택"
      >
        {currentLanguage.short}
      </button>

      {isOpen && (
        <div
          className="
            absolute right-0 mt-2
            w-40
            rounded-lg
            border border-border
            bg-surface
            shadow-lg
            overflow-hidden
            z-50
          "
        >
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLang(language.code)
                setIsOpen(false)
              }}
              className={`
                w-full px-4 py-2.5
                flex items-center gap-3
                text-sm
                transition
                ${
                  lang === language.code
                    ? 'bg-accent/10 text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/5'
                }
              `}
            >
              <span className="text-base">{language.flag}</span>
              <span>{language.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const LanguageSwitcher = dynamic(() => Promise.resolve(LanguageSwitcherInner), {
  ssr: false,
  // Skeleton UI
  loading: () => <div className="h-9 w-9 rounded-full border border-border bg-surface" />,
})
