// 만사록 서비스

import { WanderingTalesRepository } from '@/repo/wanderingtales.repository'
import type { WanderingTales } from '@/types/wanderingtales'
import type { Lang } from '@/types/base'
import { CodeBaseRepository } from '@/repo/T_CodeBase.repository'
import { RegionRepository } from '@/repo/T_Region.repositiory'
import type { WanderingTalesRegion } from '@/types/wanderingtales'
export class WanderingTalesService {
  private wanderingTalesRepository: WanderingTalesRepository
  private codeBaseRepository: CodeBaseRepository
  private regionRepository: RegionRepository
  constructor() {
    this.wanderingTalesRepository = new WanderingTalesRepository()
    this.codeBaseRepository = new CodeBaseRepository()
    this.regionRepository = new RegionRepository()
  }

  /**
   * 모든 만사록 조회
   */
  async getAllWanderingTales(
    lang: Lang,
    region: string,
    subRegion: string,
  ): Promise<WanderingTales[]> {
    const region_code = await this.codeBaseRepository.findCodeByCodeName(lang, region)
    const subRegion_code = await this.codeBaseRepository.findCodeByCodeName(lang, subRegion)

    return await this.wanderingTalesRepository.findAll(lang, region_code, subRegion_code)
  }

  /**
   * ID로 만사록 조회
   */
  async getWanderingTalesById(id: number, lang: Lang): Promise<WanderingTales | null> {
    if (id <= 0) {
      return null
    }

    const wanderingTales = await this.wanderingTalesRepository.findById(id, lang)
    if (!wanderingTales) {
      return null
    }

    return wanderingTales
  }

  /**
   * 만사록 지역 조회
   */
  async getWanderingTalesRegion(lang: Lang): Promise<WanderingTalesRegion> {
    return {
      FirstRegion: await this.regionRepository.FirstRegion(lang),
      ThirdRegion: await this.regionRepository.ThirdRegion(lang),
    } as WanderingTalesRegion
  }
}
