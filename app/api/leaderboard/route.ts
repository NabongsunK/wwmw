// 리더보드 API 라우트

import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardService } from '@/service/leaderboard.service'

const leaderboardService = new LeaderboardService()

/**
 * GET /api/leaderboard - 리더보드 조회
 * Query: ?user_id=xxx&유파_code=xxx&기록일=2024-01-01&ranking=true&limit=100
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')
    const 유파_code = searchParams.get('유파_code')
    const 기록일 = searchParams.get('기록일')
    const ranking = searchParams.get('ranking') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    // 랭킹 조회
    if (ranking) {
      if (유파_code) {
        const rankings = await leaderboardService.getRankingsBy유파(유파_code, limit)
        return NextResponse.json({ success: true, data: rankings }, { status: 200 })
      }
      if (기록일) {
        const rankings = await leaderboardService.getRankingsByDate(기록일, limit)
        return NextResponse.json({ success: true, data: rankings }, { status: 200 })
      }
      const rankings = await leaderboardService.getRankings(limit)
      return NextResponse.json({ success: true, data: rankings }, { status: 200 })
    }

    // 일반 조회
    if (user_id) {
      const entries = await leaderboardService.getByUserId(user_id)
      return NextResponse.json({ success: true, data: entries }, { status: 200 })
    }

    if (유파_code) {
      const entries = await leaderboardService.getBy유파Code(유파_code)
      return NextResponse.json({ success: true, data: entries }, { status: 200 })
    }

    if (기록일) {
      const entries = await leaderboardService.getBy기록일(기록일)
      return NextResponse.json({ success: true, data: entries }, { status: 200 })
    }

    const entries = await leaderboardService.getAll()
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

/**
 * POST /api/leaderboard - 리더보드 기록 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entry = await leaderboardService.create(body)
    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create leaderboard entry',
      },
      { status: 400 },
    )
  }
}
