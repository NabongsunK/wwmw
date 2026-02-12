// 비결 API 라우트 (조회 전용)

import { responseOk, responseServerError } from '@/lib/api-response'
import { MysticService } from '@/service/mystic.service'

/**
 * @swagger
 * /api/mystics:
 *   get:
 *     summary: 모든 비결 조회
 *     tags: [Mystics]
 *     responses:
 *       200:
 *         description: 비결 목록
 *       500:
 *         description: 서버 오류
 */
const mysticService = new MysticService()

/**
 * GET /api/mystics - 모든 비결 조회
 */
export async function GET() {
  try {
    const mystics = await mysticService.getAll()
    return responseOk(mystics)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mystics'
    return responseServerError(message)
  }
}
