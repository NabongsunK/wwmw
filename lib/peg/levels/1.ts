import type { PegLevelConfig } from '../types'

/**
 * 5구슬 중반 퍼즐 (풀 수 있음, 최소 4수).
 * 레이턴식 구슬 점프와 같은 규칙·보드.
 */
export const pegLevel1: PegLevelConfig = {
  id: '1',
  title: '구슬 점프 #1',
  pegs: [
    [3, 2],
    [3, 4],
    [4, 2],
    [4, 3],
    [4, 4],
    [5, 2],
    [5, 3],
    [5, 4],
    [6, 2],
    [6, 3],
    [6, 4],
  ],
}
