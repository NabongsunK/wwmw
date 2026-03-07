// 유파 API 라우트 (조회 전용) - lang은 쿠키로 전달, 미들웨어가 x-lang 헤더로 설정

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { FactionService } from '@/service/faction.service'

/**
 * @swagger
 * /api/factions:
 *   get:
 *     summary: 모든 유파 조회 (다국어 지원, 쿠키 lang 사용)
 *     tags: [Factions]
 *     responses:
 *       200:
 *         description: 유파 목록
 *       500:
 *         description: 서버 오류
 */
export async function GET(request: NextRequest) {
  try {
    const lang = getLangFromRequest(request)
    const factionService = new FactionService()
    const factions = await factionService.getAllExceptCommon(lang)
    return responseOk(factions)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch factions'
    return responseServerError(message)
  }
}
