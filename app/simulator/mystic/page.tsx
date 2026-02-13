'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
// import Link from 'next/link'
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

// 심법 데이터 통합 관리
interface MysticCardData {
  card: MysticCard
  count: number // 보관함에 실제 뽑아서 저장된 개수
  isSaved: boolean // 추적/보관 여부
}

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
  const [mysticCards, setMysticCards] = useState<Record<string, MysticCardData>>({})
  const [searchQuery, setSearchQuery] = useState<string>('') // 보관함 검색어

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
              유파_code: item.유파_code || '',
              유파: item.유파 || '',
              title: item.심법명 || '',
              body: '',
              순서: item.순서 || 0,
              등급: valid등급,
              심법_img: item.심법_이미지_url || null,
              유파_img: item.유파_이미지_url || null,
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

  // 뽑기 결과 처리 (추적 중인 심법은 자동으로 보관함에 추가)
  const processRollResult = useCallback(
    (cards: MysticCard[]) => {
      const cardsToShow: MysticCard[] = []
      const cardsToSave: MysticCard[] = []

      // 먼저 추적 중인 카드와 아닌 카드 분리
      cards.forEach((card) => {
        const key = `${card.title}-${card.등급}`
        if (mysticCards[key]?.isSaved) {
          cardsToSave.push(card)
        } else {
          cardsToShow.push(card)
        }
      })

      // 추적 중인 카드들의 count 증가
      if (cardsToSave.length > 0) {
        setMysticCards((prev) => {
          const updated = { ...prev }
          cardsToSave.forEach((card) => {
            const key = `${card.title}-${card.등급}`
            updated[key] = {
              ...updated[key],
              count: updated[key].count + 1,
            }
          })
          return updated
        })
      }

      // 나머지는 뽑기 결과에 누적
      if (cardsToShow.length > 0) {
        setLastResult((prev) => [...prev, ...cardsToShow])
      }
    },
    [mysticCards],
  )

  // 1주일 뽑기 (전체 108개)
  const handleWeeklyRoll = useCallback(() => {
    if (!factionBanner || !defaultBanner || isRolling) return

    setIsRolling(true)
    setTimeout(() => {
      try {
        // 전체 상자 108개
        const { cards: defaultCards, newState: finalState } = rollMultiple(
          defaultBanner,
          state,
          108,
        )

        // 1주일 뽑기 카운트 증가 + 서표 상자 카운트 리셋 (새로운 주 시작)
        setState({
          ...finalState,
          weeklyPullCount: finalState.weeklyPullCount + 1,
          fragmentBoxesThisWeek: 0,
        })
        processRollResult(defaultCards)
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
  }, [defaultBanner, state, isRolling, processRollResult])

  // 침중산 뽑기 (전체 3*N개)
  const handleChimjungsanRoll = useCallback(() => {
    if (!defaultBanner || isRolling || chimjungsanCount <= 0) return

    setIsRolling(true)
    const totalPulls = chimjungsanCount * 3

    setTimeout(() => {
      try {
        const { cards, newState } = rollMultiple(defaultBanner, state, totalPulls)

        // 침중산 사용 개수 증가
        setState({
          ...newState,
          chimjungsanUsed: newState.chimjungsanUsed + chimjungsanCount,
        })
        processRollResult(cards)
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
  }, [defaultBanner, state, isRolling, chimjungsanCount, processRollResult])

  // 리셋
  const handleReset = useCallback(() => {
    if (confirm('통계를 초기화하시겠습니까?')) {
      setState(createInitialState())
      setLastResult([])
    }
  }, [])

  // 서표로 변환 (최근 뽑기 결과 전체)
  const handleDismantleAll = useCallback(() => {
    if (lastResult.length === 0) {
      alert('서표로 변환할 심법이 없습니다!')
      return
    }

    const totalFragments = lastResult.reduce((sum, card) => sum + getFragmentsFromCard(card), 0)

    if (
      confirm(`${lastResult.length}개 심법을 서표로 변환하여 ${totalFragments} 서표를 얻습니다.`)
    ) {
      setState(dismantleCards(lastResult, state))
      setLastResult([])
    }
  }, [lastResult, state])

  // 서표로 상자 교환 (모든 서표 사용)
  const handleExchangeFragments = useCallback(() => {
    if (!factionBanner) return

    const availableBoxes = Math.floor(state.fragments / 5)
    if (availableBoxes === 0) {
      alert('서표가 부족합니다. 서표 5개당 상자 1개를 교환할 수 있습니다.')
      return
    }

    // 이번 주 서표 상자 제한 체크 (600개)
    const remainingWeeklyBoxes = 600 - state.fragmentBoxesThisWeek
    if (remainingWeeklyBoxes <= 0) {
      alert('이번 주 서표 상자 제한 600개에 도달했습니다. 1주일 뽑기 후 다시 뽑을 수 있습니다.')
      return
    }

    // 뽑을 상자 개수 (제한 내에서)
    const boxesToRoll = Math.min(availableBoxes, remainingWeeklyBoxes)
    const usedFragments = boxesToRoll * 5
    const remainingFragments = state.fragments - usedFragments

    let confirmMessage = `서표 ${usedFragments}개를 사용하여 유파 상자 ${boxesToRoll}개를 뽑습니다.\n(남은 서표: ${remainingFragments}개)`
    if (boxesToRoll < availableBoxes) {
      confirmMessage += `\n\n※ 이번 주 서표 상자 제한으로 ${boxesToRoll}개만 뽑을 수 있습니다.`
    }

    if (!confirm(confirmMessage)) {
      return
    }

    setIsRolling(true)
    setTimeout(() => {
      try {
        // 서표 차감
        const stateAfterExchange = exchangeFragmentsForBoxes(state, boxesToRoll)

        // 유파 상자 뽑기
        const { cards, newState } = rollMultiple(factionBanner, stateAfterExchange, boxesToRoll)

        // fragmentBoxesThisWeek 업데이트
        setState({
          ...newState,
          fragmentBoxesThisWeek: newState.fragmentBoxesThisWeek + boxesToRoll,
        })
        processRollResult(cards)
      } catch (error) {
        console.error('Exchange error:', error)
        alert(error instanceof Error ? error.message : '교환 중 오류가 발생했습니다.')
      } finally {
        setIsRolling(false)
      }
    }, 300)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, factionBanner, isRolling, processRollResult])

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
    <div className="container mx-auto py-8">
      {/* <div className="mb-6">
        <Link href="/builds" className="text-muted-foreground hover:text-foreground text-sm">
          ← 빌드 목록으로
        </Link>
      </div> */}

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
            1주일 뽑기: <span className="font-medium text-foreground">{state.weeklyPullCount}</span>
            주차
          </div>
          <div>
            침중산 사용:{' '}
            <span className="font-medium text-foreground">{state.chimjungsanUsed}</span>개
          </div>
          <div>
            서표: <span className="font-medium text-foreground">{state.fragments}</span>개
            <span className="text-xs ml-1">(상자 {Math.floor(state.fragments / 5)}개)</span>
          </div>
          <div>
            이번 주 서표 상자:{' '}
            <span className="font-medium text-foreground">{state.fragmentBoxesThisWeek}</span>개
            <span className="text-xs ml-1">/ 600개</span>
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
          <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              💡 <strong>상자 종류 설명:</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              • <strong>유파 상자</strong>: 선택한 유파 심법 + 공용 심법만 획득 가능
            </p>
            <p className="text-xs text-muted-foreground">
              • <strong>전체 상자</strong>: 모든 유파의 심법 획득 가능
            </p>
          </div>
        </div>

        {/* 뽑기 버튼들 */}
        <div className="flex flex-wrap gap-4 items-start">
          {/* 1주일 뽑기 (Primary) */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleWeeklyRoll}
              disabled={isRolling}
              className="px-6 py-3 rounded-md bg-accent text-background hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isRolling ? '뽑는 중...' : '1주일 뽑기 (108개)'}
            </button>

            <p className="text-xs text-muted-foreground">
              <strong className="text-accent">전체 상자 108개</strong>
              <span className="block mt-1">(지난 주: {state.weeklyPullCount}주)</span>
            </p>
          </div>

          {/* 침중산 */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="1"
                value={chimjungsanCount}
                onChange={(e) => setChimjungsanCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 border border-border rounded-md bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-accent"
              />

              <button
                onClick={handleChimjungsanRoll}
                disabled={isRolling}
                className="px-6 py-3 rounded-md bg-surface border border-border text-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isRolling ? '뽑는 중...' : '침중산 사용'}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              {chimjungsanCount}개 사용 ={' '}
              <strong className="text-accent">전체 상자 {chimjungsanCount * 3}개</strong> 뽑기
            </p>
          </div>

          {/* 서표 교환 */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleExchangeFragments}
              disabled={isRolling || state.fragments < 5 || state.fragmentBoxesThisWeek >= 600}
              className="px-6 py-3 rounded-md bg-surface border border-border text-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              서표로 상자 뽑기
            </button>

            <p className="text-xs text-muted-foreground">
              서표 5개 = <strong className="text-accent">유파 상자 1개</strong>
              {state.fragmentBoxesThisWeek >= 600 ? (
                <span className="text-red-500 block mt-1">(이번 주 제한 도달)</span>
              ) : (
                <span className="block mt-1">
                  (이번 주 남은 상자: {600 - state.fragmentBoxesThisWeek}개)
                </span>
              )}
            </p>
          </div>

          {/* 리셋 */}
          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-md bg-surface border border-border text-muted-foreground hover:bg-foreground/5 transition"
          >
            리셋
          </button>

          {/* 서표로 변환 (Danger - outline only) */}
          {lastResult.length > 0 && (
            <button
              onClick={handleDismantleAll}
              className=" px-6 py-3 rounded-md border border-red-500 text-red-500 hover:bg-red-500/10 transition"
            >
              서표로 변환 ({lastResult.length}개)
            </button>
          )}
        </div>
      </div>

      {/* 보관함 */}
      <div className="mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              심법 보관함 ({Object.values(mysticCards).reduce((sum, m) => sum + m.count, 0)}개)
            </h2>
            {Object.keys(mysticCards).length > 0 && (
              <button
                onClick={() => {
                  const totalCount = Object.values(mysticCards).reduce((sum, m) => sum + m.count, 0)
                  if (
                    confirm(
                      `보관함의 모든 심법 (${totalCount}개)을 비우고 추적도 모두 해제하시겠습니까?`,
                    )
                  ) {
                    setMysticCards({})
                    setSearchQuery('')
                  }
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm"
              >
                전체 비우기
              </button>
            )}
          </div>

          {/* 검색 */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="전체 심법 검색 (추적하려는 심법 이름 입력)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          {/* 검색 결과 (전체 심법에서 검색) */}
          {searchQuery && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                검색 결과 (클릭하여 추적)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-4 bg-muted/30 rounded-lg">
                {(() => {
                  // 전체 심법에서 검색
                  const searchResults = allCards
                    .filter((card) => card.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .reduce(
                      (acc, card) => {
                        const key = `${card.title}-${card.등급}`
                        if (!acc[key]) {
                          acc[key] = card
                        }
                        return acc
                      },
                      {} as Record<string, MysticCard>,
                    )

                  const results = Object.values(searchResults).sort((a, b) => {
                    if (a.등급 !== b.등급) {
                      return b.등급 - a.등급
                    }
                    return a.title.localeCompare(b.title)
                  })

                  if (results.length === 0) {
                    return (
                      <div className="col-span-full text-center text-muted-foreground py-4">
                        검색 결과가 없습니다.
                      </div>
                    )
                  }

                  return results.map((card, idx) => {
                    const key = `${card.title}-${card.등급}`
                    const isTracked = mysticCards[key]?.isSaved

                    return (
                      <button
                        key={`search-${idx}`}
                        onClick={() => {
                          setMysticCards((prev) => ({
                            ...prev,
                            [key]: {
                              card,
                              count: 0,
                              isSaved: true,
                            },
                          }))
                        }}
                        disabled={isTracked}
                        className={`border-2 rounded-lg p-2 ${getRarityColorClass(card.등급)} flex items-center gap-3 ${
                          isTracked
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105 cursor-pointer'
                        } transition-all`}
                      >
                        {card.심법_img && (
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-black flex-shrink-0">
                            <Image
                              src={card.심법_img}
                              alt={card.title}
                              fill
                              className="object-contain text-white text-sm"
                            />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium text-black -mb-[5px]">{card.title}</div>
                          {card.유파_img && (
                            <div className="relative w-8 h-8 inline-block mt-0.5">
                              <Image
                                src={card.유파_img}
                                alt={card.유파 || card.title}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>
                        <div className={isTracked ? 'text-blue-600' : 'text-green-600'}>
                          {isTracked ? '✓' : '+'}
                        </div>
                      </button>
                    )
                  })
                })()}
              </div>
            </div>
          )}

          {/* 보관된 심법별 집계 결과 */}
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">보관된 심법</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(() => {
              // isSaved === true인 심법들만 필터링하고 정렬
              const savedList = Object.entries(mysticCards)
                .filter(([_, data]) => data.isSaved)
                .map(([key, data]) => ({ key, ...data }))
                .sort((a, b) => {
                  if (a.card.등급 !== b.card.등급) {
                    return b.card.등급 - a.card.등급
                  }
                  return a.card.title.localeCompare(b.card.title)
                })

              if (savedList.length === 0) {
                return (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    보관함이 비어있습니다. 위 검색에서 추적할 심법을 선택하면, 뽑기에서 나올 때
                    자동으로 보관됩니다.
                  </div>
                )
              }

              return savedList.map(({ key, card, count }) => {
                const removeCard = () => {
                  if (
                    confirm(
                      `"${card.title}" (${getRarityName(card.등급)}) ${count}개를 모두 제거하고 추적도 해제하시겠습니까?`,
                    )
                  ) {
                    setMysticCards((prev) => {
                      const updated = { ...prev }
                      delete updated[key]
                      return updated
                    })
                  }
                }

                return (
                  <div
                    key={key}
                    className={`border-2 rounded-lg p-2 ${getRarityColorClass(card.등급)} flex items-center justify-between relative`}
                  >
                    {/* 제거 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCard()
                      }}
                      className="absolute -top-2 -right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white text-sm transition-all"
                      title={`${card.title} 전체 제거`}
                    >
                      ✕
                    </button>

                    <div className="flex items-center gap-3">
                      {card.심법_img && (
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-black flex-shrink-0">
                          <Image
                            src={card.심법_img}
                            alt={card.title}
                            fill
                            className="object-contain text-white text-sm"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-black -mb-[5px]">{card.title}</div>
                        {card.유파_img && (
                          <div className="relative w-8 h-8 inline-block mt-0.5">
                            <Image
                              src={card.유파_img}
                              alt={card.유파 || card.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-black">×{count}</div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>

      {/* 최근 뽑기 결과 */}
      {lastResult.length > 0 && (
        <div className="mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">뽑기 결과</h2>
            </div>

            {/* 심법별 집계 결과 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {(() => {
                // 심법별로 그룹핑
                const cardGroups = lastResult.reduce(
                  (acc, card) => {
                    const key = `${card.title}-${card.등급}`
                    if (!acc[key]) {
                      acc[key] = {
                        card,
                        count: 0,
                      }
                    }
                    acc[key].count++
                    return acc
                  },
                  {} as Record<string, { card: MysticCard; count: number }>,
                )

                // 등급별로 정렬 (전설 > 영웅 > 희귀)
                const sortedGroups = Object.values(cardGroups).sort((a, b) => {
                  if (a.card.등급 !== b.card.등급) {
                    return b.card.등급 - a.card.등급
                  }
                  return a.card.title.localeCompare(b.card.title)
                })

                return sortedGroups.map(({ card, count }, idx) => {
                  // 이 심법을 보관함으로 이동
                  const moveToSaved = () => {
                    const cardsToMove = lastResult.filter(
                      (c) => c.title === card.title && c.등급 === card.등급,
                    )

                    if (cardsToMove.length === 0) return

                    const key = `${card.title}-${card.등급}`

                    // mysticCards에 추가 또는 카운트 증가
                    setMysticCards((prev) => {
                      const existing = prev[key]
                      return {
                        ...prev,
                        [key]: {
                          card,
                          count: (existing?.count || 0) + cardsToMove.length,
                          isSaved: true,
                        },
                      }
                    })

                    // 뽑기 결과에서 제거
                    setLastResult((prev) =>
                      prev.filter((c) => !(c.title === card.title && c.등급 === card.등급)),
                    )
                  }

                  return (
                    <div
                      key={`${card.id}-${idx}`}
                      className={`border-2 rounded-lg p-2 ${getRarityColorClass(card.등급)} flex items-center justify-between relative`}
                    >
                      {/* 보관 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveToSaved()
                        }}
                        className="absolute -top-2 -right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all bg-blue-600 hover:bg-blue-700 text-white"
                        title="보관함으로 이동"
                      >
                        📥
                      </button>

                      <div className="flex items-center gap-3">
                        {card.심법_img && (
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-black flex-shrink-0">
                            <Image
                              src={card.심법_img}
                              alt={card.title}
                              fill
                              className="object-contain text-white text-sm"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-black -mb-[5px]">{card.title}</div>
                          {card.유파_img && (
                            <div className="relative w-8 h-8 inline-block mt-0.5">
                              <Image
                                src={card.유파_img}
                                alt={card.유파 || card.title}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-black">×{count}</div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      )}

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
