// 사용자 API 라우트 (uid 기준)

import { NextRequest } from 'next/server'
import { responseOk, responseNotFound, responseServerError } from '@/lib/api-response'

/**
 * @swagger
 * /api/uid/{uid}:
 *   get:
 *     summary: uid 조회(검증). 조회 시 서비스에서 updated_at 터치.
 *     tags: [Uid]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: uid 정보 (uid, created_at, updated_at)
 *       404:
 *         description: uid 없음
 *       500:
 *         description: 서버 오류
 */
import { UidService } from '@/service/uid.service'

const uidService = new UidService()

/**
 * GET /api/uid/[uid] - uid 조회(검증)
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ uid: string }> }) {
  const { uid } = await context.params
  try {
    const data = await uidService.getByUid(uid)
    return responseOk(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch uid'
    if (message.includes('not found')) return responseNotFound(message)
    return responseServerError(message)
  }
}
