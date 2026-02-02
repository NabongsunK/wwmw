// 비결 레포지토리 (조회 전용)

import { query } from '@/lib/db'
import type { Mystic } from '@/types/mystic'

export class MysticRepository {
  private tableName = 'T_비결'

  /**
   * 모든 비결 조회
   */
  async findAll(): Promise<Mystic[]> {
    return await query<Mystic>(`SELECT * FROM ${this.tableName} ORDER BY 순서 ASC, created_at DESC`)
  }

  /**
   * ID로 조회
   */
  async findById(id: number): Promise<Mystic | null> {
    const results = await query<Mystic>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id])
    return results[0] || null
  }
}
