import type { Block, BlockKind, GameState, LevelConfig } from './types'

function wallKey(row: number, col: number): string {
  return `${row},${col}`
}

export function getBlockSize(kind: BlockKind): { width: number; height: number } {
  if (kind === 'TEAL_H_2x1') return { width: 2, height: 1 }
  return { width: 2, height: 2 }
}

export function getBlockCells(block: Block): [number, number][] {
  const { width, height } = getBlockSize(block.kind)
  const cells: [number, number][] = []
  for (let dr = 0; dr < height; dr++) {
    for (let dc = 0; dc < width; dc++) {
      cells.push([block.row + dr, block.col + dc])
    }
  }
  return cells
}

function occupiedCells(
  blocks: Block[],
  walls: Set<string>,
  excludeId: number | null
): Set<string> {
  const occ = new Set(walls)
  for (const b of blocks) {
    if (b.id === excludeId) continue
    for (const [r, c] of getBlockCells(b)) {
      occ.add(wallKey(r, c))
    }
  }
  return occ
}

function canMove(
  block: Block,
  dr: number,
  dc: number,
  occupied: Set<string>,
  rows: number,
  cols: number
): boolean {
  for (const [r, c] of getBlockCells(block)) {
    const nr = r + dr
    const nc = c + dc
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return false
    if (occupied.has(wallKey(nr, nc))) return false
  }
  return true
}

export function createGameState(level: LevelConfig): GameState {
  const blocks: Block[] = level.blocks.map((b, id) => ({
    id,
    kind: b.kind,
    row: b.row,
    col: b.col,
  }))
  return { blocks, moveCount: 0, selectedId: null, won: false }
}

export function getWallsSet(level: LevelConfig): Set<string> {
  return new Set(level.walls.map(([r, c]) => wallKey(r, c)))
}

export function blockAtCell(
  blocks: Block[],
  row: number,
  col: number
): Block | null {
  for (const b of blocks) {
    if (getBlockCells(b).some(([r, c]) => r === row && c === col)) return b
  }
  return null
}

export function selectAt(
  state: GameState,
  row: number,
  col: number
): GameState {
  const block = blockAtCell(state.blocks, row, col)
  return { ...state, selectedId: block?.id ?? null }
}

export function tryMoveSelected(
  state: GameState,
  level: LevelConfig,
  dr: number,
  dc: number,
  countMove = true
): GameState {
  if (state.won || state.selectedId === null) return state
  const block = state.blocks.find((b) => b.id === state.selectedId)
  if (!block) return state

  const walls = getWallsSet(level)
  const occupied = occupiedCells(state.blocks, walls, block.id)
  if (!canMove(block, dr, dc, occupied, level.rows, level.cols)) {
    return state // 이동 없음 — 동일 참조
  }

  const blocks = state.blocks.map((b) =>
    b.id === block.id ? { ...b, row: b.row + dr, col: b.col + dc } : b
  )
  let won: boolean = state.won
  const junk = blocks.find((b) => b.kind === 'JUNK_2x2')
  if (
    junk &&
    junk.row === level.exit.row &&
    junk.col === level.exit.col
  ) {
    won = true
  }

  return {
    blocks,
    moveCount: countMove ? state.moveCount + 1 : state.moveCount,
    selectedId: state.selectedId,
    won,
  }
}

export function applyDragMoves(
  state: GameState,
  level: LevelConfig,
  dr: number,
  dc: number,
  steps: number
): GameState {
  let next = state
  let moved = false
  for (let i = 0; i < steps; i++) {
    const prev = next
    next = tryMoveSelected(next, level, dr, dc, false)
    if (next === prev) break
    moved = true
  }
  if (moved) {
    return { ...next, moveCount: next.moveCount + 1 }
  }
  return next
}

export function cloneGameState(state: GameState): GameState {
  return {
    blocks: state.blocks.map((b) => ({ ...b })),
    moveCount: state.moveCount,
    selectedId: state.selectedId,
    won: state.won,
  }
}

export function resetGame(level: LevelConfig): GameState {
  return createGameState(level)
}

/** 개발용: 쓰레기를 출구에 두고 클리어 처리 */
export function forceWin(state: GameState, level: LevelConfig): GameState {
  const blocks = state.blocks.map((b) =>
    b.kind === 'JUNK_2x2'
      ? { ...b, row: level.exit.row, col: level.exit.col }
      : b,
  )
  return {
    blocks,
    moveCount: state.moveCount,
    selectedId: null,
    won: true,
  }
}
