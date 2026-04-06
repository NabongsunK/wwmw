// 언어 + uid 관리 Context Provider (진입 시 lang/uid 쿠키 초기화)

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Lang } from '@/types/base'
import { SUPPORTED_LANGS } from '@/lib/lang-validator'
import { setLangCookie, getLangCookie } from '@/lib/lang-cookie-client'
import { getUidCookie, setUidCookie } from '@/lib/uid-cookie-client'

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ko')
  const [mounted, setMounted] = useState(false)

  // 초기 로드: lang 쿠키/스토리지 동기화 + uid 쿠키 없으면 발급
  useEffect(() => {
    // 1) 언어: 쿠키 우선 → localStorage → state 반영 후 쿠키 동기화
    const fromCookie = getLangCookie()
    const fromStorage = localStorage.getItem('wwe-language') as Lang | null
    const savedLang = (
      fromCookie && SUPPORTED_LANGS.includes(fromCookie as Lang)
        ? fromCookie
        : fromStorage && SUPPORTED_LANGS.includes(fromStorage)
          ? fromStorage
          : null
    ) as Lang | null

    if (savedLang) {
      setTimeout(() => {
        setLang(savedLang)
      }, 0)
      setLangCookie(savedLang)
      if (savedLang !== fromStorage) localStorage.setItem('wwe-language', savedLang)
    } else {
      setLangCookie('ko')
    }

    // 2) uid: 쿠키 없으면 발급받아 저장
    if (!getUidCookie()) {
      fetch('/api/uid', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => res.json())
        .then((body: { success?: boolean; data?: { uid?: string } }) => {
          if (body.success && body.data?.uid) setUidCookie(body.data.uid)
        })
        .catch((err) => console.warn('Failed to issue uid:', err))
    }

    setTimeout(() => {
      setMounted(true)
    }, 0)
  }, [])

  // 언어 변경 시 localStorage + 쿠키 동시 저장 (API는 쿠키로 lang 전달)
  const handleSetLang = (newLang: Lang) => {
    setLang(newLang)
    if (mounted) {
      localStorage.setItem('wwe-language', newLang)
      setLangCookie(newLang)
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
