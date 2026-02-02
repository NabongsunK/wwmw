// 이미지 서비스

import { ImageRepository } from '@/repo/image.repository'
import type { Image, CreateImageDto, UpdateImageDto, ImageType } from '@/types/image'

export class ImageService {
  private imageRepository: ImageRepository

  constructor() {
    this.imageRepository = new ImageRepository()
  }

  /**
   * 모든 이미지 조회
   */
  async getAll(): Promise<Image[]> {
    return await this.imageRepository.findAll()
  }

  /**
   * ID로 조회
   */
  async getById(id: number): Promise<Image> {
    if (id <= 0) {
      throw new Error('Invalid ID')
    }

    const image = await this.imageRepository.findById(id)
    if (!image) {
      throw new Error('Image not found')
    }

    return image
  }

  /**
   * 코드와 타입으로 조회
   */
  async getByCodeAndType(code: string, image_type: ImageType): Promise<Image | null> {
    return await this.imageRepository.findByCodeAndType(code, image_type)
  }

  /**
   * 코드로 모든 이미지 조회
   */
  async getByCode(code: string): Promise<Image[]> {
    return await this.imageRepository.findByCode(code)
  }

  /**
   * 타입별 조회
   */
  async getByType(image_type: ImageType): Promise<Image[]> {
    return await this.imageRepository.findByType(image_type)
  }

  /**
   * 이미지 생성
   */
  async create(data: CreateImageDto): Promise<Image> {
    if (!data.code || data.code.trim().length === 0) {
      throw new Error('Code is required')
    }
    if (!data.image_type) {
      throw new Error('Image type is required')
    }
    if (!data.img_path || data.img_path.trim().length === 0) {
      throw new Error('Image path is required')
    }

    return await this.imageRepository.create(data)
  }

  /**
   * 이미지 업데이트
   */
  async update(id: number, data: UpdateImageDto): Promise<Image> {
    if (id <= 0) {
      throw new Error('Invalid ID')
    }

    const existing = await this.imageRepository.findById(id)
    if (!existing) {
      throw new Error('Image not found')
    }

    return await this.imageRepository.update(id, data)
  }

  /**
   * 이미지 삭제
   */
  async delete(id: number): Promise<void> {
    if (id <= 0) {
      throw new Error('Invalid ID')
    }

    const image = await this.imageRepository.findById(id)
    if (!image) {
      throw new Error('Image not found')
    }

    await this.imageRepository.delete(id)
  }
}
