// 심법 API 라우트 (조회 전용)

import { NextRequest, NextResponse } from 'next/server';
import { InnerwayService } from '@/service/innerway.service';

const innerwayService = new InnerwayService();

/**
 * GET /api/innerways - 모든 심법 조회
 * Query: ?유파_code=xxx&등급=1
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const 유파_code = searchParams.get('유파_code');
    const 등급 = searchParams.get('등급');

    if (유파_code) {
      const innerways = await innerwayService.getBy유파Code(유파_code);
      return NextResponse.json({ success: true, data: innerways }, { status: 200 });
    }

    if (등급) {
      const innerways = await innerwayService.getBy등급(parseInt(등급));
      return NextResponse.json({ success: true, data: innerways }, { status: 200 });
    }

    const innerways = await innerwayService.getAll();
    return NextResponse.json({ success: true, data: innerways }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch innerways',
      },
      { status: 500 }
    );
  }
}
