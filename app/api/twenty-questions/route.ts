// 스무고개 API - hint/answer 등록 및 조회 (user·lang은 쿠키에서 자동)

/**
 * @swagger
 * /api/twenty-questions:
 *   get:
 *     summary: 스무고개 조회 (목록/검색, 페이지네이션, lang은 쿠키)
 *     tags: [TwentyQuestions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: 한 페이지 개수
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: 검색어 (hint/answer 부분 일치, q 또는 search 둘 다 가능)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (q와 동일, q 우선)
 *     responses:
 *       200:
 *         description: { success, data, meta }
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       hint: { type: string }
 *                       answer: { type: string }
 *                       user_id: { type: string, nullable: true }
 *                       lang: { type: string }
 *                       created_at: { type: string }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *                     q: { type: string, description: '검색 시에만 포함' }
 *       500:
 *         description: 서버 오류
 *   post:
 *     summary: 스무고개 등록
 *     tags: [TwentyQuestions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hint, answer]
 *             properties:
 *               hint: { type: string }
 *               answer: { type: string }
 *               user: { type: string, description: '생략 시 쿠키 uid 사용' }
 *               lang: { type: string, enum: [ko, en, ja, zh], description: '생략 시 쿠키 lang 사용' }
 *     responses:
 *       201:
 *         description: 생성됨, data에 등록된 한 건 반환
 *       400:
 *         description: hint/answer 누락 등 잘못된 요청
 *       500:
 *         description: 서버 오류
 */

import { NextRequest } from 'next/server'
import {
  responseOk,
  responseCreated,
  responseBadRequest,
  responseServerError,
} from '@/lib/api-response'
import { getLangFromRequest } from '@/lib/api-lang'
import { TwentyQuestionRepository } from '@/repo/twenty-questions.repository'

const UID_COOKIE_NAME = 'uid'
const repo = new TwentyQuestionRepository()

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * GET /api/twenty-questions
 * - query: page, limit (페이지네이션), q 또는 search (hint/answer 검색). lang은 쿠키.
 */
export async function GET(request: NextRequest) {
  try {
    const lang = getLangFromRequest(request)
    const { searchParams } = new URL(request.url)

    const page = Math.max(
      1,
      parseInt(searchParams.get('page') ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE,
    )
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(
        1,
        parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
      ),
    )
    const offset = (page - 1) * limit

    const search = searchParams.get('q') ?? searchParams.get('search') ?? ''
    const searchTerm = typeof search === 'string' ? search.trim() : ''

    const [list, total] = await Promise.all([
      repo.findByLang(lang, limit, offset, searchTerm || undefined),
      repo.countByLang(lang, searchTerm || undefined),
    ])
    const totalPages = Math.ceil(total / limit)

    return responseOk({
      data: list,
      meta: { page, limit, total, totalPages, ...(searchTerm && { q: searchTerm }) },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch twenty-questions'
    return responseServerError(message)
  }
}

/**
 * POST /api/twenty-questions
 * - body: { hint: string, answer: string, user?: string, lang?: string }
 * - user, lang 없으면 쿠키에서 채움
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const hint = typeof body?.hint === 'string' ? body.hint.trim() : ''
    const answer = typeof body?.answer === 'string' ? body.answer.trim() : ''
    if (!hint || !answer) {
      return responseBadRequest('hint and answer are required')
    }

    const user = body.user ?? request.cookies.get(UID_COOKIE_NAME)?.value ?? ''
    const lang = body.lang ?? getLangFromRequest(request)

    const row = await repo.create({ hint, answer, user_id: user || undefined, lang })
    return responseCreated(row)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create twenty-question'
    return responseServerError(message)
  }
}
