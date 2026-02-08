// 사용자별 리더보드 API 라우트

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { LeaderboardService } from '@/service/leaderboard.service'

/**
 * @swagger
 * /api/leaderboard/users/{user_id}:
 *   get:
 *     summary: 사용자별 리더보드 조회
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: best
 *         schema:
 *           type: boolean
 *         description: true면 최고 점수만
 *     responses:
 *       200:
 *         description: 리더보드 목록 또는 최고 점수
 *       500:
 *         description: 서버 오류
 */
const leaderboardService = new LeaderboardService()

/**
 * GET /api/leaderboard/users/[user_id] - 사용자별 리더보드 조회
 * Query: ?best=true (최고 점수만)
 */
export async function GET(request: NextRequest, { params }: { params: { user_id: string } }) {
  try {
    const searchParams = request.nextUrl.searchParams
    const best = searchParams.get('best') === 'true'

    if (best) {
      const bestScore = await leaderboardService.getBestScoreByUserId(params.user_id)
      return responseOk(bestScore)
    }

    const entries = await leaderboardService.getByUserId(params.user_id)
    return responseOk(entries)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard'
    return responseServerError(message)
  }
}
