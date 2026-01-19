// 빌드 서비스 (schema_simple.sql 기반)

import { BuildboardRepository } from '@/repo/buildboard.repository';
import type { Build, CreateBuildDto, UpdateBuildDto } from '@/types/build';

export class BuildService {
  private buildboardRepository: BuildboardRepository;

  constructor() {
    this.buildboardRepository = new BuildboardRepository();
  }

  /**
   * 모든 빌드 조회
   */
  async getAllBuilds(): Promise<Build[]> {
    return await this.buildboardRepository.findAll();
  }

  /**
   * ID로 빌드 조회 (무술, 비결, 심법 포함)
   */
  async getBuildById(id: number): Promise<Build> {
    if (id <= 0) {
      throw new Error('Invalid build ID');
    }

    const build = await this.buildboardRepository.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    return build;
  }

  /**
   * 빌드 생성 (무술 2개, 비결 8개, 심법 4개)
   */
  async createBuild(data: CreateBuildDto): Promise<Build> {
    // 비즈니스 검증
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Build name is required');
    }

    // 무술 개수 검증 (최대 2개)
    if (data.무술들 && data.무술들.length > 2) {
      throw new Error('무술은 최대 2개까지 선택 가능합니다');
    }

    // 비결 개수 검증 (최대 8개)
    if (data.비결들 && data.비결들.length > 8) {
      throw new Error('비결은 최대 8개까지 선택 가능합니다');
    }

    // 심법 개수 검증 (최대 4개)
    if (data.심법들 && data.심법들.length > 4) {
      throw new Error('심법은 최대 4개까지 선택 가능합니다');
    }

    // 빌드 생성
    return await this.buildboardRepository.create(data);
  }

  /**
   * 빌드 업데이트
   */
  async updateBuild(id: number, data: UpdateBuildDto): Promise<Build> {
    if (id <= 0) {
      throw new Error('Invalid build ID');
    }

    // 빌드 존재 확인
    const existingBuild = await this.buildboardRepository.findById(id);
    if (!existingBuild) {
      throw new Error('Build not found');
    }

    // 개수 검증
    if (data.무술들 && data.무술들.length > 2) {
      throw new Error('무술은 최대 2개까지 선택 가능합니다');
    }
    if (data.비결들 && data.비결들.length > 8) {
      throw new Error('비결은 최대 8개까지 선택 가능합니다');
    }
    if (data.심법들 && data.심법들.length > 4) {
      throw new Error('심법은 최대 4개까지 선택 가능합니다');
    }

    return await this.buildboardRepository.update(id, data);
  }

  /**
   * 빌드 삭제
   */
  async deleteBuild(id: number): Promise<void> {
    if (id <= 0) {
      throw new Error('Invalid build ID');
    }

    const build = await this.buildboardRepository.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    await this.buildboardRepository.delete(id);
  }
}

export default BuildService;