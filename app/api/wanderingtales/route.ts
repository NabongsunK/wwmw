// 만사록 목록 API 라우트 (조회 전용) - lang은 쿠키로 전달

import { NextRequest } from 'next/server'
import { responseOk, responseNotFound, responseServerError } from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { WanderingTalesService } from '@/service/wanderingtales.service'

/**
 * @swagger
 * /api/wanderingtales:
 *   get:
 *     summary: 만사록 목록 조회 (다국어 지원, 쿠키 lang 사용)
 *     tags: [WanderingTales]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *       - in: query
 *         name: subRegion
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 만사록 목록
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 */
export async function GET(request: NextRequest) {
  try {
    const lang = getLangFromRequest(request)
    const searchParams = request.nextUrl.searchParams
    const region = searchParams.get('region')
    const subRegion = searchParams.get('subRegion')
    const wanderingTalesService = new WanderingTalesService()
    const items = await wanderingTalesService.getAllWanderingTales(
      lang,
      region || '',
      subRegion || '',
    )
    if (!items) {
      return responseNotFound('No items found')
    }
    return responseOk(items)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch wandering tales'
    return responseServerError(message)
  }
}
