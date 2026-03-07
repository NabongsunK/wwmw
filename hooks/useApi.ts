// API 호출 커스텀 Hook (언어는 쿠키로 전달, 미들웨어가 검증)

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Lang } from '@/types/martial'
import type { ApiResponse } from '@/types/api'
import { getLangCookie } from '@/lib/lang-cookie-client'

function getLanguageFromStorage(): Lang {
  if (typeof window === 'undefined') return 'ko'
  try {
    const fromCookie = getLangCookie()
    if (fromCookie && ['ko', 'en', 'ja', 'zh'].includes(fromCookie)) return fromCookie as Lang
    const saved = localStorage.getItem('wwe-language') as Lang | null
    if (saved && ['ko', 'en', 'ja', 'zh'].includes(saved)) return saved
  } catch (error) {
    console.warn('Failed to read language:', error)
  }
  return 'ko'
}

export function useApi() {
  const [lang, setLang] = useState<Lang>(() => getLanguageFromStorage())

  useEffect(() => {
    const handleChange = () => setLang(getLanguageFromStorage())
    window.addEventListener('storage', handleChange)
    window.addEventListener('languageChange', handleChange)
    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener('languageChange', handleChange)
    }
  }, [])

  const fetchApi = useCallback(
    async <T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> => {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
      // lang은 쿠키로 전송 (같은 도메인 요청 시 자동 포함)
      const response = await fetch(`/api/${cleanEndpoint}`, {
        ...options,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'API 요청 실패')
      }

      return response.json()
    },
    [lang], // lang 바뀌면 fetchApi 참조 변경 → 이걸 쓰는 useEffect가 다시 실행되어 새 언어로 재요청
  )

  return { fetchApi, lang }
}
