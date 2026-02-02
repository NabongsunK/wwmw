// 빌드 API 라우트

import { NextRequest, NextResponse } from 'next/server'
import { BuildService } from '@/service/build.service'

const buildService = new BuildService()

/**
 * GET /api/builds - 모든 빌드 조회
 */
export async function GET() {
  try {
    const builds = await buildService.getAllBuilds()
    return NextResponse.json({ success: true, data: builds }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch builds',
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/builds - 빌드 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const build = await buildService.createBuild(body)
    return NextResponse.json({ success: true, data: build }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create build',
      },
      { status: 400 },
    )
  }
}
