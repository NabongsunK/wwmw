// 무술계층 API 라우트 (조회 전용) - lang은 쿠키로 전달

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { MartialService } from '@/service/martial.service'

/**
 * @swagger
 * /api/martials:
 *   get:
 *     summary: 모든 무술계층 조회 (다국어 지원, 쿠키 lang 사용)
 *     tags: [Martials]
 *     parameters:
 *       - in: query
 *         name: 유파_code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 무술계층 목록
 *       500:
 *         description: 서버 오류
 */
export async function GET(request: NextRequest) {
  try {
    const lang = getLangFromRequest(request)
    const searchParams = request.nextUrl.searchParams
    const 유파_code = searchParams.get('유파_code')

    const martialService = new MartialService()

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
