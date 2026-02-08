// 사용자 API 라우트 (uid 기준)

import { NextRequest } from 'next/server'
import {
  responseOk,
  responseCreated,
  responseBadRequest,
  responseNotFound,
  responseServerError,
} from '@/lib/api-response'

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
 *         description: 프로필 정보
 *       500:
 *         description: 서버 오류
 *   post:
 *     summary: uid 등록(최초 생성)
 *     tags: [Uid]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: 생성됨
 *       400:
 *         description: 잘못된 요청
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

/**
 * POST /api/uid - uid 등록(최초 생성). 있으면 기존 반환.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await uidService.create(body)
    return responseCreated(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create uid'
    return responseBadRequest(message)
  }
}
