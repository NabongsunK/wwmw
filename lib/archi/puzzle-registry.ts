import type { PegLevelConfig } from '@/lib/peg/types'
import type { LevelConfig } from '@/lib/puzzle/types'
import { level1 } from '@/lib/puzzle/levels/1'
import { pegLevel1 } from '@/lib/peg/levels/1'

export type SlidingPuzzleEntry = {
  kind: 'sliding'
  level: LevelConfig
}

export type PegPuzzleEntry = {
  kind: 'peg'
  level: PegLevelConfig
}

export type PuzzleEntry = SlidingPuzzleEntry | PegPuzzleEntry

const PUZZLES: Record<string, PuzzleEntry> = {
  '1': { kind: 'sliding', level: level1 },
  '2': { kind: 'peg', level: pegLevel1 },
}

export function getPuzzle(id: string): PuzzleEntry | undefined {
  return PUZZLES[id]
}

export function listPuzzleIds(): string[] {
  return Object.keys(PUZZLES)
}
