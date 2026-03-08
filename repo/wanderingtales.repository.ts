// 만사록 레포지토리 (조회 전용)

import { query } from '@/lib/db'
import type { WanderingTales } from '@/types/wanderingtales'
import type { Lang } from '@/types/martial'

export class WanderingTalesRepository {
  private tableName = 'T_naesilBoard'

  /**
   * 만사록 조회 (다국어 지원)
   * - 공지(notice=1)는 항상 상단에 포함
   * - region_code, subRegion_code 있으면 해당 조건으로 일반 글만 추가 (null 바인드 없이 동적 WHERE)
   */
  async findAll(
    lang: Lang,
    region_code: string | undefined,
    subRegion_code: string | undefined,
  ): Promise<WanderingTales[]> {
    const conditions = ['b.deleted = 0', '(b.notice = 0 OR b.notice IS NULL)', 'b.lang = ?']
    const params: (string | Lang)[] = [lang, lang, lang, lang, lang, lang, lang, lang]
    if (region_code != null && region_code !== '') {
      conditions.push('b.region_code = ?')
      params.push(region_code)
    }
    if (subRegion_code != null && subRegion_code !== '') {
      conditions.push('b.subRegion_code = ?')
      params.push(subRegion_code)
    }

    return await query<WanderingTales>(
      `(SELECT 
        b.id,
        UDF_BaseCode(b.region_code, ?) AS region,
        UDF_BaseCode(b.subRegion_code, ?) AS subRegion,
        UDF_BaseCode(b.title_code, ?) AS title,
        b.created_at,
        b.updated_at,
        '관리자' AS writer,
        b.notice,
        b.\`order\` AS sort_order,
        0 AS view_count,
        0 AS like_count,
        0 AS comment_count

      FROM ${this.tableName} b
      WHERE b.deleted = 0 AND b.notice = 1 AND b.lang = ?)

      UNION ALL

      (SELECT 
        b.id,
        UDF_BaseCode(b.region_code, ?) AS region,
        UDF_BaseCode(b.subRegion_code, ?) AS subRegion,
        UDF_BaseCode(b.title_code, ?) AS title,
        b.created_at,
        b.updated_at,
        '관리자' AS writer,
        b.notice,
        b.\`order\` AS sort_order,
        0 AS view_count,
        0 AS like_count,
        0 AS comment_count
      FROM ${this.tableName} b
      WHERE ${conditions.join(' AND ')})

      ORDER BY notice DESC, region DESC, subRegion DESC, sort_order ASC, created_at DESC`,
      params,
    )
  }

  /**
   * ID로 조회 (다국어 지원)
   */
  async findById(id: number, lang: Lang): Promise<WanderingTales | null> {
    const results = await query<WanderingTales>(
      `SELECT 
        b.id,
        UDF_BaseCode(b.region_code, ?) AS region,
        UDF_BaseCode(b.subRegion_code, ?) AS subRegion,
        UDF_BaseCode(b.title_code, ?) AS title,
        b.body,
        b.created_at,
        b.updated_at,
        '관리자' AS writer,
        b.notice,
        0 AS view_count,
        0 AS like_count,
        0 AS comment_count
      FROM ${this.tableName} b
      WHERE b.id = ?`,
      [lang, lang, lang, id],
    )
    return results[0] || null
  }
}
