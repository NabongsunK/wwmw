'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useApi } from '@/hooks/useApi'
import { WanderingTalesRegion } from '@/types/wanderingtales'

export default function RegionFilter() {
  const router = useRouter()
  const { fetchApi } = useApi()
  const searchParams = useSearchParams()

  const [regions, setRegions] = useState<WanderingTalesRegion | null>(null)

  // 현재 선택된 지역과 하위 지역을 URLSearchParams에서 가져옴
  const currentRegion = searchParams.get('region') ?? '전체'
  const currentSubRegion = searchParams.get('subRegion') ?? '전체'

  // 지역이나 하위 지역이 변경될 때 URLSearchParams를 업데이트하는 함수
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) params.set(key, value)
      else params.delete(key)

      // 지역 변경하면 하위 지역 전체로
      if (key === 'region') params.set('subRegion', '전체')

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const subRegions =
    regions?.ThirdRegion.filter((r) => r.cd1 === currentRegion).map((r) => r.cd3) || []

  // TODO: ThirdRegion 커지면 useMemo 적용
  // const subRegions = useMemo(() => {
  //   if (!regions) return []

  //   return regions.ThirdRegion
  //     .filter((r) => r.cd1 === currentRegion)
  //     .map((r) => r.cd3)
  // }, [regions, currentRegion])

  useEffect(() => {
    const fetchRegions = async () => {
      const json = await fetchApi(`/wanderingtales/init`)

      if (json?.success && json?.data) {
        setRegions(json.data)
      } else {
        setRegions(null)
      }
    }

    try {
      fetchRegions()
    } catch (error) {
      console.error('Error fetching regions:', error)
    }
  }, [fetchApi])

  return (
    <div className="w-full space-y-4">
      {/* Region */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
          지역을 선택하세요
        </h4>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-border/50 pb-2">
          {regions?.FirstRegion.map((region) => (
            <button
              key={region}
              onClick={() => updateFilter('region', region)}
              className={`relative pb-2 text-sm transition-all hover:text-foreground ${
                currentRegion === region ? 'text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              {region}
              {currentRegion === region && (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-foreground animate-in fade-in slide-in-from-left-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Region */}
      {currentRegion && currentRegion !== '전체' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
            Explore {currentRegion}
          </h4>

          <div className="flex flex-wrap gap-2">
            {subRegions.map((subRegion) => (
              <button
                key={subRegion}
                onClick={() => updateFilter('subRegion', subRegion)}
                className={`px-4 py-1.5 rounded-md text-xs transition-all border ${
                  currentSubRegion === subRegion
                    ? 'bg-foreground text-background border-foreground font-medium'
                    : 'bg-muted/30 text-muted-foreground border-transparent hover:border-border hover:bg-muted/50'
                }`}
              >
                {subRegion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
