// 비결 서비스 (조회 전용)

import { MysticRepository } from '@/repo/mystic.repository'
import type { Mystic } from '@/types/mystic'
import type { Lang } from '@/types/martial'

export class MysticService {
  private mysticRepository: MysticRepository

  constructor() {
    this.mysticRepository = new MysticRepository()
  }

  /**
   * 모든 비결 조회 (다국어 지원)
   */
  async getAll(lang: Lang): Promise<Mystic[]> {
    return await this.mysticRepository.findAll(lang)
  }

  /**
   * ID로 조회 (다국어 지원)
   */
  async getById(id: number, lang: Lang): Promise<Mystic> {
    if (id <= 0) {
      throw new Error('Invalid ID')
    }

    const mystic = await this.mysticRepository.findById(id, lang)
    if (!mystic) {
      throw new Error('Mystic not found')
    }

    return mystic
  }
}
