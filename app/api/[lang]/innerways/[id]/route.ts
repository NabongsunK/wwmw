// 심법 상세 API 라우트 (조회 전용)

import { NextRequest } from 'next/server'
import { responseOk, responseNotFound, responseServerError } from '@/lib/api-response'
import { InnerwayService } from '@/service/innerway.service'
import type { Lang } from '@/types/martial'

/**
 * @swagger
 * /api/{lang}/innerways/{id}:
 *   get:
 *     summary: ID로 심법 조회 (다국어 지원)
 *     tags: [Innerways]
 *     parameters:
 *       - in: path
 *         name: lang
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ko, en, ja, zh]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 심법 상세
 *       400:
 *         description: 잘못된 lang
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 */

/**
 * GET /api/{lang}/innerways/[id] - ID로 심법 조회 (다국어 지원)
 * Path: lang (ko|en|ja|zh), id (심법 ID)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string; id: string }> },
) {
  try {
    const { lang, id: idStr } = (await params) as { lang: Lang; id: string }
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
