// 심법 레포지토리 (조회 전용)

import { query } from '@/lib/db'
import type { Innerway } from '@/types/innerway'
import type { Lang } from '@/types/martial'

export class InnerwayRepository {
  private tableName = 'T_심법'

  /**
   * 모든 심법 조회
   */
  async findAll(lang: Lang): Promise<Innerway[]> {
    return await query<Innerway>(
      `SELECT 
        s.유파_code,
        UDF_BaseCode(s.유파_code, ?) AS 유파,
        UDF_BaseCode(s.title, ?) AS 심법명,
        s.순서,
        s.등급,
        심법_이미지.img_path AS 심법_이미지_url,
        유파_이미지.img_path AS 유파_이미지_url
      FROM T_심법 s
      LEFT JOIN T_이미지 심법_이미지 ON s.img = 심법_이미지.id
      LEFT JOIN T_이미지 유파_이미지 ON s.유파_code = 유파_이미지.code
      ORDER BY s.유파_code, s.순서 ASC, s.created_at DESC`,
      [lang, lang],
    )
  }

  /**
   * ID로 조회 (다국어 지원)
   */
  async findById(id: number, lang: Lang): Promise<Innerway | null> {
    const results = await query<Innerway>(
      `SELECT 
        s.id,
        s.유파_code,
        UDF_BaseCode(s.유파_code, ?) AS 유파,
        UDF_BaseCode(s.title, ?) AS 심법명,
        s.body,
        s.순서,
        s.등급,
        s.img,
        s.created_at,
        s.updated_at,
        심법_이미지.img_path AS 심법_이미지_url,
        유파_이미지.img_path AS 유파_이미지_url
      FROM ${this.tableName} s
      LEFT JOIN T_이미지 심법_이미지 ON s.img = 심법_이미지.id
      LEFT JOIN T_이미지 유파_이미지 ON s.유파_code = 유파_이미지.code
      WHERE s.id = ?`,
      [lang, lang, id],
    )
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
