// uid 레포지토리 (T_UID)

import { query } from '@/lib/db'
import type { Uid, CreateUidDto } from '@/types/uid'

export class UidRepository {
  private tableName = 'T_UID'

  /**
   * uid로 조회
   */
  async findByUid(uid: string): Promise<Uid | null> {
    const rows = await query<Uid>(`SELECT * FROM ${this.tableName} WHERE uid = ?`, [uid])
    return rows[0] || null
  }

  /**
   * uid 등록 (INSERT)
   */
  async create(data: CreateUidDto): Promise<Uid> {
    if (!data?.uid || typeof data.uid !== 'string') {
      throw new Error('Uid is required')
    }
    console.warn(
      `INSERT INTO ${this.tableName} (uid, created_at, updated_at) VALUES (${data.uid}, NOW(), NOW())`,
      [data.uid],
    )
    await query(
      `INSERT INTO ${this.tableName} (uid, created_at, updated_at) VALUES (?, NOW(), NOW())`,
      [data.uid],
    )
    const row = await this.findByUid(data.uid)
    if (!row) {
      throw new Error('Failed to create uid')
    }
    return row
  }

  /**
   * updated_at 갱신 (PATCH 시 레코드 터치용, 나중에 user 연동 시 확장)
   */
  async touch(uid: string): Promise<Uid> {
    await query(`UPDATE ${this.tableName} SET updated_at = NOW() WHERE uid = ?`, [uid])
    const row = await this.findByUid(uid)
    if (!row) {
      throw new Error('Uid not found')
    }
    return row
  }
}
