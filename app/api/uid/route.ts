// 사용자 API 라우트 (uid 기준)

import { NextRequest } from 'next/server'
import { responseCreated, responseBadRequest } from '@/lib/api-response'

/**
 * @swagger
 * /api/uid:
 *   post:
 *     summary: uid 등록(최초 생성). 서버에서 uid(UUID) 생성 후 반환.
 *     tags: [Uid]
 *     responses:
 *       201:
 *         description: 생성됨. body.data 에 uid, created_at, updated_at 포함.
 *       400:
 *         description: 잘못된 요청
 */
import { UidService } from '@/service/uid.service'

const uidService = new UidService()

/**
 * POST /api/uid - uid 등록(최초 생성). 서버에서 uid(UUID) 생성 후 반환.
 */
export async function POST(_request: NextRequest) {
  try {
    const data = await uidService.create()
    return responseCreated(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create uid'
    return responseBadRequest(message)
  }
}
