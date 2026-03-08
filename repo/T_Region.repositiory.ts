// T_CodeBase 레포지토리 (조회 전용)

import { query } from '@/lib/db'
import type { Lang } from '@/types/base'
import type { Region } from '@/types/wanderingtales'

export class RegionRepository {
  private tableName = 'T_Region'

  /**
   * 대분류 조회 (다국어 지원)
   * T_Region에는 lang 컬럼 없음. lang은 UDF_BaseCode 코드명 변환용으로만 사용.
   */
  async FirstRegion(lang: Lang): Promise<string[]> {
    const result = await query<{ cd1: string }>(
      `SELECT '전체' AS cd1 UNION ALL 
      SELECT DISTINCT UDF_BaseCode(cd1, ?) AS cd1 FROM ${this.tableName}`,
      [lang],
    )
    return result?.map((r) => r.cd1) ?? []
  }

  /**
   * 소분류 조회 (다국어 지원)
   * T_Region에는 lang 컬럼 없음. lang은 UDF_BaseCode 코드명 변환용으로만 사용.
   */
  async ThirdRegion(lang: Lang): Promise<Region[]> {
    const result = await query<Region>(
      `
      SELECT '전체' AS cd1, '전체' AS cd3 UNION ALL 
      SELECT DISTINCT UDF_BaseCode(cd1, ?) AS cd1, '전체' AS cd3 FROM ${this.tableName} UNION ALL 
      SELECT DISTINCT UDF_BaseCode(cd1, ?) AS cd1, UDF_BaseCode(cd3, ?) AS cd3 FROM ${this.tableName}`,
      [lang, lang, lang],
    )
    return (
      result?.sort((a, b) => {
        if (a.cd1 === '전체') {
          return -1
        }
        if (b.cd1 === '전체') {
          return 1
        }
        return a.cd1.localeCompare(b.cd1)
      }) ?? []
    )
  }
}
