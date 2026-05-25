'use client'

import { useCallback, useRef, useState } from 'react'
import type { LevelConfig } from '@/lib/puzzle/types'
import {
  applyDragMoves,
  blockAtCell,
  createGameState,
  getBlockSize,
  getWallsSet,
  resetGame,
  selectAt,
  tryMoveSelected,
} from '@/lib/puzzle/engine'
import { dragMoveSteps, dragPreviewOffset } from '@/lib/puzzle/drag'

const CELL = 56

const BLOCK_COLORS: Record<string, string> = {
  TEAL_H_2x1: '#488C82',
  YELLOW_V_2x2: '#D2AF46',
  JUNK_2x2: '#785F4B',
}

interface PuzzleGameProps {
  level: LevelConfig
}

export default function PuzzleGame({ level }: PuzzleGameProps) {
  const [game, setGame] = useState(() => createGameState(level))
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const boardRef = useRef<HTMLDivElement>(null)

  const walls = getWallsSet(level)

  const cellFromClient = useCallback(
    (clientX: number, clientY: number): [number, number] | null => {
      const el = boardRef.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null
      const col = Math.floor(x / CELL)
      const row = Math.floor(y / CELL)
      return [row, col]
    },
    []
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    const cell = cellFromClient(e.clientX, e.clientY)
    if (!cell) return
    const [row, col] = cell
    const block = blockAtCell(game.blocks, row, col)
    if (!block) return
    setGame((g) => selectAt(g, row, col))
    setDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({ x: 0, y: 0 })
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    setDragOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    const { dr, dc, steps } = dragMoveSteps(dx, dy, CELL)
    if (steps > 0) {
      setGame((g) => applyDragMoves(g, level, dr, dc, steps))
    }
    setDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'r' || e.key === 'R') {
      setGame(resetGame(level))
      return
    }
    let dr = 0
    let dc = 0
    if (e.key === 'ArrowUp' || e.key === 'w') dr = -1
    else if (e.key === 'ArrowDown' || e.key === 's') dr = 1
    else if (e.key === 'ArrowLeft' || e.key === 'a') dc = -1
    else if (e.key === 'ArrowRight' || e.key === 'd') dc = 1
    else return
    e.preventDefault()
    setGame((g) => tryMoveSelected(g, level, dr, dc, true))
  }

  const preview = dragging
    ? dragPreviewOffset(dragOffset.x, dragOffset.y, CELL)
    : { px: 0, py: 0 }

  const boardW = level.cols * CELL
  const boardH = level.rows * CELL

  const isExit = (row: number, col: number) =>
    row >= level.exit.row &&
    row < level.exit.row + 2 &&
    col >= level.exit.col &&
    col < level.exit.col + 2

  return (
    <div
      className="mx-auto max-w-lg select-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{level.title}</h1>
          <p className="text-sm text-muted-foreground">
            레벨 {level.id} · 드래그 또는 방향키 · R 리셋
          </p>
        </div>
        <div
          className="rounded-md border-2 border-amber-800/50 bg-amber-700/80 px-3 py-1 font-mono text-lg font-bold text-amber-950"
          aria-label="이동 횟수"
        >
          {String(game.moveCount).padStart(4, '0')}
        </div>
      </div>

      <div
        ref={boardRef}
        className="relative touch-none rounded-lg bg-[#3e3a34] p-1"
        style={{ width: boardW + 8, height: boardH + 8 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="relative" style={{ width: boardW, height: boardH }}>
          {Array.from({ length: level.rows * level.cols }, (_, i) => {
            const row = Math.floor(i / level.cols)
            const col = i % level.cols
            const key = `${row},${col}`
            const exit = isExit(row, col)
            return (
              <div
                key={key}
                className={`absolute box-border rounded-sm ${
                  walls.has(key)
                    ? 'border-2 border-[#191714] bg-[#282623]'
                    : exit
                      ? 'bg-[#5a4b37]'
                      : 'bg-[#4e4841]'
                }`}
                style={{
                  left: col * CELL + 2,
                  top: row * CELL + 2,
                  width: CELL - 4,
                  height: CELL - 4,
                }}
              />
            )
          })}

          {game.blocks.map((block) => {
            const { width, height } = getBlockSize(block.kind)
            const isSel = block.id === game.selectedId
            const off =
              isSel && dragging ? preview : { px: 0, py: 0 }
            return (
              <div
                key={block.id}
                className={`absolute rounded-md border-2 ${
                  isSel ? 'border-amber-300 z-10' : 'border-[#23201c] z-[5]'
                }`}
                style={{
                  left: block.col * CELL + 2 + off.px,
                  top: block.row * CELL + 2 + off.py,
                  width: width * CELL - 4,
                  height: height * CELL - 4,
                  backgroundColor: BLOCK_COLORS[block.kind],
                  transition: dragging && isSel ? 'none' : 'left 0.05s, top 0.05s',
                }}
              />
            )
          })}
        </div>

        {isExit(level.exit.row, level.exit.col) && (
          <span
            className="pointer-events-none absolute text-xs text-amber-200/90"
            style={{
              left: level.exit.col * CELL + CELL / 2 - 12,
              top: (level.exit.row + 2) * CELL - 18,
            }}
          >
            출구
          </span>
        )}
      </div>

      {game.won && (
        <p className="mt-4 text-center text-lg font-semibold text-green-400">
          수거 완료!
        </p>
      )}
    </div>
  )
}
