'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import {
  type MysticCard,
  type GachaBanner,
  type GachaState,
  createDefaultBanner,
  createFactionBanner,
  createInitialState,
  rollMultiple,
  getRarityName,
  getRarityColorClass,
  dismantleCards,
  getFragmentsFromCard,
  exchangeFragmentsForBoxes,
} from '@/lib/mystic-gacha'

export default function MysticSimulatorPage() {
  const { fetchApi, lang } = useApi()
  const [allCards, setAllCards] = useState<MysticCard[]>([])
  const [loading, setLoading] = useState(true)
  const [defaultBanner, setDefaultBanner] = useState<GachaBanner | null>(null)
  const [factionBanner, setFactionBanner] = useState<GachaBanner | null>(null)
  const [selectedFaction, setSelectedFaction] = useState<string>('')
  const [factions, setFactions] = useState<Array<{ code: string; name: string }>>([])
  const [chimjungsanCount, setChimjungsanCount] = useState<number>(1)
  const [state, setState] = useState<GachaState>(createInitialState())
  const [lastResult, setLastResult] = useState<MysticCard[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [protectedCards, setProtectedCards] = useState<Set<string>>(new Set()) // 개별 카드 보호 (id-idx)

  // 유파 데이터 로드 (언어 변경 시 자동 갱신)
  useEffect(() => {
    const fetchFactions = async () => {
      try {
        const json = await fetchApi('factions')
        if (json?.success && json?.data) {
          setFactions(json.data)

          // 첫 번째 유파를 기본 선택
          if (json.data.length > 0) {
            setSelectedFaction(json.data[0].code)
          }
        }
      } catch (error) {
        console.error('Failed to fetch factions:', error)
      }
    }

    fetchFactions()
  }, [fetchApi])

  // 심법 데이터 로드 (언어 변경 시 자동 갱신)
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const json = await fetchApi('innerways/simulator')

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
            const valid등급 = 등급 >= 1 && 등급 <= 4 ? (등급 as 1 | 2 | 3 | 4) : 1

            return {
              id: item.id || 0,
              유파_code: item.유파 || '',
              title: item.심법명 || '',
              body: '',
              순서: item.순서 || 0,
              등급: valid등급,
              심법_img: item.심법_이미지_url || null,
            }
          })
          .filter((card: any): card is MysticCard => card != null)

        console.log(`Valid cards after processing: ${cards.length}`)

        if (cards.length === 0) {
          const errorMsg =
            '심법 데이터를 찾을 수 없습니다. 데이터베이스에 등급이 1-4 사이인 심법이 있는지 확인해주세요.'
          console.error('No valid cards found in API response. Raw data:', json.data)
          setError(errorMsg)
          setLoading(false)
          return
        }

        setError(null) // 성공 시 에러 초기화

        console.log(`Loaded ${cards.length} cards`)
        setAllCards(cards)

        // 전체 배너 생성
        const newDefaultBanner = createDefaultBanner(cards)
        setDefaultBanner(newDefaultBanner)

        // 선택된 유파가 있으면 유파 배너 생성
        if (selectedFaction) {
          setFactionBanner(createFactionBanner(cards, selectedFaction))
        }
      } catch (error) {
        const errorMsg =
          '심법 데이터를 불러오는 중 오류가 발생했습니다: ' +
          (error instanceof Error ? error.message : String(error))
        console.error('Failed to fetch cards:', error)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [fetchApi, selectedFaction]) // lang 및 selectedFaction 변경 시 자동 재로드

  // 유파 변경
  const handleFactionChange = useCallback(
    (factionCode: string) => {
      setSelectedFaction(factionCode)
      if (allCards.length > 0) {
        setFactionBanner(createFactionBanner(allCards, factionCode))
      }
    },
    [allCards],
  )

  // 1주일 뽑기 (유파 68개 + 전체 40개)
  const handleWeeklyRoll = useCallback(() => {
    if (!factionBanner || !defaultBanner || isRolling) return

    setIsRolling(true)
    setTimeout(() => {
      try {
        // 유파 상자 68개
        const { cards: factionCards, newState: stateAfterFaction } = rollMultiple(
          factionBanner,
          state,
          68,
        )

        // 전체 상자 40개
        const { cards: defaultCards, newState: finalState } = rollMultiple(
          defaultBanner,
          stateAfterFaction,
          40,
        )

        // 1주일 뽑기 카운트 증가
        setState({
          ...finalState,
          weeklyPullCount: finalState.weeklyPullCount + 1,
        })
        setLastResult([...factionCards, ...defaultCards])
        setProtectedCards(new Set()) // 새 뽑기 시 개별 보호 리셋
      } catch (error) {
        console.error('Roll error:', error)
        alert(
          '뽑기 중 오류가 발생했습니다: ' +
            (error instanceof Error ? error.message : String(error)),
        )
      } finally {
        setIsRolling(false)
      }
    }, 500)
  }, [factionBanner, defaultBanner, state, isRolling])

  // 침중산 뽑기 (유파 3*N개)
  const handleChimjungsanRoll = useCallback(() => {
    if (!factionBanner || isRolling || chimjungsanCount <= 0) return

    setIsRolling(true)
    const totalPulls = chimjungsanCount * 3

    setTimeout(() => {
      try {
        const { cards, newState } = rollMultiple(factionBanner, state, totalPulls)
        
        // 침중산 사용 개수 증가
        setState({
          ...newState,
          chimjungsanUsed: newState.chimjungsanUsed + chimjungsanCount,
        })
        setLastResult(cards)
        setProtectedCards(new Set()) // 새 뽑기 시 개별 보호 리셋
      } catch (error) {
        console.error('Roll error:', error)
        alert(
          '뽑기 중 오류가 발생했습니다: ' +
            (error instanceof Error ? error.message : String(error)),
        )
      } finally {
        setIsRolling(false)
      }
    }, 500)
  }, [factionBanner, state, isRolling, chimjungsanCount])

  // 리셋
  const handleReset = useCallback(() => {
    if (confirm('통계를 초기화하시겠습니까?')) {
      setState(createInitialState())
      setLastResult([])
      setProtectedCards(new Set())
    }
  }, [])

  // 개별 카드 보호 토글
  const toggleCardProtection = useCallback((cardId: string) => {
    setProtectedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }, [])

  // 갈갈이 (최근 뽑기 결과 전체)
  const handleDismantleAll = useCallback(() => {
    if (lastResult.length === 0) {
      alert('갈갈이할 심법이 없습니다!')
      return
    }

    // 개별 보호된 카드 필터링
    const cardsToDismantle = lastResult.filter((card, idx) => {
      const cardKey = `${card.id}-${idx}`
      return !protectedCards.has(cardKey)
    })
    const protectedCardsList = lastResult.filter((card, idx) => {
      const cardKey = `${card.id}-${idx}`
      return protectedCards.has(cardKey)
    })

    if (cardsToDismantle.length === 0) {
      alert('갈갈이할 수 있는 심법이 없습니다. 모두 보호 설정되어 있습니다.')
      return
    }

    const totalFragments = cardsToDismantle.reduce(
      (sum, card) => sum + getFragmentsFromCard(card),
      0,
    )
    const protectedInfo =
      protectedCardsList.length > 0 ? `\n(${protectedCardsList.length}개는 보호됨)` : ''

    if (
      confirm(
        `${cardsToDismantle.length}개 심법을 갈갈이하여 ${totalFragments} 서표를 얻습니다.${protectedInfo}`,
      )
    ) {
      setState(dismantleCards(cardsToDismantle, state))
      // 보호된 카드만 남기고, protectedCards Set도 업데이트
      const newProtectedCards = new Set<string>()
      protectedCardsList.forEach((card, idx) => {
        const newCardKey = `${card.id}-${idx}`
        newProtectedCards.add(newCardKey)
      })
      setProtectedCards(newProtectedCards)
      setLastResult(protectedCardsList)
    }
  }, [lastResult, state, protectedCards])

  // 서표로 상자 교환 (모든 서표 사용)
  const handleExchangeFragments = useCallback(() => {
    if (!factionBanner) return

    const availableBoxes = Math.floor(state.fragments / 5)
    if (availableBoxes === 0) {
      alert('서표가 부족합니다. 서표 5개당 상자 1개를 교환할 수 있습니다.')
      return
    }

    const usedFragments = availableBoxes * 5
    const remainingFragments = state.fragments - usedFragments

    if (
      !confirm(
        `서표 ${usedFragments}개를 사용하여 유파 상자 ${availableBoxes}개를 뽑습니다.\n(남은 서표: ${remainingFragments}개)`,
      )
    ) {
      return
    }

    setIsRolling(true)
    setTimeout(() => {
      try {
        // 서표 차감
        const stateAfterExchange = exchangeFragmentsForBoxes(state, availableBoxes)

        // 유파 상자 뽑기
        const { cards, newState } = rollMultiple(factionBanner, stateAfterExchange, availableBoxes)

        setState(newState)
        setLastResult(cards)
        setProtectedCards(new Set())
      } catch (error) {
        console.error('Exchange error:', error)
        alert(error instanceof Error ? error.message : '교환 중 오류가 발생했습니다.')
      } finally {
        setIsRolling(false)
      }
    }, 300)
  }, [state, factionBanner, isRolling])

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

  if (!defaultBanner || !factionBanner) {
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
        <p className="text-muted-foreground">
          가상으로 심법을 뽑아보고 통계를 확인해보세요! (언어: {lang.toUpperCase()})
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-card border rounded-lg p-6 mb-6 space-y-6">
        {/* 통계 */}
        <div className="flex gap-6 text-sm text-muted-foreground pb-4 border-b border-border">
          <div>
            총 뽑기: <span className="font-medium text-foreground">{totalPulls}</span>회
          </div>
          <div>
            1주일 뽑기: <span className="font-medium text-foreground">{state.weeklyPullCount}</span>회
          </div>
          <div>
            침중산 사용: <span className="font-medium text-foreground">{state.chimjungsanUsed}</span>개
          </div>
          <div>
            서표: <span className="font-medium text-foreground">{state.fragments}</span>개
            <span className="text-xs ml-1">(상자 {Math.floor(state.fragments / 5)}개)</span>
          </div>
        </div>

        {/* 유파 선택 */}
        <div>
          <label className="block text-sm font-medium mb-2">유파 선택</label>
          <select
            value={selectedFaction}
            onChange={(e) => handleFactionChange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            {factions.map((faction) => (
              <option key={faction.code} value={faction.code}>
                {faction.name}
              </option>
            ))}
          </select>
        </div>

        {/* 뽑기 버튼들 */}
        <div className="flex flex-wrap gap-4 items-start">
          <div className="flex flex-col gap-2">
            <button
              onClick={handleWeeklyRoll}
              disabled={isRolling}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
            >
              {isRolling ? '뽑는 중...' : '1주일 뽑기 (108개)'}
            </button>
            <p className="text-xs text-muted-foreground">유파 68개 + 전체 40개</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="1"
                value={chimjungsanCount}
                onChange={(e) => setChimjungsanCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-center"
              />
              <button
                onClick={handleChimjungsanRoll}
                disabled={isRolling}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isRolling ? '뽑는 중...' : '침중산 사용'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {chimjungsanCount}개 사용 = 유파 {chimjungsanCount * 3}개 뽑기
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleExchangeFragments}
              disabled={isRolling || state.fragments < 5}
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              서표로 상자 뽑기
            </button>
            <p className="text-xs text-muted-foreground">서표 5개 = 유파 상자 1개</p>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-3 border border-border rounded-lg hover:bg-muted text-sm"
          >
            리셋
          </button>

          {lastResult.length > 0 &&
            (() => {
              const dismantlableCount = lastResult.filter((card, idx) => {
                const cardKey = `${card.id}-${idx}`
                return !protectedCards.has(cardKey)
              }).length
              return (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleDismantleAll}
                    disabled={dismantlableCount === 0}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    전체 갈갈이 ({dismantlableCount}개)
                  </button>
                  {dismantlableCount !== lastResult.length && (
                    <p className="text-xs text-muted-foreground">
                      {lastResult.length - dismantlableCount}개 보호됨
                    </p>
                  )}
                </div>
              )
            })()}
        </div>
      </div>

      {/* 통계 */}
      {totalPulls > 0 && (
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {([1, 2, 3] as const).map((rarity) => (
              <div key={rarity} className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">{getRarityName(rarity)}</div>
                <div className="text-2xl font-bold mb-2">{state.rarityCount[rarity]}개</div>
                <div className="text-xs text-muted-foreground">
                  확률: {actualRates[rarity].toFixed(2)}% (목표:{' '}
                  {(defaultBanner.rates[rarity] * 100).toFixed(1)}%)
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      rarity === 3
                        ? 'bg-yellow-500'
                        : rarity === 2
                          ? 'bg-purple-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${actualRates[rarity]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 뽑기 결과 */}
      {lastResult.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">뽑기 결과 ({lastResult.length}개)</h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {lastResult.map((card, idx) => {
              const cardKey = `${card.id}-${idx}`
              const isProtected = protectedCards.has(cardKey)

              return (
                <div
                  key={cardKey}
                  className={`border-2 rounded-lg p-4 ${getRarityColorClass(card.등급)} transition-all hover:scale-105 relative`}
                >
                  {/* 보호 상태 표시 */}
                  {isProtected && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        🔒
                      </div>
                    </div>
                  )}

                  {/* 개별 보호 토글 버튼 */}
                  <button
                    onClick={() => toggleCardProtection(cardKey)}
                    className="absolute top-2 left-2 bg-background/80 hover:bg-background border border-border rounded-full p-1 transition-all"
                    title={isProtected ? '보호 해제' : '보호 설정'}
                  >
                    {isProtected ? '🔓' : '🔒'}
                  </button>

                  <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-background">
                    {card.심법_img ? (
                      <Image src={card.심법_img} alt={card.title} fill className="object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🧘
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm mb-1">{card.title}</div>
                    <div
                      className={`text-xs px-2 py-1 rounded inline-block mb-1 ${
                        card.등급 === 3
                          ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100'
                          : card.등급 === 2
                            ? 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100'
                            : 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      }`}
                    >
                      {getRarityName(card.등급)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isProtected ? '갈갈이 불가' : `서표 ${getFragmentsFromCard(card)}개`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 배너 정보 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 유파 상자 */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">유파 상자</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>선택된 유파:</strong>{' '}
              {factions.find((f) => f.code === selectedFaction)?.name || selectedFaction}
            </div>
            <div>
              <strong>심법 수:</strong> {factionBanner.pool.length}개
            </div>
            <div className="mt-4">
              <strong>확률:</strong>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                {([3, 2, 1] as const).map((rarity) => (
                  <li key={rarity}>
                    {getRarityName(rarity)}: {(factionBanner.rates[rarity] * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 전체 상자 */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">전체 상자</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>총 심법 수:</strong> {defaultBanner.pool.length}개
            </div>
            <div className="mt-4">
              <strong>확률:</strong>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                {([3, 2, 1] as const).map((rarity) => (
                  <li key={rarity}>
                    {getRarityName(rarity)}: {(defaultBanner.rates[rarity] * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
