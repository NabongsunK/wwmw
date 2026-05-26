'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PegLevelConfig } from '@/lib/peg/types'
import { GRID, getMovesFrom, isHole, key } from '@/lib/peg/board'
import { clickCell, createPegState, forcePegWin, getValidTargets, resetPeg } from '@/lib/peg/engine'
import { usePuzzleClearSave } from '@/hooks/usePuzzleClearSave'
import ClearSaveStatusMessage from '@/app/components/archi/ClearSaveStatus'
import DevClearButton from '@/app/components/archi/DevClearButton'
import PuzzlePlayLayout from '@/app/components/archi/PuzzlePlayLayout'

const CELL = 48
const HINT_MS = 2800

const INVALID_TARGET_HINT = '여기로는 이동할 수 없습니다. 빈 칸(노란 링)을 눌러 주세요.'

interface PegGameProps {
  level: PegLevelConfig
  puzzleId: string
  nickname: string
  uid?: string | null
}

export default function PegGame({ level, puzzleId, nickname, uid }: PegGameProps) {
  const [game, setGame] = useState(() => createPegState(level))
  const [hint, setHint] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const targets = getValidTargets(game)
  const {
    status: saveStatus,
    errorMessage: saveError,
    savedNickname,
    saveVersion,
    devTriggerClear,
  } = usePuzzleClearSave(game.won, puzzleId, nickname, game.moveCount, uid)

  const triggerShake = useCallback(() => {
    setShakeKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (!hint) return
    const t = window.setTimeout(() => setHint(null), HINT_MS)
    return () => window.clearTimeout(t)
  }, [hint])

  const handleCellClick = (row: number, col: number) => {
    if (!isHole(row, col) || game.won || game.stuck) return

    const { state, feedback } = clickCell(game, level, row, col)
    setGame(state)

    if (feedback === 'invalid_target') {
      setHint(INVALID_TARGET_HINT)
      triggerShake()
    } else if (feedback === 'no_moves') {
      setHint(null)
      triggerShake()
    } else {
      setHint(null)
    }
  }

  const handleReset = () => {
    setGame(resetPeg(level))
    setHint(null)
  }

  const handleDevClear = () => {
    setGame((g) => forcePegWin(g))
    devTriggerClear()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault()
      handleReset()
    }
  }

  const boardW = GRID * CELL
  const boardH = GRID * CELL

  return (
    <PuzzlePlayLayout puzzleId={puzzleId} rankingRefreshKey={saveVersion}>
      <div
        className="mx-auto max-w-md select-none outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{level.title}</h1>
            <p className="text-sm text-muted-foreground">
              {nickname} · 구슬 → 빈 칸 · R 리셋 · 남은 {game.pegs.size}개
            </p>
          </div>
          <div className="rounded-md border border-amber-800/40 bg-amber-900/30 px-3 py-1 font-mono text-lg font-bold text-amber-100">
            {String(game.moveCount).padStart(3, '0')}
          </div>
        </div>

        {hint && (
          <p
            className="mb-3 rounded-md border border-amber-500/50 bg-amber-500/15 px-3 py-2 text-center text-sm font-medium text-amber-200"
            role="alert"
          >
            {hint}
          </p>
        )}

        <div
          key={shakeKey}
          className={`relative rounded-xl border-4 border-[#5c4033] bg-[#6b4f3a] p-3 shadow-inner ${
            shakeKey > 0 ? 'peg-board-shake' : ''
          }`}
          style={{ width: boardW + 24, height: boardH + 24 }}
        >
          <div className="relative" style={{ width: boardW, height: boardH }}>
            {Array.from({ length: GRID * GRID }, (_, i) => {
              const row = Math.floor(i / GRID)
              const col = i % GRID
              if (!isHole(row, col)) {
                return null
              }
              const k = key(row, col)
              const hasPeg = game.pegs.has(k)
              const isSel = game.selected === k
              const isTarget = targets.has(k)
              const cantMove = hasPeg && getMovesFrom(game.pegs, k).length === 0
              return (
                <button
                  key={k}
                  type="button"
                  className={`absolute flex items-center justify-center rounded-full transition-colors ${
                    isTarget ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-[#6b4f3a]' : ''
                  } ${isSel ? 'z-20' : 'z-10'}`}
                  style={{
                    left: col * CELL + CELL / 2 - 18,
                    top: row * CELL + CELL / 2 - 18,
                    width: 36,
                    height: 36,
                  }}
                  onClick={() => handleCellClick(row, col)}
                  aria-label={
                    hasPeg
                      ? cantMove
                        ? `구슬 ${row + 1},${col + 1} — 이동 불가`
                        : `구슬 ${row + 1},${col + 1}`
                      : isTarget
                        ? '이동 가능'
                        : '빈 구멍'
                  }
                >
                  <span
                    className={`block rounded-full ${
                      hasPeg
                        ? `h-8 w-8 bg-gradient-to-br from-[#e8e8ec] via-[#b8b8c0] to-[#787888] shadow-md ${
                            cantMove ? 'opacity-60' : ''
                          }`
                        : 'h-7 w-7 border border-[#3d2e22]/60 bg-[#2a1f18]/80'
                    } ${isSel ? 'ring-2 ring-amber-400' : ''}`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-md bg-muted px-4 py-2 text-sm hover:bg-muted/80"
            onClick={handleReset}
          >
            R 리셋
          </button>
          <DevClearButton onClear={handleDevClear} />
        </div>

        <div className="mt-3 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">규칙</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>인접한 구슬을 뛰어넘어 빈 칸으로 이동합니다.</li>
            <li>뛰어넘은 구슬은 제거됩니다.</li>
            <li>
              마지막에 구슬 <strong>1개</strong>만 남기면 클리어입니다.
            </li>
          </ul>
        </div>

        {game.won && (
          <p className="mt-4 text-center text-lg font-semibold text-green-400">
            클리어! 구슬을 하나만 남겼습니다.
          </p>
        )}
        <ClearSaveStatusMessage
          status={saveStatus}
          errorMessage={saveError}
          savedNickname={savedNickname}
        />
        {game.stuck && !game.won && (
          <p className="mt-4 text-center text-lg font-semibold text-amber-400">
            더 이상 움직일 수 없습니다. R로 다시 시도하세요.
          </p>
        )}
      </div>
    </PuzzlePlayLayout>
  )
}
