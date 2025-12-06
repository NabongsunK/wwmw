// 사용자 레포지토리

import { query } from '@/lib/db';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

export class UserRepository {
  private tableName = 'users';

  /**
   * 모든 사용자 조회 (삭제되지 않은)
   */
  async findAll(): Promise<User[]> {
    return await query<User>(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: number): Promise<User | null> {
    const users = await query<User>(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return users[0] || null;
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    const users = await query<User>(
      `SELECT * FROM ${this.tableName} WHERE email = ? AND deleted_at IS NULL`,
      [email]
    );
    return users[0] || null;
  }

  /**
   * 사용자 생성
   */
  async create(data: CreateUserDto): Promise<User> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO ${this.tableName} (name, email, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
      [data.name, data.email]
    );
    
    const user = await this.findById(result[0].insertId);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  }

  /**
   * 사용자 업데이트
   */
  async update(id: number, data: UpdateUserDto): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }

    if (fields.length === 0) {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await query(
      `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * 사용자 삭제 (소프트 삭제)
   */
  async delete(id: number): Promise<void> {
    await query(
      `UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
  }

  /**
   * 사용자 영구 삭제
   */
  async hardDelete(id: number): Promise<void> {
    await query(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
  }
}

