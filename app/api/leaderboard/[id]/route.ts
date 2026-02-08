// 리더보드 상세 API 라우트

import { NextRequest } from 'next/server'
import { responseOk, responseNotFound, responseServerError } from '@/lib/api-response'
import { LeaderboardService } from '@/service/leaderboard.service'

/**
 * @swagger
 * /api/leaderboard/{id}:
 *   get:
 *     summary: ID로 리더보드 조회
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 리더보드 상세
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 */
const leaderboardService = new LeaderboardService()

/**
 * GET /api/leaderboard/[id] - ID로 리더보드 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const entry = await leaderboardService.getById(id)
    return responseOk(entry)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard entry'
    if (message.includes('not found')) return responseNotFound(message)
    return responseServerError(message)
  }
}
