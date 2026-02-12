// API 호출 커스텀 Hook (언어 자동 적용)

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Lang } from '@/types/martial'
import type { ApiResponse } from '@/types/api'

// localStorage에서 언어 가져오기 (Provider 없이도 작동)
function getLanguageFromStorage(): Lang {
  if (typeof window === 'undefined') return 'ko'
  try {
    const saved = localStorage.getItem('wwe-language') as Lang | null
    if (saved && ['ko', 'en', 'ja', 'zh'].includes(saved)) {
      return saved
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error)
  }
  return 'ko'
}

export function useApi() {
  // lazy initialization으로 첫 렌더링 시에만 localStorage 읽기
  const [lang, setLang] = useState<Lang>(() => getLanguageFromStorage())

  // 이벤트 리스너 설정
  useEffect(() => {
    // storage 이벤트 리스닝 (다른 탭에서 언어 변경 시)
    const handleStorageChange = () => {
      setLang(getLanguageFromStorage())
    }

    window.addEventListener('storage', handleStorageChange)

    // 같은 탭 내에서도 변경 감지 (custom event)
    window.addEventListener('languageChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('languageChange', handleStorageChange)
    }
  }, [])

  const fetchApi = useCallback(
    async <T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> => {
      // endpoint가 /로 시작하면 제거
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

      const response = await fetch(`/api/${lang}/${cleanEndpoint}`, {
        ...options,
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
    [lang],
  )

  return { fetchApi, lang }
}
