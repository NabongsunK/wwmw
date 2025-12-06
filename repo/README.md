# Repositories

데이터 접근 계층을 담당하는 레포지토리 레이어입니다.

## 구조

- 각 도메인별로 레포지토리 파일을 생성합니다
- `lib/db.ts`의 `query` 함수를 사용하여 데이터베이스에 접근합니다
- 순수한 데이터 CRUD 작업만 수행합니다

## 사용 예시

```typescript
// repositories/user.repository.ts
import { query } from '@/lib/db';
import type { User, CreateUserDto } from '@/types/user';

export class UserRepository {
  async findAll(): Promise<User[]> {
    return await query<User>('SELECT * FROM users WHERE deleted_at IS NULL');
  }

  async findById(id: number): Promise<User | null> {
    const users = await query<User>(
      'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return users[0] || null;
  }

  async create(data: CreateUserDto): Promise<User> {
    const result = await query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [data.name, data.email]
    );
    return await this.findById(result.insertId);
  }

  async update(id: number, data: Partial<CreateUserDto>): Promise<User> {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    await query(
      `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
    
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await query(
      'UPDATE users SET deleted_at = NOW() WHERE id = ?',
      [id]
    );
  }
}
```

