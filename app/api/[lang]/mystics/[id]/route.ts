// 비결 상세 API 라우트 (조회 전용)

import { NextRequest } from 'next/server'
import { responseOk, responseNotFound, responseServerError } from '@/lib/api-response'
import { MysticService } from '@/service/mystic.service'
import type { Lang } from '@/types/martial'

/**
 * @swagger
 * /api/{lang}/mystics/{id}:
 *   get:
 *     summary: ID로 비결 조회 (다국어 지원)
 *     tags: [Mystics]
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
 *         description: 비결 상세
 *       400:
 *         description: 잘못된 lang
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 */

/**
 * GET /api/{lang}/mystics/[id] - ID로 비결 조회 (다국어 지원)
 * Path: lang (ko|en|ja|zh), id (비결 ID)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string; id: string }> },
) {
  try {
    const { lang, id: idStr } = await params
    const id = parseInt(idStr)

    const mysticService = new MysticService()
    const mystic = await mysticService.getById(id, lang as Lang)
    return responseOk(mystic)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mystic'
    if (message.includes('not found')) return responseNotFound(message)
    return responseServerError(message)
  }
}
