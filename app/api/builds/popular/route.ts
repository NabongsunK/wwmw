// 인기 빌드 API

import { responseOk, responseServerError } from '@/lib/api-response'
import { query } from '@/lib/db'
import type { Build } from '@/types/build'

/**
 * @swagger
 * /api/builds/popular:
 *   get:
 *     summary: 인기 빌드 조회
 *     tags: [Builds]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [24h, 7d, trending, all]
 *           default: all
 *     responses:
 *       200:
 *         description: 인기 빌드 목록
 *       500:
 *         description: 서버 오류
 */
/**
 * GET /api/builds/popular - 인기 빌드 조회
 * @param period - '24h' | '7d' | 'all' (기본값: 'all')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'

    let querySql = ''

    switch (period) {
      case '24h':
        // 최근 24시간 인기
        querySql = `
          SELECT 
            b.*,
            s.최근24시간_조회수 AS 조회수,
            s.좋아요_수 AS 좋아요수,
            s.인기도_점수 AS 인기도점수
          FROM V_빌드보드_인기 b
          INNER JOIN V_빌드보드_통계 s ON b.id = s.빌드보드_id
          WHERE s.최근24시간_조회수 > 0
          ORDER BY s.최근24시간_조회수 DESC, s.인기도_점수 DESC
          LIMIT 10
        `
        break
      case '7d':
        // 최근 7일 인기
        querySql = `
          SELECT 
            b.*,
            s.최근7일_조회수 AS 조회수,
            s.좋아요_수 AS 좋아요수,
            s.인기도_점수 AS 인기도점수
          FROM V_빌드보드_인기 b
          INNER JOIN V_빌드보드_통계 s ON b.id = s.빌드보드_id
          WHERE s.최근7일_조회수 > 0
          ORDER BY s.인기도_점수 DESC
          LIMIT 10
        `
        break
      case 'trending':
        // 트렌딩 (최근 활동이 많은 빌드)
        querySql = `
          SELECT 
            b.*,
            s.최근24시간_조회수 AS 조회수,
            s.좋아요_수 AS 좋아요수,
            t.트렌딩_점수 AS 트렌딩점수
          FROM V_빌드보드_트렌딩 t
          INNER JOIN T_빌드보드 b ON t.id = b.id
          INNER JOIN V_빌드보드_통계 s ON b.id = s.빌드보드_id
          LIMIT 10
        `
        break
      default:
        // 전체 인기
        querySql = `
          SELECT 
            b.*,
            s.전체_조회수 AS 조회수,
            s.좋아요_수 AS 좋아요수,
            s.인기도_점수 AS 인기도점수
          FROM V_빌드보드_인기 b
          INNER JOIN V_빌드보드_통계 s ON b.id = s.빌드보드_id
          LIMIT 10
        `
    }

    const builds = await query<Build>(querySql)

    return responseOk({ data: builds, period })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch popular builds'
    return responseServerError(message)
  }
}
