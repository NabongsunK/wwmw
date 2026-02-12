// 언어 관리 Context Provider

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Lang } from '@/types/martial'
import { SUPPORTED_LANGS } from '@/lib/lang-validator'

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ko')
  const [mounted, setMounted] = useState(false)

  // 초기 로드 시 localStorage에서 언어 설정 가져오기
  useEffect(() => {
    setTimeout(() => {
      setMounted(true)
    }, 0)
    const savedLang = localStorage.getItem('wwe-language') as Lang | null
    if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
      setTimeout(() => {
        setLang(savedLang)
      }, 0)
    }
  }, [])

  // 언어 변경 시 localStorage에 저장
  const handleSetLang = (newLang: Lang) => {
    setLang(newLang)
    if (mounted) {
      localStorage.setItem('wwe-language', newLang)
      // custom event 발생 (같은 탭 내에서 감지)
      window.dispatchEvent(new Event('languageChange'))
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom Hook
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
