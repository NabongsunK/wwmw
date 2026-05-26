import type { PegGameState, PegLevelConfig } from './types'
import { getAllMoves, getMovesFrom, key, parseKey } from './board'

export function createPegState(level: PegLevelConfig): PegGameState {
  const pegs = new Set(level.pegs.map(([r, c]) => key(r, c)))
  return {
    pegs,
    moveCount: 0,
    selected: null,
    won: false,
    stuck: false,
  }
}

function checkEnd(state: PegGameState, level: PegLevelConfig): PegGameState {
  const count = state.pegs.size
  if (count === 1) {
    if (level.goal) {
      const g = key(level.goal.row, level.goal.col)
      if (state.pegs.has(g)) {
        return { ...state, won: true, stuck: false, selected: null }
      }
      return { ...state, won: false, stuck: true, selected: null }
    }
    return { ...state, won: true, stuck: false, selected: null }
  }
  if (getAllMoves(state.pegs).length === 0) {
    return { ...state, won: false, stuck: true, selected: null }
  }
  return { ...state, stuck: false }
}

export function selectPeg(state: PegGameState, row: number, col: number): PegGameState {
  const k = key(row, col)
  if (!state.pegs.has(k)) {
    return { ...state, selected: null }
  }
  if (getMovesFrom(state.pegs, k).length === 0) {
    return { ...state, selected: null }
  }
  return { ...state, selected: k }
}

export function applyMove(
  state: PegGameState,
  level: PegLevelConfig,
  toRow: number,
  toCol: number,
): PegGameState {
  if (state.won || state.stuck || !state.selected) return state

  const moves = getMovesFrom(state.pegs, state.selected)
  const target = moves.find((m) => m.to.row === toRow && m.to.col === toCol)
  if (!target) return state

  const pegs = new Set(state.pegs)
  pegs.delete(state.selected)
  pegs.delete(key(target.removed.row, target.removed.col))
  pegs.add(key(toRow, toCol))

  const next: PegGameState = {
    pegs,
    moveCount: state.moveCount + 1,
    selected: null,
    won: false,
    stuck: false,
  }
  return checkEnd(next, level)
}

export function getValidTargets(state: PegGameState): Set<string> {
  if (!state.selected) return new Set()
  return new Set(getMovesFrom(state.pegs, state.selected).map((m) => m.toKey))
}

export function clonePegState(state: PegGameState): PegGameState {
  return {
    pegs: new Set(state.pegs),
    moveCount: state.moveCount,
    selected: state.selected,
    won: state.won,
    stuck: state.stuck,
  }
}

export function resetPeg(level: PegLevelConfig): PegGameState {
  return createPegState(level)
}

/** 개발용: 클리어 상태로 전환 */
export function forcePegWin(state: PegGameState): PegGameState {
  return {
    ...state,
    won: true,
    stuck: false,
    selected: null,
  }
}

export type PegClickFeedback = 'no_moves' | 'invalid_target'

export interface PegClickResult {
  state: PegGameState
  feedback: PegClickFeedback | null
}

/** 클릭 한 번으로 이동: 구슬 → 빈 칸 */
export function clickCell(
  state: PegGameState,
  level: PegLevelConfig,
  row: number,
  col: number,
): PegClickResult {
  if (state.won || state.stuck) {
    return { state, feedback: null }
  }
  const k = key(row, col)

  if (state.selected) {
    const targets = getValidTargets(state)
    if (targets.has(k)) {
      return { state: applyMove(state, level, row, col), feedback: null }
    }
    if (state.pegs.has(k)) {
      const moves = getMovesFrom(state.pegs, k)
      if (moves.length === 0) {
        return { state: { ...state, selected: null }, feedback: 'no_moves' }
      }
      return { state: selectPeg(state, row, col), feedback: null }
    }
    return { state, feedback: 'invalid_target' }
  }

  if (state.pegs.has(k)) {
    const moves = getMovesFrom(state.pegs, k)
    if (moves.length === 0) {
      return { state, feedback: 'no_moves' }
    }
    return { state: selectPeg(state, row, col), feedback: null }
  }
  return { state, feedback: null }
}

export { parseKey }
