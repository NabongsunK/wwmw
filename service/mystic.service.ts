// 비결 서비스 (조회 전용)

import { MysticRepository } from '@/repo/mystic.repository'
import type { Mystic } from '@/types/mystic'

export class MysticService {
  private mysticRepository: MysticRepository

  constructor() {
    this.mysticRepository = new MysticRepository()
  }

  /**
   * 모든 비결 조회
   */
  async getAll(): Promise<Mystic[]> {
    return await this.mysticRepository.findAll()
  }

  /**
   * ID로 조회
   */
  async getById(id: number): Promise<Mystic> {
    if (id <= 0) {
      throw new Error('Invalid ID')
    }

    const mystic = await this.mysticRepository.findById(id)
    if (!mystic) {
      throw new Error('Mystic not found')
    }

    return mystic
  }
}
