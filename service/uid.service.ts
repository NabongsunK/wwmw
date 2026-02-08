// uid 서비스 (T_유저_uid)

import { UidRepository } from '@/repo/uid.repository'
import type { Uid } from '@/types/uid'

/** uid 허용 길이 (필요 시 조정) */
const UID_MIN_LENGTH = 1
const UID_MAX_LENGTH = 255

export class UidService {
  private uidRepository: UidRepository

  constructor() {
    this.uidRepository = new UidRepository()
  }

  /**
   * uid 존재 여부
   */
  async exists(uid: string): Promise<boolean> {
    if (!uid || uid.trim().length === 0) {
      return false
    }
    const row = await this.uidRepository.findByUid(uid)
    return row !== null
  }

  /**
   * uid로 조회 (없으면 throw). 조회 시 서비스에서 자동으로 touch(updated_at 갱신).
   */
  async getByUid(uid: string): Promise<Uid> {
    this.validateUid(uid)
    const row = await this.uidRepository.findByUid(uid)
    if (!row) {
      throw new Error('Uid not found')
    }
    return await this.uidRepository.touch(uid)
  }

  /**
   * uid 터치 (updated_at 갱신). 리더보드/좋아요 등 다른 서비스에서 활성 시 호출용.
   */
  async touch(uid: string): Promise<void> {
    if (!uid || uid.trim().length === 0) return
    const row = await this.uidRepository.findByUid(uid)
    if (row) {
      await this.uidRepository.touch(uid)
    }
  }

  /**
   * uid 등록 (최초 생성). 서버에서 uid(UUID) 생성 후 저장해 반환.
   */
  async create(): Promise<Uid> {
    const uid = crypto.randomUUID()
    return await this.uidRepository.create({ uid })
  }

  private validateUid(uid: string): void {
    if (!uid || typeof uid !== 'string') {
      throw new Error('Uid is required')
    }
    const trimmed = uid.trim()
    if (trimmed.length < UID_MIN_LENGTH) {
      throw new Error('Uid is required')
    }
    if (trimmed.length > UID_MAX_LENGTH) {
      throw new Error(`Uid must be at most ${UID_MAX_LENGTH} characters`)
    }
  }
}
