// 심법 뽑기 시뮬레이터 로직

export type MysticRarity = 1 | 2 | 3 // 1: 희귀, 2: 영웅, 3: 전설

export interface MysticCard {
  id: number
  유파_code: string
  유파: string
  title: string
  body: string
  순서: number
  등급: MysticRarity
  심법_img: string | null
  유파_img: string | null
}

export interface GachaBanner {
  id: string
  name: string
  pool: MysticCard[]
  rates: Record<MysticRarity, number> // 확률 (0~1)
}

export interface GachaState {
  pulls: number // 총 뽑기 횟수
  history: MysticCard[] // 뽑기 히스토리
  fragments: number // 서표로 변환하여 얻는 서표
  rarityCount: Record<MysticRarity, number> // 등급별 획득 개수
  weeklyPullCount: number // 1주일 뽑기 횟수
  chimjungsanUsed: number // 침중산 사용 개수
  fragmentBoxesThisWeek: number // 이번 주에 서표로 뽑은 상자 개수
}

export interface GachaResult {
  card: MysticCard
}

export interface GachaTenResult {
  cards: MysticCard[]
  newState: GachaState
}

/**
 * 기본 배너 생성 (전체 심법)
 */
export function createDefaultBanner(allCards: MysticCard[]): GachaBanner {
  return {
    id: 'default',
    name: '전체 상자',
    pool: allCards,
    rates: {
      1: 0.4, // 희귀 40%
      2: 0.4, // 영웅 40%
      3: 0.2, // 전설 20%
    },
  }
}

/**
 * 유파 배너 생성 (특정 유파 심법 + 공용 심법)
 */
export function createFactionBanner(allCards: MysticCard[], factionCode: string): GachaBanner {
  // 선택한 유파의 심법 + 공용 심법
  const factionCards = allCards.filter(
    (card) => card.유파_code === factionCode || card.유파_code === '1001000', //공용
  )

  return {
    id: `faction-${factionCode}`,
    name: '유파 상자',
    pool: factionCards.length > 0 ? factionCards : allCards, // 유파 카드가 없으면 전체 풀 사용
    rates: {
      1: 0.4, // 희귀 40%
      2: 0.4, // 영웅 40%
      3: 0.2, // 전설 20%
    },
  }
}

/**
 * 사용 가능한 유파 목록 가져오기
 */
export function getAvailableFactions(
  allCards: MysticCard[],
): Array<{ code: string; name: string }> {
  const factionCodes = new Set(allCards.map((card) => card.유파_code))
  return Array.from(factionCodes).map((code) => ({
    code,
    name: code, // 실제로는 UDF_BaseCode로 이름을 가져와야 하지만, 여기서는 코드 사용
  }))
}

/**
 * 등급 결정
 */
function determineRarity(banner: GachaBanner): MysticRarity {
  // 확률에 따라 등급 결정
  const rand = Math.random()
  let cumulative = 0

  // 전설부터 역순으로 체크 (높은 등급 우선)
  const rarities: MysticRarity[] = [3, 2, 1]
  for (const rarity of rarities) {
    cumulative += banner.rates[rarity]
    if (rand <= cumulative) {
      return rarity
    }
  }

  return 1 // 기본값
}

/**
 * 등급에 맞는 카드 선택
 */
function selectCardByRarity(banner: GachaBanner, rarity: MysticRarity): MysticCard {
  if (!banner.pool || banner.pool.length === 0) {
    throw new Error('Banner pool is empty')
  }

  const cardsOfRarity = banner.pool.filter((card) => card && card.등급 === rarity)
  if (cardsOfRarity.length === 0) {
    // 해당 등급 카드가 없으면 전체 풀에서 랜덤 선택
    const validCards = banner.pool.filter((card) => card != null)
    if (validCards.length === 0) {
      throw new Error('No valid cards in banner pool')
    }
    const randomIndex = Math.floor(Math.random() * validCards.length)
    return validCards[randomIndex]
  }
  const randomIndex = Math.floor(Math.random() * cardsOfRarity.length)
  return cardsOfRarity[randomIndex]
}

/**
 * 단일 뽑기
 */
export function rollOnce(
  banner: GachaBanner,
  state: GachaState,
): {
  result: GachaResult
  newState: GachaState
} {
  if (!banner || !banner.pool || banner.pool.length === 0) {
    throw new Error('Invalid banner or empty pool')
  }

  const rarity = determineRarity(banner)
  const card = selectCardByRarity(banner, rarity)

  if (!card || card.등급 === undefined) {
    throw new Error(`Invalid card selected: ${JSON.stringify(card)}`)
  }

  // 새 상태 계산
  const newRarityCount = { ...state.rarityCount }
  newRarityCount[rarity] = (newRarityCount[rarity] || 0) + 1

  const newState: GachaState = {
    pulls: state.pulls + 1,
    history: [...state.history, card],
    fragments: state.fragments, // fragments는 유지
    rarityCount: newRarityCount,
    weeklyPullCount: state.weeklyPullCount,
    chimjungsanUsed: state.chimjungsanUsed,
    fragmentBoxesThisWeek: state.fragmentBoxesThisWeek,
  }

  return {
    result: { card },
    newState,
  }
}

/**
 * 초기 상태 생성
 */
export function createInitialState(): GachaState {
  return {
    pulls: 0,
    history: [],
    fragments: 0,
    rarityCount: {
      1: 0,
      2: 0,
      3: 0,
    },
    weeklyPullCount: 0,
    chimjungsanUsed: 0,
    fragmentBoxesThisWeek: 0,
  }
}

/**
 * 등급 이름 변환
 */
export function getRarityName(rarity: MysticRarity): string {
  const names: Record<MysticRarity, string> = {
    1: '희귀',
    2: '영웅',
    3: '전설',
  }
  return names[rarity]
}

/**
 * 등급 색상 클래스
 */
export function getRarityColorClass(rarity: MysticRarity): string {
  const colors: Record<MysticRarity, string> = {
    1: 'border-blue-400 bg-blue-50 dark:bg-blue-950', // 희귀 (파랑)
    2: 'border-purple-400 bg-purple-50 dark:bg-purple-950', // 영웅 (보라)
    3: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950', // 전설 (금색)
  }
  return colors[rarity]
}

/**
 * N개 뽑기 (대량 뽑기)
 */
export function rollMultiple(
  banner: GachaBanner,
  state: GachaState,
  count: number,
): GachaTenResult {
  if (!banner || !banner.pool || banner.pool.length === 0) {
    throw new Error('Invalid banner or empty pool')
  }

  if (count <= 0) {
    throw new Error('Count must be greater than 0')
  }

  let currentState = { ...state }
  const cards: MysticCard[] = []

  for (let i = 0; i < count; i++) {
    const { result, newState } = rollOnce(banner, currentState)

    if (!result || !result.card || result.card.등급 === undefined) {
      throw new Error(`Invalid card result at pull ${i + 1}: ${JSON.stringify(result)}`)
    }

    cards.push(result.card)
    currentState = newState
  }

  return {
    cards,
    newState: currentState,
  }
}

/**
 * 심득교체 - 서표 획득
 * 금색(3): 유파 15, 공용 10
 * 보라(2): 유파 5, 공용 4
 * 파랑(1): 2
 */
export function getFragmentsFromCard(card: MysticCard): number {
  const isCommon = card.유파_code === '1001000'

  if (card.등급 === 3) {
    return isCommon ? 10 : 15 // 금색
  } else if (card.등급 === 2) {
    return isCommon ? 4 : 5 // 보라
  } else {
    return 2 // 파랑
  }
}

/**
 * 여러 심법을 한번에 서표로 변환
 */
export function dismantleCards(cards: MysticCard[], state: GachaState): GachaState {
  const totalFragments = cards.reduce((sum, card) => sum + getFragmentsFromCard(card), 0)

  return {
    ...state,
    fragments: state.fragments + totalFragments,
  }
}

/**
 * 서표 5개 -> 상자 1개 교환
 * 1주일 600상자 = 3000 서표
 */
export function exchangeFragmentsForBoxes(state: GachaState, boxCount: number): GachaState {
  const requiredFragments = boxCount * 5

  if (state.fragments < requiredFragments) {
    throw new Error(`서표가 부족합니다. 필요: ${requiredFragments}, 보유: ${state.fragments}`)
  }

  return {
    ...state,
    fragments: state.fragments - requiredFragments,
  }
}
