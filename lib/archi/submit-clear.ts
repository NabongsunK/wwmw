import { resolveArchiNickname } from '@/lib/archi/nickname'
import type { ApiResponse } from '@/types/api'
import type { ArchiPuzzleClear } from '@/types/archi-puzzle'

export async function submitPuzzleClear(params: {
  puzzleId: string
  nickname: string
  moveCount: number
  uid?: string | null
}): Promise<ApiResponse<ArchiPuzzleClear>> {
  const response = await fetch('/api/archi/puzzle/clear', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      puzzleId: params.puzzleId,
      nickname: resolveArchiNickname(params.nickname),
      moveCount: params.moveCount,
      uid: params.uid ?? undefined,
    }),
  })

  const json = (await response.json()) as ApiResponse<ArchiPuzzleClear>
  if (!response.ok || !json.success) {
    throw new Error(json.message ?? '클리어 기록 저장 실패')
  }
  return json
}
