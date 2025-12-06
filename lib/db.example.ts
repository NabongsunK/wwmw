// 데이터베이스 사용 예시

import { query, transaction } from './db';

// 예시 1: 간단한 SELECT 쿼리
export async function getUsers() {
  const users = await query<{ id: number; name: string; email: string }>(
    'SELECT * FROM users'
  );
  return users;
}

// 예시 2: 파라미터를 사용한 쿼리
export async function getUserById(id: number) {
  const users = await query<{ id: number; name: string; email: string }>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return users[0];
}

// 예시 3: INSERT 쿼리
export async function createUser(name: string, email: string) {
  const result = await query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email]
  );
  return result;
}

// 예시 4: 트랜잭션 사용
export async function transferMoney(fromId: number, toId: number, amount: number) {
  return await transaction(async (connection) => {
    // 출금
    await connection.execute(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, fromId]
    );
    
    // 입금
    await connection.execute(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, toId]
    );
    
    return { success: true };
  });
}

