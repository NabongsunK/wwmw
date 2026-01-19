// 심법 상세 API 라우트 (조회 전용)

import { NextRequest, NextResponse } from 'next/server';
import { InnerwayService } from '@/service/innerway.service';

const innerwayService = new InnerwayService();

/**
 * GET /api/innerways/[id] - ID로 심법 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const innerway = await innerwayService.getById(id);
    return NextResponse.json({ success: true, data: innerway }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch innerway',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}
