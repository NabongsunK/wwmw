// 빌드보드 레포지토리 (schema_simple.sql 기반)

import { query, transaction } from '@/lib/db'
import type { Build, CreateBuildDto, UpdateBuildDto } from '@/types/build'

export class BuildboardRepository {
  private tableName = 'T_빌드보드'
  private martialTable = 'T_빌드보드_무술'
  private secretTable = 'T_빌드보드_비결'
  private methodTable = 'T_빌드보드_심법'

  /**
   * 모든 빌드보드 조회 (삭제되지 않은, 좋아요 수 포함)
   */
  async findAll(): Promise<Build[]> {
    return await query<Build>(
      `SELECT b.*,
        (SELECT COUNT(*) FROM T_빌드보드_좋아요 l WHERE l.빌드보드_id = b.id) AS 좋아요수
       FROM ${this.tableName} b
       WHERE b.deleted_at IS NULL
       ORDER BY b.created_at DESC`,
    )
  }

  /**
   * ID로 빌드보드 조회 (View 사용 - 무술, 비결, 심법, 좋아요 수 포함)
   */
  async findById(id: number): Promise<Build | null> {
    const results = await query<any>(
      `SELECT v.*,
        (SELECT COUNT(*) FROM T_빌드보드_좋아요 l WHERE l.빌드보드_id = v.id) AS 좋아요수
       FROM V_빌드보드_전체 v WHERE v.id = ?`,
      [id],
    )
    return results[0] || null
  }

  /**
   * 빌드보드 생성 (무술, 비결, 심법 관계 포함)
   */
  async create(data: CreateBuildDto): Promise<Build> {
    return await transaction(async (conn) => {
      // 현재 활성 버전 조회
      const [versionResult] = (await conn.execute(
        `SELECT id FROM T_게임버전 WHERE is_active = TRUE LIMIT 1`,
      )) as any
      const version_id = versionResult && versionResult[0] ? versionResult[0].id : null

      // 빌드보드 생성 (작성자 uid 저장)
      const [buildResult] = (await conn.execute(
        `INSERT INTO ${this.tableName} (name, description, category, version_id, status, user_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          data.name,
          data.description || null,
          data.category,
          version_id,
          data.status || 'active',
          data.uid || null,
        ],
      )) as any

      const 빌드보드_id = buildResult.insertId

      // 무술 관계 추가 (최대 2개)
      if (data.무술들 && data.무술들.length > 0) {
        const 무술들 = data.무술들.slice(0, 2) // 최대 2개
        for (let i = 0; i < 무술들.length; i++) {
          await conn.execute(
            `INSERT INTO ${this.martialTable} (빌드보드_id, 무술계층_id, 순서, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [빌드보드_id, 무술들[i].id, 무술들[i].순서 || i + 1],
          )
        }
      }

      // 비결 관계 추가 (최대 8개)
      if (data.비결들 && data.비결들.length > 0) {
        const 비결들 = data.비결들.slice(0, 8) // 최대 8개
        for (let i = 0; i < 비결들.length; i++) {
          await conn.execute(
            `INSERT INTO ${this.secretTable} (빌드보드_id, 비결_id, 순서, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [빌드보드_id, 비결들[i].id, 비결들[i].순서 || i + 1],
          )
        }
      }

      // 심법 관계 추가 (최대 4개)
      if (data.심법들 && data.심법들.length > 0) {
        const 심법들 = data.심법들.slice(0, 4) // 최대 4개
        for (let i = 0; i < 심법들.length; i++) {
          await conn.execute(
            `INSERT INTO ${this.methodTable} (빌드보드_id, 심법_id, 순서, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [빌드보드_id, 심법들[i].id, 심법들[i].순서 || i + 1],
          )
        }
      }

      // 생성된 빌드보드 조회
      const [builds] = (await conn.execute(`SELECT * FROM V_빌드보드_전체 WHERE id = ?`, [
        빌드보드_id,
      ])) as any

      if (!builds || builds.length === 0) {
        throw new Error('Failed to create buildboard')
      }

      return builds[0]
    })
  }

  /**
   * 빌드보드 업데이트
   */
  async update(id: number, data: UpdateBuildDto): Promise<Build> {
    return await transaction(async (conn) => {
      const fields: string[] = []
      const values: any[] = []

      if (data.name !== undefined) {
        fields.push('name = ?')
        values.push(data.name)
      }
      if (data.description !== undefined) {
        fields.push('description = ?')
        values.push(data.description)
      }
      if (data.category !== undefined) {
        fields.push('category = ?')
        values.push(data.category)
      }
      if (data.status !== undefined) {
        fields.push('status = ?')
        values.push(data.status)
      }

      if (fields.length > 0) {
        fields.push('updated_at = NOW()')
        values.push(id)
        await conn.execute(`UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`, values)
      }

      // 관계 업데이트
      if (data.무술들 !== undefined) {
        // 기존 무술 관계 삭제
        await conn.execute(`DELETE FROM ${this.martialTable} WHERE 빌드보드_id = ?`, [id])
        // 새 무술 관계 추가
        const 무술들 = data.무술들.slice(0, 2)
        for (let i = 0; i < 무술들.length; i++) {
          await conn.execute(
            `INSERT INTO ${this.martialTable} (빌드보드_id, 무술계층_id, 순서, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [id, 무술들[i].id, 무술들[i].순서 || i + 1],
          )
        }
      }

      if (data.비결들 !== undefined) {
        await conn.execute(`DELETE FROM ${this.secretTable} WHERE 빌드보드_id = ?`, [id])
        const 비결들 = data.비결들.slice(0, 8)
        for (let i = 0; i < 비결들.length; i++) {
          await conn.execute(
            `INSERT INTO ${this.secretTable} (빌드보드_id, 비결_id, 순서, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [id, 비결들[i].id, 비결들[i].순서 || i + 1],
          )
        }
      }

      if (data.심법들 !== undefined) {
        await conn.execute(`DELETE FROM ${this.methodTable} WHERE 빌드보드_id = ?`, [id])
        const 심법들 = data.심법들.slice(0, 4)
        for (let i = 0; i < 심법들.length; i++) {
          await conn.execute(
            `INSERT INTO ${this.methodTable} (빌드보드_id, 심법_id, 순서, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [id, 심법들[i].id, 심법들[i].순서 || i + 1],
          )
        }
      }

      // 업데이트된 빌드보드 조회
      const [builds] = (await conn.execute(`SELECT * FROM V_빌드보드_전체 WHERE id = ?`, [
        id,
      ])) as any

      if (!builds || builds.length === 0) {
        throw new Error('Buildboard not found')
      }

      return builds[0]
    })
  }

  /**
   * 빌드보드 삭제 (소프트 삭제)
   */
  async delete(id: number): Promise<void> {
    await query(`UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = ?`, [id])
  }
}
