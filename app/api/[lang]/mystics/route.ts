// 비결 API 라우트 (조회 전용)

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { MysticService } from '@/service/mystic.service'
import type { Lang } from '@/types/martial'

/**
 * @swagger
 * /api/{lang}/mystics:
 *   get:
 *     summary: 모든 비결 조회 (다국어 지원)
 *     tags: [Mystics]
 *     parameters:
 *       - in: path
 *         name: lang
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ko, en, ja, zh]
 *     responses:
 *       200:
 *         description: 비결 목록
 *       400:
 *         description: 잘못된 lang
 *       500:
 *         description: 서버 오류
 */

/**
 * GET /api/{lang}/mystics - 모든 비결 조회 (다국어 지원)
 * Path: lang (ko|en|ja|zh)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { lang } = await params
    const mysticService = new MysticService()
    const mystics = await mysticService.getAll(lang as Lang)
    return responseOk(mystics)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch mystics'
    return responseServerError(message)
  }
}
