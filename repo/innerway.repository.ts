// 심법 레포지토리 (조회 전용)

import { query } from '@/lib/db'
import type { Innerway } from '@/types/innerway'

export class InnerwayRepository {
  private tableName = 'T_심법'

  /**
   * 모든 심법 조회
   */
  async findAll(): Promise<Innerway[]> {
    return await query<Innerway>(
      `SELECT * FROM ${this.tableName} ORDER BY 유파_code, 순서 ASC, created_at DESC`,
    )
  }

  /**
   * ID로 조회
   */
  async findById(id: number): Promise<Innerway | null> {
    const results = await query<Innerway>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id])
    return results[0] || null
  }

  /**
   * 유파 코드로 심법 조회
   */
  async findBy유파Code(유파_code: string): Promise<Innerway[]> {
    return await query<Innerway>(
      `SELECT * FROM ${this.tableName} WHERE 유파_code = ? ORDER BY 순서 ASC`,
      [유파_code],
    )
  }

  /**
   * 등급별 조회
   */
  async findBy등급(등급: number): Promise<Innerway[]> {
    return await query<Innerway>(
      `SELECT * FROM ${this.tableName} WHERE 등급 = ? ORDER BY 순서 ASC`,
      [등급],
    )
  }
}
