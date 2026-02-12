// 심법 시뮬레이터용 API - 이미지 경로 포함

import { responseOk, responseServerError } from '@/lib/api-response'
import { query } from '@/lib/db'

/**
 * @swagger
 * /api/innerways/simulator:
 *   get:
 *     summary: 심법 시뮬레이터용 데이터 조회 (이미지 경로 포함)
 *     tags: [Innerways]
 *     responses:
 *       200:
 *         description: 심법 목록 (이미지 경로 포함)
 *       500:
 *         description: 서버 오류
 */

interface InnerwayWithImage {
  id: number
  유파_code: string
  title: string
  body: string
  순서: number
  등급: number
  심법_img: string | null
  created_at: Date
  updated_at: Date
}

/**
 * GET /api/innerways/simulator - 심법 시뮬레이터용 데이터 조회
 * 이미지 경로를 포함한 심법 목록 반환
 */
export async function GET() {
  try {
    const innerways = await query<InnerwayWithImage>(
      `SELECT 
        s.id,
        s.유파_code,
        s.title,
        s.body,
        s.순서,
        s.등급,
        COALESCE(img.img_path, '') AS 심법_img,
        s.created_at,
        s.updated_at
      FROM T_심법 s
      LEFT JOIN T_이미지 img ON s.img = img.id
      WHERE s.등급 IS NOT NULL AND s.등급 BETWEEN 1 AND 4
      ORDER BY s.유파_code, s.순서 ASC, s.created_at DESC`,
    )

    // 등급이 유효한 데이터만 필터링
    const validInnerways = innerways.filter(
      (item) => item != null && item.등급 != null && item.등급 >= 1 && item.등급 <= 4,
    )

    if (validInnerways.length === 0) {
      console.warn('No valid innerways found in database')
    }

    return responseOk(validInnerways)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch innerways for simulator'
    return responseServerError(message)
  }
}
