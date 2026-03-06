// 무술계층 API 라우트 (조회 전용)

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { MartialService } from '@/service/martial.service'
import type { Lang } from '@/types/martial'

/**
 * @swagger
 * /api/{lang}/martials:
 *   get:
 *     summary: 모든 무술계층 조회 (다국어 지원)
 *     tags: [Martials]
 *     parameters:
 *       - in: path
 *         name: lang
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ko, en, ja, zh]
 *       - in: query
 *         name: 유파_code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 무술계층 목록
 *       400:
 *         description: 잘못된 lang
 *       500:
 *         description: 서버 오류
 */

/**
 * GET /api/{lang}/martials - 모든 무술계층 조회 (다국어 지원)
 * Path: lang (ko|en|ja|zh)
 * Query: ?유파_code=xxx
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { lang } = await params
    const searchParams = request.nextUrl.searchParams
    const 유파_code = searchParams.get('유파_code')

    const martialService = new MartialService()

    if (유파_code) {
      const items = await martialService.getBy유파Code(유파_code, lang as Lang)
      return responseOk(items)
    }

    const items = await martialService.getAll(lang as Lang)
    return responseOk(items)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch martials'
    return responseServerError(message)
  }
}