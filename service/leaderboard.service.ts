// 리더보드 서비스

import { LeaderboardRepository } from '@/repo/leaderboard.repository'
import type { Leaderboard, CreateLeaderboardDto, LeaderboardRanking } from '@/types/leaderboard'

export class LeaderboardService {
  private leaderboardRepository: LeaderboardRepository

  constructor() {
    this.leaderboardRepository = new LeaderboardRepository()
  }

  /**
   * 모든 리더보드 조회
   */
  async getAll(): Promise<Leaderboard[]> {
    return await this.leaderboardRepository.findAll()
  }

  /**
   * ID로 조회
   */
  async getById(id: number): Promise<Leaderboard> {
    if (id <= 0) {
      throw new Error('Invalid ID')
    }

    const entry = await this.leaderboardRepository.findById(id)
    if (!entry) {
      throw new Error('Leaderboard entry not found')
    }

    return entry
  }

  /**
   * 사용자별 조회
   */
  async getByUserId(user_id: string): Promise<Leaderboard[]> {
    return await this.leaderboardRepository.findByUserId(user_id)
  }

  /**
   * 유파별 조회
   */
  async getBy유파Code(유파_code: string): Promise<Leaderboard[]> {
    return await this.leaderboardRepository.findBy유파Code(유파_code)
  }

  /**
   * 기록일별 조회
   */
  async getBy기록일(기록일: Date | string): Promise<Leaderboard[]> {
    return await this.leaderboardRepository.findBy기록일(기록일)
  }

  /**
   * 전체 랭킹 조회
   */
  async getRankings(limit?: number): Promise<LeaderboardRanking[]> {
    return await this.leaderboardRepository.getRankings(limit)
  }

  /**
   * 유파별 랭킹 조회
   */
  async getRankingsBy유파(유파_code: string, limit?: number): Promise<LeaderboardRanking[]> {
    return await this.leaderboardRepository.getRankingsBy유파(유파_code, limit)
  }

  /**
   * 일별 랭킹 조회
   */
  async getRankingsByDate(기록일: Date | string, limit?: number): Promise<LeaderboardRanking[]> {
    return await this.leaderboardRepository.getRankingsByDate(기록일, limit)
  }

  /**
   * 리더보드 기록 생성
   */
  async create(data: CreateLeaderboardDto): Promise<Leaderboard> {
    if (!data.user_id || data.user_id.trim().length === 0) {
      throw new Error('User ID is required')
    }
    if (data.빌드보드_id <= 0) {
      throw new Error('Invalid 빌드보드 ID')
    }
    if (data.점수 < 0) {
      throw new Error('Score must be non-negative')
    }

    return await this.leaderboardRepository.create(data)
  }

  /**
   * 사용자의 최고 점수 조회
   */
  async getBestScoreByUserId(user_id: string): Promise<Leaderboard | null> {
    return await this.leaderboardRepository.getBestScoreByUserId(user_id)
  }
}
