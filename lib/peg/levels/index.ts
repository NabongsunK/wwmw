import type { PegLevelConfig } from '../types'
import { pegLevel1 } from './1'

const LEVELS: Record<string, PegLevelConfig> = {
  '1': pegLevel1,
}

export function getPegLevel(id: string): PegLevelConfig | undefined {
  return LEVELS[id]
}

export function listPegLevelIds(): string[] {
  return Object.keys(LEVELS)
}
