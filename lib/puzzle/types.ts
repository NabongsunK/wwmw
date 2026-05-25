export type BlockKind = 'TEAL_H_2x1' | 'YELLOW_V_2x2' | 'JUNK_2x2'

export interface BlockDef {
  kind: BlockKind
  row: number
  col: number
}

export interface LevelConfig {
  id: string
  title: string
  rows: number
  cols: number
  walls: [number, number][]
  exit: { row: number; col: number }
  blocks: BlockDef[]
}

export interface Block {
  id: number
  kind: BlockKind
  row: number
  col: number
}

export interface GameState {
  blocks: Block[]
  moveCount: number
  selectedId: number | null
  won: boolean
}
