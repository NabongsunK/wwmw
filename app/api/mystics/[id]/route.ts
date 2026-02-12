// 비결 상세 API 라우트 (조회 전용)

import { NextRequest } from 'next/server'
import { responseOk, responseNotFound, responseServerError } from '@/lib/api-response'
import { MysticService } from '@/service/mystic.service'

/**
 * @swagger
 * /api/mystics/{id}:
 *   get:
 *     summary: ID로 비결 조회
 *     tags: [Mystics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 비결 상세
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 */
const mysticService = new MysticService()

/**
 * GET /api/mystics/[id] - ID로 비결 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const mystic = await mysticService.getById(id)
    return responseOk(mystic)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mystic'
    if (message.includes('not found')) return responseNotFound(message)
    return responseServerError(message)
  }
}
