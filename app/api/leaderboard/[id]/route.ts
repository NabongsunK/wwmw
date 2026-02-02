// 리더보드 상세 API 라우트

import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardService } from '@/service/leaderboard.service'

const leaderboardService = new LeaderboardService()

/**
 * GET /api/leaderboard/[id] - ID로 리더보드 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const entry = await leaderboardService.getById(id)
    return NextResponse.json({ success: true, data: entry }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch leaderboard entry',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 },
    )
  }
}
