'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ApiResponse } from '@/types/api'
import type { ArchiPuzzleRankingEntry } from '@/types/archi-puzzle'

export function usePuzzleRanking(puzzleId: string, refreshKey = 0) {
  const [entries, setEntries] = useState<ArchiPuzzleRankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/archi/puzzle/ranking?puzzleId=${encodeURIComponent(puzzleId)}`,
        { credentials: 'same-origin' },
      )
      const json = (await res.json()) as ApiResponse<ArchiPuzzleRankingEntry[]>
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message ?? '랭킹을 불러오지 못했습니다')
      }
      setEntries(json.data)
    } catch (err) {
      setEntries([])
      setError(
        err instanceof Error ? err.message : '랭킹을 불러오지 못했습니다',
      )
    } finally {
      setLoading(false)
    }
  }, [puzzleId])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  return { entries, loading, error, reload: load }
}
