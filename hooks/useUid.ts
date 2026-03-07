'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'wwe_uid'

function getStoredUid(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function setStoredUid(uid: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, uid)
  } catch {
    // ignore
  }
}

/**
 * 앱 전역에서 사용할 uid.
 * - localStorage에 없으면 POST /api/uid로 생성 후 저장
 * - 빌드 작성, 좋아요, 수정/삭제 권한 판단에 사용
 */
export function useUid(): {
  uid: string | null
  isAdmin: boolean
  isLoading: boolean
  refetch: () => Promise<void>
} {
  const [uid, setUid] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const ensureUid = useCallback(async () => {
    const stored = getStoredUid()
    if (stored) {
      setUid(stored)
      try {
        const res = await fetch(`/api/uid/${encodeURIComponent(stored)}`)
        const json = await res.json()
        if (json?.success && json?.data?.isAdmin === true) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch {
        setIsAdmin(false)
      }
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch('/api/uid', { method: 'POST' })
      const json = await res.json()
      if (json?.success && json?.data?.uid) {
        const newUid = json.data.uid as string
        setStoredUid(newUid)
        setUid(newUid)
        const meRes = await fetch(`/api/uid/${encodeURIComponent(newUid)}`)
        const meJson = await meRes.json()
        setIsAdmin(meJson?.success && meJson?.data?.isAdmin === true)
      }
    } catch (e) {
      console.error('Failed to create uid:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    ensureUid()
  }, [ensureUid])

  return { uid, isAdmin, isLoading, refetch: ensureUid }
}
