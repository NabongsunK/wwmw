// 심법 시뮬레이터용 API - 이미지 경로 포함, lang은 쿠키로 전달

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { InnerwayService } from '@/service/innerway.service'

/**
 * @swagger
 * /api/innerways/simulator:
 *   get:
 *     summary: 심법 시뮬레이터용 데이터 조회 (이미지 경로 포함, 쿠키 lang 사용)
 *     tags: [Innerways]
 *     responses:
 *       200:
 *         description: 심법 시뮬레이터용 데이터
 *       500:
 *         description: 서버 오류
 */
export async function GET(request: NextRequest) {
  try {
    const lang = getLangFromRequest(request)
    const innerwayService = new InnerwayService()
    const innerways = await innerwayService.getAll(lang)
    return responseOk(innerways)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch innerways for simulator'
    return responseServerError(message)
  }
}
