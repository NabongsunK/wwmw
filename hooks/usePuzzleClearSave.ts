'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { submitPuzzleClear } from '@/lib/archi/submit-clear'

export type ClearSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function usePuzzleClearSave(
  won: boolean,
  puzzleId: string,
  nickname: string,
  moveCount: number,
  uid?: string | null,
) {
  const [status, setStatus] = useState<ClearSaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [savedNickname, setSavedNickname] = useState<string | null>(null)
  const [saveVersion, setSaveVersion] = useState(0)
  const postedRef = useRef(false)

  const saveClearNow = useCallback(async () => {
    setStatus('saving')
    setErrorMessage(null)
    setSavedNickname(null)

    try {
      const res = await submitPuzzleClear({
        puzzleId,
        nickname,
        moveCount,
        uid,
      })
      postedRef.current = true
      setSavedNickname(res.data?.nickname ?? null)
      setSaveVersion((v) => v + 1)
      setStatus('saved')
    } catch (err) {
      postedRef.current = false
      setStatus('error')
      setErrorMessage(
        err instanceof Error ? err.message : '저장에 실패했습니다',
      )
    }
  }, [puzzleId, nickname, moveCount, uid])

  useEffect(() => {
    if (!won || postedRef.current) return
    saveClearNow()
  }, [won, saveClearNow])

  return {
    status,
    errorMessage,
    savedNickname,
    saveVersion,
  }
}
