// 언어 전환 컴포넌트

'use client'

import { useLanguage } from '@/app/providers/LanguageProvider'
import { useState, useEffect, useRef } from 'react'
import type { Lang } from '@/types/martial'

const LANGUAGES = [
  { code: 'ko' as Lang, label: '한국어', flag: '🇰🇷', short: 'KO' },
  { code: 'en' as Lang, label: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'ja' as Lang, label: '日本語', flag: '🇯🇵', short: 'JA' },
  { code: 'zh' as Lang, label: '中文', flag: '🇨🇳', short: 'ZH' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full border border-border bg-surface" />
  }

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

// 버튼 스타일 버전 (기존 버전 유지)
export function LanguageSwitcherButtons() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex gap-2">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          onClick={() => setLang(language.code)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            lang === language.code
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {language.flag} {language.label}
        </button>
      ))}
    </div>
  )
}
