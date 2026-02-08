// 무술계층 API 라우트 (조회 전용)

import { NextRequest } from 'next/server'
import { responseOk, responseBadRequest, responseServerError } from '@/lib/api-response'
import { MartialService } from '@/service/martial.service'
import type { Lang } from '@/types/martial'

/**
 * @swagger
 * /api/martials:
 *   get:
 *     summary: 모든 무술계층 조회 (다국어 지원)
 *     tags: [Martials]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [ko, en, ja, zh]
 *           default: ko
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
const martialService = new MartialService()

/**
 * GET /api/martials - 모든 무술계층 조회 (다국어 지원)
 * Query: ?lang=ko|en|ja|zh&유파_code=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lang = (searchParams.get('lang') || 'ko') as Lang
    const 유파_code = searchParams.get('유파_code')

    // 언어 유효성 검사
    if (!['ko', 'en', 'ja', 'zh'].includes(lang)) {
      return responseBadRequest('Invalid lang parameter. Use: ko, en, ja, zh')
    }

    if (유파_code) {
      const items = await martialService.getBy유파Code(유파_code, lang)
      return responseOk(items)
    }

    const items = await martialService.getAll(lang)
    return responseOk(items)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch martials'
    return responseServerError(message)
  }
}
