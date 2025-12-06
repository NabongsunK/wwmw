// 빌드 레포지토리

import { query } from '@/lib/db';
import type { Build, CreateBuildDto, UpdateBuildDto } from '@/types/build';

export class BuildRepository {
  private tableName = 'builds';

  /**
   * 모든 빌드 조회 (삭제되지 않은)
   */
  async findAll(): Promise<Build[]> {
    return await query<Build>(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
  }

  /**
   * ID로 빌드 조회
   */
  async findById(id: number): Promise<Build | null> {
    const builds = await query<Build>(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return builds[0] || null;
  }

  /**
   * 빌드 생성
   */
  async create(data: CreateBuildDto): Promise<Build> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO ${this.tableName} (name, description, version, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [data.name, data.description || null, data.version || null, data.status || 'active']
    );
    
    const build = await this.findById(result[0].insertId);
    if (!build) {
      throw new Error('Failed to create build');
    }
    return build;
  }

  /**
   * 빌드 업데이트
   */
  async update(id: number, data: UpdateBuildDto): Promise<Build> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.version !== undefined) {
      fields.push('version = ?');
      values.push(data.version);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) {
      const build = await this.findById(id);
      if (!build) {
        throw new Error('Build not found');
      }
      return build;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await query(
      `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const build = await this.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }
    return build;
  }

  /**
   * 빌드 삭제 (소프트 삭제)
   */
  async delete(id: number): Promise<void> {
    await query(
      `UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
  }
}

