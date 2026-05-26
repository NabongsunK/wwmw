export interface PegLevelConfig {
  id: string
  title: string
  /** 구슬이 있는 칸 [row, col] (0-based, 7×7 격자) */
  pegs: [number, number][]
  /** 승리 시 남길 구슬 위치. 없으면 1개만 남으면 승리 */
  goal?: { row: number; col: number }
}

export interface PegMove {
  from: { row: number; col: number }
  to: { row: number; col: number }
  removed: { row: number; col: number }
}

export interface PegGameState {
  pegs: Set<string>
  moveCount: number
  selected: string | null
  won: boolean
  stuck: boolean
}
