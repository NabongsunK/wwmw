'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  type MysticCard,
  type GachaBanner,
  type GachaState,
  createDefaultBanner,
  createInitialState,
  rollOnce,
  rollTen,
  getRarityName,
  getRarityColorClass,
} from '@/lib/mystic-gacha'

export default function MysticSimulatorPage() {
  const [allCards, setAllCards] = useState<MysticCard[]>([])
  const [loading, setLoading] = useState(true)
  const [banner, setBanner] = useState<GachaBanner | null>(null)
  const [state, setState] = useState<GachaState>(createInitialState())
  const [lastResult, setLastResult] = useState<MysticCard[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 심법 데이터 로드
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/innerways/simulator')
        const json = await res.json()
        
        console.log('API Response:', json) // 디버깅용
        
        if (!json?.success) {
          console.error('API returned error:', json?.message || 'Unknown error')
          setLoading(false)
          return
        }

        if (!json?.data || !Array.isArray(json.data)) {
          console.error('Invalid API response format:', json)
          setLoading(false)
          return
        }

        console.log(`Raw data count: ${json.data.length}`)

        const cards: MysticCard[] = json.data
          .filter((item: any) => {
            if (!item || item.등급 == null) {
              console.warn('Filtered out item (null or missing 등급):', item)
              return false
            }
            return true
          })
          .map((item: any) => {
            // 등급이 숫자가 아니면 변환
            const 등급 = typeof item.등급 === 'number' ? item.등급 : parseInt(item.등급, 10)
            
            // NaN 체크
            if (isNaN(등급)) {
              console.warn('Invalid 등급 value:', item.등급, 'for item:', item)
              return null
            }
            
            // 유효한 등급인지 확인 (1-4 사이)
            const valid등급 = (등급 >= 1 && 등급 <= 4) ? (등급 as 1 | 2 | 3 | 4) : 1
            
            return {
              id: item.id,
              유파_code: item.유파_code || '',
              title: item.title || '',
              body: item.body || '',
              순서: item.순서 || 0,
              등급: valid등급,
              심법_img: item.심법_img || null,
            }
          })
          .filter((card: MysticCard | null): card is MysticCard => card != null)
        
        console.log(`Valid cards after processing: ${cards.length}`)
        
        if (cards.length === 0) {
          const errorMsg = '심법 데이터를 찾을 수 없습니다. 데이터베이스에 등급이 1-4 사이인 심법이 있는지 확인해주세요.'
          console.error('No valid cards found in API response. Raw data:', json.data)
          setError(errorMsg)
          setLoading(false)
          return
        }
        
        setError(null) // 성공 시 에러 초기화
        
        console.log(`Loaded ${cards.length} cards`)
        setAllCards(cards)
        const newBanner = createDefaultBanner(cards)
        setBanner(newBanner)
      } catch (error) {
        const errorMsg = '심법 데이터를 불러오는 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error))
        console.error('Failed to fetch cards:', error)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  // 단일 뽑기
  const handleSingleRoll = useCallback(() => {
    if (!banner || isRolling || !banner.pool || banner.pool.length === 0) return

    setIsRolling(true)
    setTimeout(() => {
      try {
        const { result, newState } = rollOnce(banner, state)
        setState(newState)
        setLastResult([result.card])
      } catch (error) {
        console.error('Roll error:', error)
        alert('뽑기 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)))
      } finally {
        setIsRolling(false)
      }
    }, 300)
  }, [banner, state, isRolling])

  // 10연차 뽑기
  const handleTenRoll = useCallback(() => {
    if (!banner || isRolling || !banner.pool || banner.pool.length === 0) return

    setIsRolling(true)
    setTimeout(() => {
      try {
        const { cards, newState } = rollTen(banner, state)
        setState(newState)
        setLastResult(cards)
      } catch (error) {
        console.error('Roll error:', error)
        alert('뽑기 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)))
      } finally {
        setIsRolling(false)
      }
    }, 500)
  }, [banner, state, isRolling])

  // 리셋
  const handleReset = useCallback(() => {
    if (confirm('통계를 초기화하시겠습니까?')) {
      setState(createInitialState())
      setLastResult([])
    }
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4 font-medium">{error}</div>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              window.location.reload()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!banner) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">심법 데이터를 불러올 수 없습니다.</div>
      </div>
    )
  }

  const totalPulls = state.pulls
  const actualRates = {
    1: totalPulls > 0 ? (state.rarityCount[1] / totalPulls) * 100 : 0,
    2: totalPulls > 0 ? (state.rarityCount[2] / totalPulls) * 100 : 0,
    3: totalPulls > 0 ? (state.rarityCount[3] / totalPulls) * 100 : 0,
    4: totalPulls > 0 ? (state.rarityCount[4] / totalPulls) * 100 : 0,
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/builds" className="text-muted-foreground hover:text-foreground text-sm">
          ← 빌드 목록으로
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">심법 뽑기 시뮬레이터</h1>
        <p className="text-muted-foreground">가상으로 심법을 뽑아보고 통계를 확인해보세요!</p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={handleSingleRoll}
              disabled={isRolling}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isRolling ? '뽑는 중...' : '1회 뽑기'}
            </button>
            <button
              onClick={handleTenRoll}
              disabled={isRolling}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isRolling ? '뽑는 중...' : '10연차 뽑기'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 border border-border rounded-lg hover:bg-muted text-sm"
            >
              리셋
            </button>
          </div>

          <div className="text-sm text-muted-foreground">
            <div>총 뽑기 횟수: <span className="font-medium text-foreground">{totalPulls}</span>회</div>
            <div>피티 카운트: <span className="font-medium text-foreground">{state.pityCount}</span>/{banner.pityMax || 90}</div>
            <div>파편: <span className="font-medium text-foreground">{state.shards}</span>개</div>
          </div>
        </div>
      </div>

      {/* 최근 뽑기 결과 */}
      {lastResult.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {lastResult.length === 1 ? '뽑기 결과' : '10연차 결과'}
          </h2>
          <div className={`grid gap-4 ${lastResult.length === 1 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'}`}>
            {lastResult.map((card, idx) => (
              <div
                key={`${card.id}-${idx}`}
                className={`border-2 rounded-lg p-4 ${getRarityColorClass(card.등급)} transition-all hover:scale-105`}
              >
                <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-background">
                  {card.심법_img ? (
                    <Image
                      src={card.심법_img}
                      alt={card.title}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🧘
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm mb-1">{card.title}</div>
                  <div className={`text-xs px-2 py-1 rounded inline-block ${
                    card.등급 === 4 ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100' :
                    card.등급 === 3 ? 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100' :
                    card.등급 === 2 ? 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100' :
                    'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}>
                    {getRarityName(card.등급)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 통계 */}
      {totalPulls > 0 && (
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {([1, 2, 3, 4] as const).map((rarity) => (
              <div key={rarity} className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">{getRarityName(rarity)}</div>
                <div className="text-2xl font-bold mb-2">{state.rarityCount[rarity]}개</div>
                <div className="text-xs text-muted-foreground">
                  확률: {actualRates[rarity].toFixed(2)}% (목표: {(banner.rates[rarity] * 100).toFixed(1)}%)
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      rarity === 4 ? 'bg-yellow-500' :
                      rarity === 3 ? 'bg-purple-500' :
                      rarity === 2 ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${actualRates[rarity]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 배너 정보 */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">배너 정보</h2>
        <div className="space-y-2 text-sm">
          <div><strong>배너명:</strong> {banner.name}</div>
          <div><strong>총 심법 수:</strong> {banner.pool.length}개</div>
          <div className="mt-4">
            <strong>확률:</strong>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              {([4, 3, 2, 1] as const).map((rarity) => (
                <li key={rarity}>
                  {getRarityName(rarity)}: {(banner.rates[rarity] * 100).toFixed(1)}%
                </li>
              ))}
            </ul>
          </div>
          {banner.pityMax && (
            <div className="mt-2">
              <strong>피티:</strong> {banner.pityMax}회 안에 {getRarityName(banner.pityTarget || 4)} 보장
            </div>
          )}
          <div className="mt-2">
            <strong>10연차 보장:</strong> 최소 {getRarityName(3)} 이상 1장 보장
          </div>
        </div>
      </div>
    </div>
  )
}
