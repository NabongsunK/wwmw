// 무술계층 레포지토리 (조회 전용)

import { query } from '@/lib/db'
import type { MartialHierarchyWithNames, Lang } from '@/types/martial'

export class MartialRepository {
  private tableName = 'T_무술계층'

  /**
   * 모든 무술계층 조회 (다국어 지원)
   */
  async findAll(lang: Lang = 'ko'): Promise<MartialHierarchyWithNames[]> {
    return await query<MartialHierarchyWithNames>(
      `SELECT 
        m.id,
        m.유파_code,
        m.장비_code,
        m.무술_code,
        m.스킬_code,
        m.순서,
        m.키보드_키,
        m.패드_키,
        m.유파_img,
        m.장비_img,
        m.무술_img,
        m.스킬_img,
        m.created_at,
        m.updated_at,
        cb_유파.code_nm AS 유파_name,
        cb_장비.code_nm AS 장비_name,
        cb_무술.code_nm AS 무술_name,
        cb_스킬.code_nm AS 스킬_name,
        img_유파.img_path AS 유파_img_path,
        img_장비.img_path AS 장비_img_path,
        img_무술.img_path AS 무술_img_path,
        img_스킬.img_path AS 스킬_img_path
      FROM ${this.tableName} m
      LEFT JOIN T_CodeBase cb_유파 ON m.유파_code = cb_유파.code AND cb_유파.lang = ?
      LEFT JOIN T_CodeBase cb_장비 ON m.장비_code = cb_장비.code AND cb_장비.lang = ?
      LEFT JOIN T_CodeBase cb_무술 ON m.무술_code = cb_무술.code AND cb_무술.lang = ?
      LEFT JOIN T_CodeBase cb_스킬 ON m.스킬_code = cb_스킬.code AND cb_스킬.lang = ?
      LEFT JOIN T_이미지 img_유파 ON m.유파_img = img_유파.id
      LEFT JOIN T_이미지 img_장비 ON m.장비_img = img_장비.id
      LEFT JOIN T_이미지 img_무술 ON m.무술_img = img_무술.id
      LEFT JOIN T_이미지 img_스킬 ON m.스킬_img = img_스킬.id
      ORDER BY m.순서 ASC, m.created_at DESC`,
      [lang, lang, lang, lang],
    )
  }

  /**
   * ID로 조회 (다국어 지원)
   */
  async findById(id: number, lang: Lang = 'ko'): Promise<MartialHierarchyWithNames | null> {
    const results = await query<MartialHierarchyWithNames>(
      `SELECT 
        m.id,
        m.유파_code,
        m.장비_code,
        m.무술_code,
        m.스킬_code,
        m.순서,
        m.키보드_키,
        m.패드_키,
        m.유파_img,
        m.장비_img,
        m.무술_img,
        m.스킬_img,
        m.created_at,
        m.updated_at,
        cb_유파.code_nm AS 유파_name,
        cb_장비.code_nm AS 장비_name,
        cb_무술.code_nm AS 무술_name,
        cb_스킬.code_nm AS 스킬_name,
        img_유파.img_path AS 유파_img_path,
        img_장비.img_path AS 장비_img_path,
        img_무술.img_path AS 무술_img_path,
        img_스킬.img_path AS 스킬_img_path
      FROM ${this.tableName} m
      LEFT JOIN T_CodeBase cb_유파 ON m.유파_code = cb_유파.code AND cb_유파.lang = ?
      LEFT JOIN T_CodeBase cb_장비 ON m.장비_code = cb_장비.code AND cb_장비.lang = ?
      LEFT JOIN T_CodeBase cb_무술 ON m.무술_code = cb_무술.code AND cb_무술.lang = ?
      LEFT JOIN T_CodeBase cb_스킬 ON m.스킬_code = cb_스킬.code AND cb_스킬.lang = ?
      LEFT JOIN T_이미지 img_유파 ON m.유파_img = img_유파.id
      LEFT JOIN T_이미지 img_장비 ON m.장비_img = img_장비.id
      LEFT JOIN T_이미지 img_무술 ON m.무술_img = img_무술.id
      LEFT JOIN T_이미지 img_스킬 ON m.스킬_img = img_스킬.id
      WHERE m.id = ?`,
      [lang, lang, lang, lang, id],
    )
    return results[0] || null
  }

  /**
   * 유파 코드로 조회 (다국어 지원)
   */
  async findBy유파Code(유파_code: string, lang: Lang = 'ko'): Promise<MartialHierarchyWithNames[]> {
    return await query<MartialHierarchyWithNames>(
      `SELECT 
        m.id,
        m.유파_code,
        m.장비_code,
        m.무술_code,
        m.스킬_code,
        m.순서,
        m.키보드_키,
        m.패드_키,
        m.유파_img,
        m.장비_img,
        m.무술_img,
        m.스킬_img,
        m.created_at,
        m.updated_at,
        cb_유파.code_nm AS 유파_name,
        cb_장비.code_nm AS 장비_name,
        cb_무술.code_nm AS 무술_name,
        cb_스킬.code_nm AS 스킬_name,
        img_유파.img_path AS 유파_img_path,
        img_장비.img_path AS 장비_img_path,
        img_무술.img_path AS 무술_img_path,
        img_스킬.img_path AS 스킬_img_path
      FROM ${this.tableName} m
      LEFT JOIN T_CodeBase cb_유파 ON m.유파_code = cb_유파.code AND cb_유파.lang = ?
      LEFT JOIN T_CodeBase cb_장비 ON m.장비_code = cb_장비.code AND cb_장비.lang = ?
      LEFT JOIN T_CodeBase cb_무술 ON m.무술_code = cb_무술.code AND cb_무술.lang = ?
      LEFT JOIN T_CodeBase cb_스킬 ON m.스킬_code = cb_스킬.code AND cb_스킬.lang = ?
      LEFT JOIN T_이미지 img_유파 ON m.유파_img = img_유파.id
      LEFT JOIN T_이미지 img_장비 ON m.장비_img = img_장비.id
      LEFT JOIN T_이미지 img_무술 ON m.무술_img = img_무술.id
      LEFT JOIN T_이미지 img_스킬 ON m.스킬_img = img_스킬.id
      WHERE m.유파_code = ?
      ORDER BY m.순서 ASC`,
      [lang, lang, lang, lang, 유파_code],
    )
  }
}
