// 비결 레포지토리 (조회 전용)

import { query } from '@/lib/db'
import type { Mystic } from '@/types/mystic'
import type { Lang } from '@/types/martial'

export class MysticRepository {
  private tableName = 'T_비결'

  /**
   * 모든 비결 조회 (다국어 지원)
   */
  async findAll(lang: Lang): Promise<Mystic[]> {
    return await query<Mystic>(
      `SELECT 
        b.id,
        UDF_BaseCode(b.title, ?) AS title,
        UDF_BaseCode(b.type, ?) AS type,
        UDF_BaseCode(b.body, ?) AS body,
        b.순서,
        b.img,
        i.img_path,
        b.created_at,
        b.updated_at
      FROM ${this.tableName} b
      LEFT JOIN T_이미지 i ON b.img = i.id
      ORDER BY b.순서 ASC, b.created_at DESC`,
      [lang, lang, lang]
    )
  }

  /**
   * ID로 조회 (다국어 지원)
   */
  async findById(id: number, lang: Lang): Promise<Mystic | null> {
    const results = await query<Mystic>(
      `SELECT 
        b.id,
        UDF_BaseCode(b.title, ?) AS title,
        UDF_BaseCode(b.type, ?) AS type,
        UDF_BaseCode(b.body, ?) AS body,
        b.순서,
        b.img,
        i.img_path,
        b.created_at,
        b.updated_at
      FROM ${this.tableName} b
      LEFT JOIN T_이미지 i ON b.img = i.id
      WHERE b.id = ?`,
      [lang, lang, lang, id]
    )
    return results[0] || null
  }
}
