// 심법 시뮬레이터용 API - 이미지 경로 포함

import { NextRequest } from 'next/server'
import { responseOk, responseServerError } from '@/lib/api-response'
import { InnerwayService } from '@/service/innerway.service'
import type { Lang } from '@/types/martial'

/**
 * @swagger
 * /api/{lang}/innerways/simulator:
 *   get:
 *     summary: 심법 시뮬레이터용 데이터 조회 (이미지 경로 포함)
 *     tags: [Innerways]
 *     parameters:
 *       - in: path
 *         name: lang
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ko, en, ja, zh]
 *     responses:
 *       200:
 *         description: 심법 시뮬레이터용 데이터 조회
 *       400:
 *         description: 잘못된 lang
 *       500:
 *         description: 서버 오류
 */
/**
 * GET /api/{lang}/innerways/simulator - 심법 시뮬레이터용 데이터 조회
 * Path: lang (ko|en|ja|zh)
 * 이미지 경로를 포함한 심법 목록 반환
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string }> },
) {
  try {
    const { lang } = await params
    const innerwayService = new InnerwayService()
    const innerways = await innerwayService.getAll(lang as Lang)
    return responseOk(innerways)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch innerways for simulator'
    return responseServerError(message)
  }
}
