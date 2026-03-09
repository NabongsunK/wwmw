import { Suspense } from 'react'
import PostList from '@/app/components/wandering-tales/PostList'
import RegionFilter from '@/app/components/wandering-tales/RegionFilter'

// 이 타입은 나중에 DB 스키마와 맞추시면 됩니다.
export interface TalePost {
  id: number
  region: string
  subRegion: string
  title: string
  created_at: string
  writer: string
  notice: number
}

export default async function WanderingTalesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  // URL 쿼리 파라미터에서 필터 조건 추출
  const selectedRegion = typeof params.region === 'string' ? params.region : ''
  const selectedSubRegion = typeof params.subRegion === 'string' ? params.subRegion : ''

  return (
    <main className="container max-w-5xl py-6 min-h-screen">
      <header className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">만사록</h1>
        {/* <p className="text-muted-foreground">대륙의 숨겨진 이야기들을 지역별로 탐색해보세요.</p> */}
      </header>

      {/* 지역 선택 필터 영역 */}
      <section className="mb-8">
        <RegionFilter />
      </section>

      {/* 게시글 목록 영역 (Server Component에서 DB Fetch) */}
      <Suspense fallback={<div className="py-20 text-center">이야기를 불러오는 중...</div>}>
        <PostList region={selectedRegion} subRegion={selectedSubRegion} />
      </Suspense>
    </main>
  )
}
