// 사용자 API 라우트 (uid 기준)

import { NextRequest, NextResponse } from 'next/server'

/**
 * @swagger
 * /api/uid/{uid}:
 *   get:
 *     summary: uid로 프로필(닉네임 등) 조회
 *     tags: [Uid]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 프로필 정보
 *       500:
 *         description: 서버 오류
 *   post:
 *     summary: uid 등록(최초 생성)
 *     tags: [Uid]
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
 *   patch:
 *     summary: uid로 프로필(닉네임 등) 수정
 *     tags: [Uid]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 수정됨
 *       400:
 *         description: 잘못된 요청
 */
import { UserService } from '@/service/user.service'

const userService = new UserService()

/**
 * GET /api/uid/[uid] - uid로 프로필(닉네임 등) 조회
 */
export async function GET(request: NextRequest) {
  const { uid } = request.nextUrl.pathname.split('/').pop()
  try {
    const user = await userService.getUserByUid(uid)
    return NextResponse.json({ success: true, data: user }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/uid - uid 등록(최초 생성)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userByUid = await userService.createUserByUid(body)
    return NextResponse.json({ success: true, data: userByUid }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user by uid',
      },
      { status: 400 },
    )
  }
}

/**
 * PATCH /api/uid/[uid] - uid로 프로필(닉네임 등) 수정
 */
export async function PATCH(request: NextRequest) {
  const { uid } = request.nextUrl.pathname.split('/').pop()
  try {
    const body = await request.json()
    const userByUid = await userService.updateUserByUid(uid, body)
    return NextResponse.json({ success: true, data: userByUid }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user by uid',
      },
      { status: 400 },
    )
  }
}
