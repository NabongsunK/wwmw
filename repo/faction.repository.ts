// 유파 레포지토리

import { query } from '@/lib/db'
import type { Lang } from '@/types/base'

export interface Faction {
  code: string
  name: string
}

export class FactionRepository {
  /**
   * 모든 유파 조회 (다국어 지원)
   */
  async findAll(lang: Lang): Promise<Faction[]> {
    return await query<Faction>(
      `SELECT 
        code,
        UDF_BaseCode(code, ?) AS name
      FROM T_CodeBase
      WHERE code LIKE '1001%' AND lang = ?
      ORDER BY code ASC`,
      [lang, lang],
    )
  }
}
