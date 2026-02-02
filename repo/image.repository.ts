// 이미지 레포지토리

import { query } from '@/lib/db'
import type { Image, CreateImageDto, UpdateImageDto, ImageType } from '@/types/image'

export class ImageRepository {
  private tableName = 'T_이미지'

  /**
   * 모든 이미지 조회
   */
  async findAll(): Promise<Image[]> {
    return await query<Image>(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`)
  }

  /**
   * ID로 조회
   */
  async findById(id: number): Promise<Image | null> {
    const results = await query<Image>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id])
    return results[0] || null
  }

  /**
   * 코드와 타입으로 조회
   */
  async findByCodeAndType(code: string, image_type: ImageType): Promise<Image | null> {
    const results = await query<Image>(
      `SELECT * FROM ${this.tableName} WHERE code = ? AND image_type = ?`,
      [code, image_type],
    )
    return results[0] || null
  }

  /**
   * 코드로 모든 이미지 조회
   */
  async findByCode(code: string): Promise<Image[]> {
    return await query<Image>(
      `SELECT * FROM ${this.tableName} WHERE code = ? ORDER BY image_type`,
      [code],
    )
  }

  /**
   * 타입별 조회
   */
  async findByType(image_type: ImageType): Promise<Image[]> {
    return await query<Image>(
      `SELECT * FROM ${this.tableName} WHERE image_type = ? ORDER BY created_at DESC`,
      [image_type],
    )
  }

  /**
   * 이미지 생성
   */
  async create(data: CreateImageDto): Promise<Image> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO ${this.tableName} (code, image_type, img_path, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [data.code, data.image_type, data.img_path],
    )

    const created = await this.findById(result[0].insertId)
    if (!created) {
      throw new Error('Failed to create image')
    }
    return created
  }

  /**
   * 이미지 업데이트
   */
  async update(id: number, data: UpdateImageDto): Promise<Image> {
    const fields: string[] = []
    const values: any[] = []

    if (data.code !== undefined) {
      fields.push('code = ?')
      values.push(data.code)
    }
    if (data.image_type !== undefined) {
      fields.push('image_type = ?')
      values.push(data.image_type)
    }
    if (data.img_path !== undefined) {
      fields.push('img_path = ?')
      values.push(data.img_path)
    }

    if (fields.length === 0) {
      const image = await this.findById(id)
      if (!image) {
        throw new Error('Image not found')
      }
      return image
    }

    fields.push('updated_at = NOW()')
    values.push(id)

    await query(`UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`, values)

    const updated = await this.findById(id)
    if (!updated) {
      throw new Error('Image not found')
    }
    return updated
  }

  /**
   * 이미지 삭제
   */
  async delete(id: number): Promise<void> {
    await query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id])
  }
}
