// 유파 API 라우트 (조회 전용)

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { FactionService } from '@/service/faction.service'
import type { Lang } from '@/types/martial'

/**
 * @swagger
 * /api/{lang}/factions:
 *   get:
 *     summary: 모든 유파 조회 (다국어 지원)
 *     tags: [Factions]
 *     parameters:
 *       - in: path
 *         name: lang
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ko, en, ja, zh]
 *     responses:
 *       200:
 *         description: 유파 목록
 *       400:
 *         description: 잘못된 lang
 *       500:
 *         description: 서버 오류
 */

/**
 * GET /api/{lang}/factions - 모든 유파 조회 (다국어 지원)
 * Path: lang (ko|en|ja|zh)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string }> },
) {
  try {
    const { lang } = await params

    const factionService = new FactionService()
    const factions = await factionService.getAllExceptCommon(lang as Lang)

    return responseOk(factions)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch factions'
    return responseServerError(message)
  }
}
