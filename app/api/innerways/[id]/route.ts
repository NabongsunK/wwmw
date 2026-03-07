// 심법 상세 API 라우트 (조회 전용) - lang은 쿠키로 전달

import { NextRequest } from 'next/server'
import { responseOk, responseNotFound, responseServerError } from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { InnerwayService } from '@/service/innerway.service'

/**
 * @swagger
 * /api/innerways/{id}:
 *   get:
 *     summary: ID로 심법 조회 (다국어 지원, 쿠키 lang 사용)
 *     tags: [Innerways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 심법 상세
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

    const innerwayService = new InnerwayService()
    const innerway = await innerwayService.getById(id, lang)
    return responseOk(innerway)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch innerway'
    if (message.includes('not found')) return responseNotFound(message)
    return responseServerError(message)
  }
}
