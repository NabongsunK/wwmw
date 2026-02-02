// 비결 API 라우트 (조회 전용)

import { NextResponse } from 'next/server'
import { MysticService } from '@/service/mystic.service'

const mysticService = new MysticService()

/**
 * GET /api/mystics - 모든 비결 조회
 */
export async function GET() {
  try {
    const mystics = await mysticService.getAll()
    return NextResponse.json({ success: true, data: mystics }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch mystics',
      },
      { status: 500 },
    )
  }
}
