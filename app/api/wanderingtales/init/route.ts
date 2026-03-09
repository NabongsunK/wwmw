// 만사록 초기값 조회 API 라우트 - lang은 쿠키로 전달

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { WanderingTalesService } from '@/service/wanderingtales.service'

/**
 * @swagger
 * /api/wanderingtales/init:
 *   get:
 *     summary: 만사록 초기값 조회 (다국어 지원, 쿠키 lang 사용)
 *     tags: [WanderingTales]
 *     responses:
 *       200:
 *         description: 만사록 초기값
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 */
export async function GET(request: NextRequest) {
  try {
    const lang = getLangFromRequest(request)
    const wanderingTalesService = new WanderingTalesService()
    const region = await wanderingTalesService.getWanderingTalesRegion(lang)
    return responseOk(region)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch wandering tales'
    return responseServerError(message)
  }
}
