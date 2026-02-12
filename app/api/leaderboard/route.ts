// 리더보드 API 라우트

import { NextRequest } from 'next/server'
import {
  responseOk,
  responseCreated,
  responseBadRequest,
  responseServerError,
} from '@/lib/api-response'
import { LeaderboardService } from '@/service/leaderboard.service'

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: 리더보드 조회
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: 유파_code
 *         schema:
 *           type: string
 *       - in: query
 *         name: 기록일
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: ranking
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 리더보드 목록/랭킹
 *       500:
 *         description: 서버 오류
 *   post:
 *     summary: 리더보드 기록 생성
 *     tags: [Leaderboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: 생성됨
 *       400:
 *         description: 잘못된 요청
 */
const leaderboardService = new LeaderboardService()

/**
 * GET /api/leaderboard - 리더보드 조회
 * Query: ?user_id=xxx&유파_code=xxx&기록일=2024-01-01&ranking=true&limit=100
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')
    const 유파_code = searchParams.get('유파_code')
    const 기록일 = searchParams.get('기록일')
    const ranking = searchParams.get('ranking') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    // 랭킹 조회
    if (ranking) {
      if (유파_code) {
        const rankings = await leaderboardService.getRankingsBy유파(유파_code, limit)
        return responseOk(rankings)
      }
      if (기록일) {
        const rankings = await leaderboardService.getRankingsByDate(기록일, limit)
        return responseOk(rankings)
      }
      const rankings = await leaderboardService.getRankings(limit)
      return responseOk(rankings)
    }

    if (user_id) {
      const entries = await leaderboardService.getByUserId(user_id)
      return responseOk(entries)
    }

    if (유파_code) {
      const entries = await leaderboardService.getBy유파Code(유파_code)
      return responseOk(entries)
    }

    if (기록일) {
      const entries = await leaderboardService.getBy기록일(기록일)
      return responseOk(entries)
    }

    const entries = await leaderboardService.getAll()
    return responseOk(entries)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard'
    return responseServerError(message)
  }
}

/**
 * POST /api/leaderboard - 리더보드 기록 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entry = await leaderboardService.create(body)
    return responseCreated(entry)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create leaderboard entry'
    return responseBadRequest(message)
  }
}
