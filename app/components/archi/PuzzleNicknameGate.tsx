'use client'

import { useState } from 'react'
import {
  ARCHI_NICKNAME_MAX_LENGTH,
  DEFAULT_ARCHI_NICKNAME,
  getStoredArchiNickname,
  resolveArchiNickname,
  setStoredArchiNickname,
} from '@/lib/archi/nickname'

interface PuzzleNicknameGateProps {
  puzzleId: string
  puzzleTitle: string
  onStart: (nickname: string) => void
}

export default function PuzzleNicknameGate({
  puzzleId,
  puzzleTitle,
  onStart,
}: PuzzleNicknameGateProps) {
  const [input, setInput] = useState(() => getStoredArchiNickname())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const raw = input.trim()
    setStoredArchiNickname(raw)
    onStart(resolveArchiNickname(raw))
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-bold">{puzzleTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        아치 퍼즐 #{puzzleId} · 클리어 시 기록이 저장됩니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="archi-nickname" className="mb-1 block text-sm font-medium">
            닉네임
          </label>
          <input
            id="archi-nickname"
            type="text"
            maxLength={ARCHI_NICKNAME_MAX_LENGTH}
            placeholder={DEFAULT_ARCHI_NICKNAME}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            autoComplete="nickname"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          시작하기
        </button>
      </form>
    </div>
  )
}
