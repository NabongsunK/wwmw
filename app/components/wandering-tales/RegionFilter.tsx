'use client'

import { useRouter, useSearchParams } from 'next/navigation'

// TODO: 실제 데이터로 교체 필요
const REGION_DATA = {
  하서: ['미진 나루', '서역 관문', '모래 언덕'],
  강남: ['항주', '소주'],
}

export default function RegionFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentRegion = searchParams.get('region') || ''
  const currentSubRegion = searchParams.get('subRegion') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)

    if (key === 'region') params.delete('subRegion')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="w-full space-y-4">
      {/* 1. 대지역 (Regions) - 언더라인 탭 */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
          Select Region
        </h4>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-border/50 pb-2">
          {['', ...Object.keys(REGION_DATA)].map((r) => (
            <button
              key={r}
              onClick={() => updateFilter('region', r)}
              className={`relative pb-2 text-sm transition-all hover:text-foreground ${
                currentRegion === r ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              {r || '전체'}
              {currentRegion === r && (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-foreground animate-in fade-in slide-in-from-left-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 중지역 (Sub Regions) - 칩 */}
      {currentRegion && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
            Explore {currentRegion}
          </h4>
          <div className="flex flex-wrap gap-2">
            {['', ...REGION_DATA[currentRegion as keyof typeof REGION_DATA]].map((sr) => (
              <button
                key={sr}
                onClick={() => updateFilter('subRegion', sr)}
                className={`px-4 py-1.5 rounded-md text-xs transition-all border ${
                  currentSubRegion === sr
                    ? 'bg-foreground text-background border-foreground font-medium'
                    : 'bg-muted/30 text-muted-foreground border-transparent hover:border-border hover:bg-muted/50'
                }`}
              >
                {sr || '전체'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
