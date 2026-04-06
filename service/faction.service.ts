// 유파 서비스

import { FactionRepository, type Faction } from '@/repo/faction.repository'
import type { Lang } from '@/types/base'

export class FactionService {
  private factionRepository: FactionRepository

  constructor() {
    this.factionRepository = new FactionRepository()
  }

  /**
   * 모든 유파 조회 (다국어 지원)
   */
  async getAll(lang: Lang): Promise<Faction[]> {
    return await this.factionRepository.findAll(lang)
  }

  async getAllExceptCommon(lang: Lang): Promise<Faction[]> {
    const factions = await this.factionRepository.findAll(lang)
    return factions.filter((faction) => faction.code !== '1001000')
  }
}
