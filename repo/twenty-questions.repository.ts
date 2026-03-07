// 스무고개 레포지토리 (T_스무고개)

import pool from '@/lib/db'
import { query } from '@/lib/db'
import type { TwentyQuestion, CreateTwentyQuestionDto } from '@/types/twenty-questions'

export class TwentyQuestionRepository {
  private tableName = 'T_스무고개'

  async create(dto: CreateTwentyQuestionDto): Promise<TwentyQuestion> {
    if (!dto?.hint?.trim() || !dto?.answer?.trim()) {
      throw new Error('hint and answer are required')
    }
    const lang = dto.lang || 'ko'
    const [result] = await pool.execute(
      `INSERT INTO ${this.tableName} (hint, answer, user_id, lang) VALUES (?, ?, ?, ?)`,
      [dto.hint.trim(), dto.answer.trim(), dto.user_id || null, lang],
    )
    const insertId = (result as { insertId: number }).insertId
    const rows = await query<TwentyQuestion>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [
      insertId,
    ])
    const row = rows[0]
    if (!row) throw new Error('Failed to create twenty-question')
    return row
  }

  async findByLang(
    lang: string,
    limit = 100,
    offset = 0,
    search?: string,
  ): Promise<TwentyQuestion[]> {
    const limitNum = Math.max(0, Number(limit) || 0)
    const offsetNum = Math.max(0, Number(offset) || 0)
    const hasSearch = typeof search === 'string' && search.trim().length > 0
    const likePattern = hasSearch
      ? `%${search.trim().replace(/%/g, '\\%').replace(/_/g, '\\_')}%`
      : null

    if (hasSearch && likePattern) {
      const rows = await query<TwentyQuestion>(
        `SELECT * FROM ${this.tableName} WHERE lang = ? AND (hint LIKE ? OR answer LIKE ?) ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`,
        [lang, likePattern, likePattern],
      )
      return rows
    }
    const rows = await query<TwentyQuestion>(
      `SELECT * FROM ${this.tableName} WHERE lang = ? ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`,
      [lang],
    )
    return rows
  }

  async countByLang(lang: string, search?: string): Promise<number> {
    const hasSearch = typeof search === 'string' && search.trim().length > 0
    const likePattern = hasSearch
      ? `%${search.trim().replace(/%/g, '\\%').replace(/_/g, '\\_')}%`
      : null

    if (hasSearch && likePattern) {
      const rows = await query<{ cnt: number }>(
        `SELECT COUNT(*) AS cnt FROM ${this.tableName} WHERE lang = ? AND (hint LIKE ? OR answer LIKE ?)`,
        [lang, likePattern, likePattern],
      )
      return Number(rows[0]?.cnt ?? 0)
    }
    const rows = await query<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM ${this.tableName} WHERE lang = ?`,
      [lang],
    )
    return Number(rows[0]?.cnt ?? 0)
  }
}
