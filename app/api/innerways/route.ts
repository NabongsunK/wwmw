// 심법 API 라우트 (조회 전용) - lang은 쿠키로 전달

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { InnerwayService } from '@/service/innerway.service'

/**
 * @swagger
 * /api/innerways:
 *   get:
 *     summary: 모든 심법 조회 (다국어 지원, 쿠키 lang 사용)
 *     tags: [Innerways]
 *     parameters:
 *       - in: query
 *         name: 유파_code
 *         schema:
 *           type: string
 *       - in: query
 *         name: 등급
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 심법 목록
 *       500:
 *         description: 서버 오류
 */
export async function GET(request: NextRequest) {
  try {
    const lang = getLangFromRequest(request)
    const searchParams = request.nextUrl.searchParams
    const 유파_code = searchParams.get('유파_code')
    const 등급 = searchParams.get('등급')

    const innerwayService = new InnerwayService()

    if (유파_code) {
      const innerways = await innerwayService.getBy유파Code(유파_code)
      return responseOk(innerways)
    }

    if (등급) {
      const innerways = await innerwayService.getBy등급(parseInt(등급))
      return responseOk(innerways)
    }

    const innerways = await innerwayService.getAll(lang)
    return responseOk(innerways)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch innerways'
    return responseServerError(message)
  }
}
