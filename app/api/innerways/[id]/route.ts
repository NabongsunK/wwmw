// 심법 상세 API 라우트 (조회 전용)

import { NextRequest, NextResponse } from 'next/server'
import { InnerwayService } from '@/service/innerway.service'

/**
 * @swagger
 * /api/innerways/{id}:
 *   get:
 *     summary: ID로 심법 조회
 *     tags: [Innerways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 심법 상세
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 */
const innerwayService = new InnerwayService()

/**
 * GET /api/innerways/[id] - ID로 심법 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const innerway = await innerwayService.getById(id)
    return NextResponse.json({ success: true, data: innerway }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch innerway',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 },
    )
  }
}
