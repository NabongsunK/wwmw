// 사용자별 리더보드 API 라우트

import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardService } from '@/service/leaderboard.service'

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
