import type { LevelConfig } from '../types'
import { level1 } from './1'

const LEVELS: Record<string, LevelConfig> = {
  '1': level1,
}

export function getLevel(id: string): LevelConfig | undefined {
  return LEVELS[id]
}

export function listLevelIds(): string[] {
  return Object.keys(LEVELS)
}
