// 무술계층 서비스 (조회 전용)

import { MartialRepository } from '@/repo/martial.repository';
import type { MartialHierarchyWithNames, Lang } from '@/types/martial';

export class MartialService {
  private martialRepository: MartialRepository;

  constructor() {
    this.martialRepository = new MartialRepository();
  }

  /**
   * 모든 무술계층 조회 (다국어 지원)
   */
  async getAll(lang: Lang = 'ko'): Promise<MartialHierarchyWithNames[]> {
    return await this.martialRepository.findAll(lang);
  }

  /**
   * ID로 조회 (다국어 지원)
   */
  async getById(id: number, lang: Lang = 'ko'): Promise<MartialHierarchyWithNames> {
    if (id <= 0) {
      throw new Error('Invalid ID');
    }

    const item = await this.martialRepository.findById(id, lang);
    if (!item) {
      throw new Error('Martial hierarchy not found');
    }

    return item;
  }

  /**
   * 유파 코드로 조회 (다국어 지원)
   */
  async getBy유파Code(유파_code: string, lang: Lang = 'ko'): Promise<MartialHierarchyWithNames[]> {
    return await this.martialRepository.findBy유파Code(유파_code, lang);
  }
}
