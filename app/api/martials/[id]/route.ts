// 무술계층 상세 API 라우트 (조회 전용)

import { NextRequest, NextResponse } from 'next/server'
import { MartialService } from '@/service/martial.service'
import type { Lang } from '@/types/martial'

/**
 * @swagger
 * /api/martials/{id}:
 *   get:
 *     summary: ID로 무술계층 조회 (다국어 지원)
 *     tags: [Martials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [ko, en, ja, zh]
 *           default: ko
 *     responses:
 *       200:
 *         description: 무술계층 상세
 *       400:
 *         description: 잘못된 lang
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 */
const martialService = new MartialService()

/**
 * GET /api/martials/[id] - ID로 무술계층 조회 (다국어 지원)
 * Query: ?lang=ko|en|ja|zh
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lang = (searchParams.get('lang') || 'ko') as Lang
    const id = parseInt(params.id)

    // 언어 유효성 검사
    if (!['ko', 'en', 'ja', 'zh'].includes(lang)) {
      return NextResponse.json(
        { success: false, message: 'Invalid lang parameter. Use: ko, en, ja, zh' },
        { status: 400 },
      )
    }

    const item = await martialService.getById(id, lang)
    return NextResponse.json({ success: true, data: item }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch martial',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 },
    )
  }
}
