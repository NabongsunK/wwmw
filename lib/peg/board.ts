/** 영국식 십자 페그 솔리테어 보드 (33칸) */

export const GRID = 7

export const ENGLISH_HOLES: ReadonlySet<string> = (() => {
  const holes = new Set<string>()
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const inCenterBand = r >= 2 && r <= 4
      const inMiddleCols = c >= 2 && c <= 4
      if (inCenterBand || inMiddleCols) {
        holes.add(key(r, c))
      }
    }
  }
  return holes
})()

export function key(row: number, col: number): string {
  return `${row},${col}`
}

export function parseKey(k: string): { row: number; col: number } {
  const [r, c] = k.split(',').map(Number)
  return { row: r, col: c }
}

export function isHole(row: number, col: number): boolean {
  return ENGLISH_HOLES.has(key(row, col))
}

const JUMP_DIRS: [number, number][] = [
  [-2, 0],
  [2, 0],
  [0, -2],
  [0, 2],
]

export function getMovesFrom(
  pegs: Set<string>,
  fromKey: string
): PegMoveOption[] {
  const { row, col } = parseKey(fromKey)
  const out: PegMoveOption[] = []
  for (const [dr, dc] of JUMP_DIRS) {
    const midR = row + dr / 2
    const midC = col + dc / 2
    const toR = row + dr
    const toC = col + dc
    const toKey = key(toR, toC)
    const midKey = key(midR, midC)
    if (
      isHole(toR, toC) &&
      !pegs.has(toKey) &&
      pegs.has(midKey)
    ) {
      out.push({
        from: { row, col },
        to: { row: toR, col: toC },
        removed: { row: midR, col: midC },
        toKey,
      })
    }
  }
  return out
}

export interface PegMoveOption {
  from: { row: number; col: number }
  to: { row: number; col: number }
  removed: { row: number; col: number }
  toKey: string
}

export function getAllMoves(pegs: Set<string>): PegMoveOption[] {
  const moves: PegMoveOption[] = []
  for (const fromKey of pegs) {
    moves.push(...getMovesFrom(pegs, fromKey))
  }
  return moves
}
