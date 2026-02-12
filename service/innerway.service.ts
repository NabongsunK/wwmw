// 심법 서비스 (조회 전용)

import { InnerwayRepository } from '@/repo/innerway.repository'
import type { Innerway } from '@/types/innerway'
import type { Lang } from '@/types/martial'

export class InnerwayService {
  private innerwayRepository: InnerwayRepository

  constructor() {
    this.innerwayRepository = new InnerwayRepository()
  }

  /**
   * 모든 심법 조회
   */
  async getAll(lang: Lang): Promise<Innerway[]> {
    return await this.innerwayRepository.findAll(lang)
  }

  /**
   * ID로 조회 (다국어 지원)
   */
  async getById(id: number, lang: Lang): Promise<Innerway> {
    if (id <= 0) {
      throw new Error('Invalid ID')
    }

    const innerway = await this.innerwayRepository.findById(id, lang)
    if (!innerway) {
      throw new Error('Innerway not found')
    }

    return innerway
  }

  /**
   * 유파 코드로 심법 조회
   */
  async getBy유파Code(유파_code: string): Promise<Innerway[]> {
    return await this.innerwayRepository.findBy유파Code(유파_code)
  }

  /**
   * 등급별 조회
   */
  async getBy등급(등급: number): Promise<Innerway[]> {
    return await this.innerwayRepository.findBy등급(등급)
  }
}
