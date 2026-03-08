// T_CodeBase 레포지토리 (조회 전용)

import { query } from '@/lib/db'
import type { Lang } from '@/types/martial'

export class CodeBaseRepository {
  private tableName = 'T_CodeBase'

  /**
   * 코드명으로 코드 조회 (다국어 지원)
   */
  async findCodeByCodeName(lang: Lang, codeName: string): Promise<string> {
    const result = await query<{ code: string }>(
      `SELECT code FROM ${this.tableName} WHERE code_nm = ? AND lang = ?`,
      [codeName, lang],
    )
    return result[0]?.code || ''
  }
}
