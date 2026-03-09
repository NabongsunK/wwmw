// 만사록 상세 API 라우트 (조회 전용) - lang은 쿠키로 전달

import { NextRequest } from 'next/server'
import { responseOk, responseNotFound, responseServerError } from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { WanderingTalesService } from '@/service/wanderingtales.service'

/**
 * @swagger
 * /api/wanderingtales/{id}:
 *   get:
 *     summary: ID로 만사록 조회 (다국어 지원, 쿠키 lang 사용)
 *     tags: [WanderingTales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 만사록 상세
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const lang = getLangFromRequest(request)
    const { id: idStr } = await params
    const id = parseInt(idStr)

    const wanderingTalesService = new WanderingTalesService()
    const item = await wanderingTalesService.getWanderingTalesById(id, lang)
    return responseOk(item)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch wandering tales'
    if (message.includes('not found')) return responseNotFound(message)
    return responseServerError(message)
  }
}
