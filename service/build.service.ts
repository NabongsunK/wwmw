// 빌드 서비스

import { BuildRepository } from '@/repo/build.repository';
import type { Build, CreateBuildDto, UpdateBuildDto } from '@/types/build';

export class BuildService {
  private buildRepository: BuildRepository;

  constructor() {
    this.buildRepository = new BuildRepository();
  }

  /**
   * 모든 빌드 조회
   */
  async getAllBuilds(): Promise<Build[]> {
    return await this.buildRepository.findAll();
  }

  /**
   * ID로 빌드 조회
   */
  async getBuildById(id: number): Promise<Build> {
    if (id <= 0) {
      throw new Error('Invalid build ID');
    }

    const build = await this.buildRepository.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    return build;
  }

  /**
   * 빌드 생성
   */
  async createBuild(data: CreateBuildDto): Promise<Build> {
    // 비즈니스 검증
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Build name is required');
    }

    // 빌드 생성
    return await this.buildRepository.create(data);
  }

  /**
   * 빌드 업데이트
   */
  async updateBuild(id: number, data: UpdateBuildDto): Promise<Build> {
    if (id <= 0) {
      throw new Error('Invalid build ID');
    }

    // 빌드 존재 확인
    const existingBuild = await this.buildRepository.findById(id);
    if (!existingBuild) {
      throw new Error('Build not found');
    }

    return await this.buildRepository.update(id, data);
  }

  /**
   * 빌드 삭제
   */
  async deleteBuild(id: number): Promise<void> {
    if (id <= 0) {
      throw new Error('Invalid build ID');
    }

    const build = await this.buildRepository.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    await this.buildRepository.delete(id);
  }
}

