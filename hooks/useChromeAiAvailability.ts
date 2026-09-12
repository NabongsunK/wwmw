'use client'

import { useCallback, useEffect, useState } from 'react'
import { readAllChromeAiStatuses } from '@/lib/chrome-ai'
import type { ChromeAiApiName, ChromeAiApiStatus } from '@/types/chrome-ai'

export function useChromeAiAvailability() {
  const [statuses, setStatuses] = useState<ChromeAiApiStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await readAllChromeAiStatuses()
      setStatuses(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API 상태를 확인하지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const getStatus = useCallback(
    (name: ChromeAiApiName) => statuses.find((item) => item.name === name),
    [statuses],
  )

  return { statuses, loading, error, refresh, getStatus }
}
