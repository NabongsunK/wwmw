// 사용자별 리더보드 API 라우트

import { NextRequest, NextResponse } from 'next/server'
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
      return NextResponse.json({ success: true, data: bestScore }, { status: 200 })
    }

    const entries = await leaderboardService.getByUserId(params.user_id)
    return NextResponse.json({ success: true, data: entries }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
      },
      { status: 500 },
    )
  }
}
