import { query } from '@/lib/db'
import type { ArchiPuzzleClear, CreateArchiPuzzleClearDto } from '@/types/archi-puzzle'

export class ArchiPuzzleRepository {
  private tableName = 'T_아치_퍼즐_클리어'

  /** 같은 퍼즐에서 base 또는 base#N 형태 닉네임 목록 */
  async findNicknamesByPuzzleAndBase(puzzleId: string, base: string): Promise<string[]> {
    const rows = await query<{ nickname: string }>(
      `SELECT nickname FROM ${this.tableName}
       WHERE puzzle_id = ? AND (nickname = ? OR nickname LIKE ?)`,
      [puzzleId, base, `${base}#%`],
    )
    return rows.map((r) => r.nickname)
  }

  async findRankingByPuzzleId(puzzleId: string, limit = 30): Promise<ArchiPuzzleClear[]> {
    // MySQL prepared statement는 LIMIT ? 바인딩 시 ER_WRONG_ARGUMENTS(1210) 발생
    const limitNum = Math.max(1, Math.min(100, Math.floor(Number(limit)) || 30))
    const rows = await query<ArchiPuzzleClear>(
      `SELECT id, puzzle_id, nickname, move_count, uid, cleared_at
       FROM ${this.tableName}
       WHERE puzzle_id = ?
       ORDER BY move_count ASC, cleared_at ASC
       LIMIT ${limitNum}`,
      [puzzleId],
    )
    return rows
  }

  async create(data: CreateArchiPuzzleClearDto): Promise<ArchiPuzzleClear> {
    await query(
      `INSERT INTO ${this.tableName} (puzzle_id, nickname, move_count, uid) VALUES (?, ?, ?, ?)`,
      [data.puzzle_id, data.nickname, data.move_count, data.uid ?? null],
    )
    const rows = await query<ArchiPuzzleClear>(
      `SELECT * FROM ${this.tableName} WHERE puzzle_id = ? ORDER BY id DESC LIMIT 1`,
      [data.puzzle_id],
    )
    if (!rows[0]) {
      throw new Error('Failed to create archi puzzle clear record')
    }
    return rows[0]
  }
}
