import {
  allocateUniqueNickname,
  getNicknameBase,
  isArchiPuzzleId,
  resolveArchiNickname,
} from '@/lib/archi/nickname'
import { ArchiPuzzleRepository } from '@/repo/archi-puzzle.repository'
import type {
  ArchiPuzzleClear,
  ArchiPuzzleClearRequestBody,
  ArchiPuzzleRankingEntry,
} from '@/types/archi-puzzle'

const MOVE_COUNT_MAX = 99999

export class ArchiPuzzleService {
  private repository = new ArchiPuzzleRepository()

  async recordClear(body: ArchiPuzzleClearRequestBody): Promise<ArchiPuzzleClear> {
    const puzzleId = (body.puzzleId ?? '').trim()
    if (!isArchiPuzzleId(puzzleId)) {
      throw new Error('Invalid puzzleId (allowed: 1, 2)')
    }

    const moveCount = body.moveCount
    if (
      typeof moveCount !== 'number' ||
      !Number.isInteger(moveCount) ||
      moveCount < 0 ||
      moveCount > MOVE_COUNT_MAX
    ) {
      throw new Error('Invalid moveCount')
    }

    const base = getNicknameBase(resolveArchiNickname(body.nickname))
    const existing = await this.repository.findNicknamesByPuzzleAndBase(
      puzzleId,
      base,
    )
    const nickname = allocateUniqueNickname(base, existing)
    const uid =
      body.uid && typeof body.uid === 'string' && body.uid.trim().length > 0
        ? body.uid.trim().slice(0, 255)
        : null

    return await this.repository.create({
      puzzle_id: puzzleId,
      nickname,
      move_count: moveCount,
      uid,
    })
  }

  async getRanking(puzzleId: string): Promise<ArchiPuzzleRankingEntry[]> {
    const id = puzzleId.trim()
    if (!isArchiPuzzleId(id)) {
      throw new Error('Invalid puzzleId (allowed: 1, 2)')
    }

    const rows = await this.repository.findRankingByPuzzleId(id)
    return rows.map((row, index) => ({
      rank: index + 1,
      nickname: row.nickname,
      moveCount: row.move_count,
      clearedAt:
        row.cleared_at instanceof Date
          ? row.cleared_at.toISOString()
          : String(row.cleared_at),
    }))
  }
}
