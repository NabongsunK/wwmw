// 사용자 API 라우트

import { NextRequest, NextResponse } from 'next/server'

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 모든 사용자 조회
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 사용자 목록
 *       500:
 *         description: 서버 오류
 *   post:
 *     summary: 사용자 생성
 *     tags: [Users]
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
import { UserService } from '@/service/user.service'

const userService = new UserService()

/**
 * GET /api/users - 모든 사용자 조회
 */
export async function GET() {
  try {
    const users = await userService.getAllUsers()
    return NextResponse.json({ success: true, data: users }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/users - 사용자 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await userService.createUser(body)
    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user',
      },
      { status: 400 },
    )
  }
}
