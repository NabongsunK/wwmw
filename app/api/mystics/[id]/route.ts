// 비결 상세 API 라우트 (조회 전용)

import { NextRequest, NextResponse } from 'next/server'
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
    return NextResponse.json({ success: true, data: mystic }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch mystic',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 },
    )
  }
}
