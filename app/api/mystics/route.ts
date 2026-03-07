// 비결 API 라우트 (조회 전용) - lang은 쿠키로 전달, 미들웨어가 x-lang 헤더로 설정

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { MysticService } from '@/service/mystic.service'

/**
 * @swagger
 * /api/mystics:
 *   get:
 *     summary: 모든 비결 조회 (다국어 지원, 쿠키 lang 사용)
 *     tags: [Mystics]
 *     responses:
 *       200:
 *         description: 비결 목록
 *       500:
 *         description: 서버 오류
 */
export async function GET(request: NextRequest) {
  try {
    const lang = getLangFromRequest(request)
    const mysticService = new MysticService()
    const mystics = await mysticService.getAll(lang)
    return responseOk(mystics)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mystics'
    return responseServerError(message)
  }
}
