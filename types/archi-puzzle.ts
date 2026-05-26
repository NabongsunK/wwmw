export interface ArchiPuzzleClear {
  id: number
  puzzle_id: string
  nickname: string
  move_count: number
  uid: string | null
  cleared_at: Date
}

export interface CreateArchiPuzzleClearDto {
  puzzle_id: string
  nickname: string
  move_count: number
  uid?: string | null
}

export interface ArchiPuzzleClearRequestBody {
  puzzleId: string
  nickname?: string
  moveCount: number
  uid?: string | null
}

export interface ArchiPuzzleRankingEntry {
  rank: number
  nickname: string
  moveCount: number
  clearedAt: string
}
