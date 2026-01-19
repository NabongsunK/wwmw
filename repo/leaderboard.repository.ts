// 리더보드 레포지토리

import { query } from '@/lib/db';
import type { Leaderboard, CreateLeaderboardDto, LeaderboardRanking } from '@/types/leaderboard';

export class LeaderboardRepository {
  private tableName = 'T_리더보드';

  /**
   * 모든 리더보드 조회
   */
  async findAll(): Promise<Leaderboard[]> {
    return await query<Leaderboard>(
      `SELECT * FROM ${this.tableName} ORDER BY 점수 DESC, created_at ASC`
    );
  }

  /**
   * ID로 조회
   */
  async findById(id: number): Promise<Leaderboard | null> {
    const results = await query<Leaderboard>(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return results[0] || null;
  }

  /**
   * 사용자별 조회
   */
  async findByUserId(user_id: string): Promise<Leaderboard[]> {
    return await query<Leaderboard>(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY 점수 DESC, created_at DESC`,
      [user_id]
    );
  }

  /**
   * 유파별 조회
   */
  async findBy유파Code(유파_code: string): Promise<Leaderboard[]> {
    return await query<Leaderboard>(
      `SELECT * FROM ${this.tableName} WHERE 유파_code = ? ORDER BY 점수 DESC, created_at ASC`,
      [유파_code]
    );
  }

  /**
   * 기록일별 조회
   */
  async findBy기록일(기록일: Date | string): Promise<Leaderboard[]> {
    const dateStr = 기록일 instanceof Date ? 기록일.toISOString().split('T')[0] : 기록일;
    return await query<Leaderboard>(
      `SELECT * FROM ${this.tableName} WHERE 기록일 = ? ORDER BY 점수 DESC, created_at ASC`,
      [dateStr]
    );
  }

  /**
   * 전체 랭킹 조회 (View 사용)
   */
  async getRankings(limit?: number): Promise<LeaderboardRanking[]> {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    return await query<LeaderboardRanking>(
      `SELECT * FROM V_리더보드_전체 ${limitClause}`
    );
  }

  /**
   * 유파별 랭킹 조회 (View 사용)
   */
  async getRankingsBy유파(유파_code: string, limit?: number): Promise<LeaderboardRanking[]> {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    return await query<LeaderboardRanking>(
      `SELECT * FROM V_리더보드_유파별 WHERE 유파_code = ? ${limitClause}`,
      [유파_code]
    );
  }

  /**
   * 일별 랭킹 조회 (View 사용)
   */
  async getRankingsByDate(기록일: Date | string, limit?: number): Promise<LeaderboardRanking[]> {
    const dateStr = 기록일 instanceof Date ? 기록일.toISOString().split('T')[0] : 기록일;
    const limitClause = limit ? `LIMIT ${limit}` : '';
    return await query<LeaderboardRanking>(
      `SELECT * FROM V_리더보드_일별 WHERE 기록일 = ? ${limitClause}`,
      [dateStr]
    );
  }

  /**
   * 리더보드 기록 생성
   */
  async create(data: CreateLeaderboardDto): Promise<Leaderboard> {
    const 기록일 = data.기록일 
      ? (data.기록일 instanceof Date ? data.기록일.toISOString().split('T')[0] : data.기록일)
      : new Date().toISOString().split('T')[0];

    const result = await query<{ insertId: number }>(
      `INSERT INTO ${this.tableName} (user_id, 빌드보드_id, 점수, 유파_code, 기록일, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [data.user_id, data.빌드보드_id, data.점수, data.유파_code || null, 기록일]
    );

    const created = await this.findById(result[0].insertId);
    if (!created) {
      throw new Error('Failed to create leaderboard entry');
    }
    return created;
  }

  /**
   * 사용자의 최고 점수 조회
   */
  async getBestScoreByUserId(user_id: string): Promise<Leaderboard | null> {
    const results = await query<Leaderboard>(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY 점수 DESC LIMIT 1`,
      [user_id]
    );
    return results[0] || null;
  }
}
