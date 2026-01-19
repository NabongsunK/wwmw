import mysql from 'mysql2/promise';

// 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'wwe_user',
  password: process.env.MYSQL_PASSWORD || 'wwe_password',
  database: process.env.MYSQL_DATABASE || 'wwe_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// 연결 테스트 함수
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { success: true, message: 'MySQL 연결 성공' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'MySQL 연결 실패' 
    };
  }
}

// 쿼리 실행 헬퍼 함수
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// 트랜잭션 헬퍼 함수
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;

