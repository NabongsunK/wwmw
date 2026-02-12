// 심법 뽑기 시뮬레이터 로직

export type MysticRarity = 1 | 2 | 3 | 4 // 1: 일반, 2: 희귀, 3: 영웅, 4: 전설

export interface MysticCard {
  id: number
  유파_code: string
  title: string
  body: string
  순서: number
  등급: MysticRarity
  심법_img: string | null
}

export interface GachaBanner {
  id: string
  name: string
  pool: MysticCard[]
  rates: Record<MysticRarity, number> // 확률 (0~1)
  pityMax?: number // 피티 최대 횟수
  pityTarget?: MysticRarity // 피티 대상 등급
}

export interface GachaState {
  pulls: number // 총 뽑기 횟수
  pityCount: number // 마지막 전설 이후 카운트
  history: MysticCard[] // 뽑기 히스토리
  shards: number // 중복 시 얻는 재화
  rarityCount: Record<MysticRarity, number> // 등급별 획득 개수
}

export interface GachaResult {
  card: MysticCard
  isPity: boolean // 피티로 뽑았는지
}

export interface GachaTenResult {
  cards: MysticCard[]
  newState: GachaState
}

/**
 * 기본 배너 생성
 */
export function createDefaultBanner(allCards: MysticCard[]): GachaBanner {
  return {
    id: 'default',
    name: '기본 배너',
    pool: allCards,
    rates: {
      1: 0.6, // 일반 60%
      2: 0.3, // 희귀 30%
      3: 0.08, // 영웅 8%
      4: 0.02, // 전설 2%
    },
    pityMax: 90, // 90회 안에 전설 보장
    pityTarget: 4,
  }
}

/**
 * 등급 결정 (피티 고려)
 */
function determineRarity(banner: GachaBanner, state: GachaState): MysticRarity {
  // 피티 체크
  if (banner.pityMax && banner.pityTarget && state.pityCount >= banner.pityMax - 1) {
    return banner.pityTarget
  }

  // 확률에 따라 등급 결정
  const rand = Math.random()
  let cumulative = 0

  // 전설부터 역순으로 체크 (높은 등급 우선)
  const rarities: MysticRarity[] = [4, 3, 2, 1]
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
export function rollOnce(banner: GachaBanner, state: GachaState): {
  result: GachaResult
  newState: GachaState
} {
  if (!banner || !banner.pool || banner.pool.length === 0) {
    throw new Error('Invalid banner or empty pool')
  }

  const rarity = determineRarity(banner, state)
  const card = selectCardByRarity(banner, rarity)
  
  if (!card || card.등급 === undefined) {
    throw new Error(`Invalid card selected: ${JSON.stringify(card)}`)
  }

  const isPity = banner.pityMax && banner.pityTarget && state.pityCount >= banner.pityMax - 1

  // 새 상태 계산
  const newPityCount = rarity === (banner.pityTarget || 4) ? 0 : state.pityCount + 1
  const newRarityCount = { ...state.rarityCount }
  newRarityCount[rarity] = (newRarityCount[rarity] || 0) + 1

  const newState: GachaState = {
    pulls: state.pulls + 1,
    pityCount: newPityCount,
    history: [...state.history, card],
    shards: state.shards + (rarity >= 3 ? 10 : 1), // 영웅 이상은 10, 그 외는 1
    rarityCount: newRarityCount,
  }

  return {
    result: { card, isPity },
    newState,
  }
}

/**
 * 10연차 뽑기
 */
export function rollTen(banner: GachaBanner, state: GachaState): GachaTenResult {
  if (!banner || !banner.pool || banner.pool.length === 0) {
    throw new Error('Invalid banner or empty pool')
  }

  let currentState = { ...state }
  const cards: MysticCard[] = []
  let hasEpicOrHigher = false

  // 9회 뽑기
  for (let i = 0; i < 9; i++) {
    const { result, newState } = rollOnce(banner, currentState)
    
    if (!result || !result.card || result.card.등급 === undefined) {
      throw new Error(`Invalid card result at pull ${i + 1}: ${JSON.stringify(result)}`)
    }
    
    cards.push(result.card)
    if (result.card.등급 >= 3) {
      hasEpicOrHigher = true
    }
    currentState = newState
  }

  // 10번째: 최소 영웅 이상 보장 (9회 중에 영웅 이상이 없으면)
  if (!hasEpicOrHigher) {
    // 영웅 이상 등급으로 강제
    const epicRarities: MysticRarity[] = [3, 4]
    const targetRarity = epicRarities[Math.floor(Math.random() * epicRarities.length)]
    const card = selectCardByRarity(banner, targetRarity)

    if (!card || card.등급 === undefined) {
      throw new Error(`Failed to select card with rarity ${targetRarity}`)
    }

    // 피티 카운트 업데이트
    const newPityCount = targetRarity === (banner.pityTarget || 4) ? 0 : currentState.pityCount + 1
    const newRarityCount = { ...currentState.rarityCount }
    newRarityCount[targetRarity] = (newRarityCount[targetRarity] || 0) + 1

    cards.push(card)
    currentState = {
      pulls: currentState.pulls + 1,
      pityCount: newPityCount,
      history: [...currentState.history, card],
      shards: currentState.shards + (targetRarity >= 3 ? 10 : 1),
      rarityCount: newRarityCount,
    }
  } else {
    // 일반 뽑기
    const { result, newState } = rollOnce(banner, currentState)
    
    if (!result || !result.card || result.card.등급 === undefined) {
      throw new Error(`Invalid card result at 10th pull: ${JSON.stringify(result)}`)
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
 * 초기 상태 생성
 */
export function createInitialState(): GachaState {
  return {
    pulls: 0,
    pityCount: 0,
    history: [],
    shards: 0,
    rarityCount: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    },
  }
}

/**
 * 등급 이름 변환
 */
export function getRarityName(rarity: MysticRarity): string {
  const names: Record<MysticRarity, string> = {
    1: '일반',
    2: '희귀',
    3: '영웅',
    4: '전설',
  }
  return names[rarity]
}

/**
 * 등급 색상 클래스
 */
export function getRarityColorClass(rarity: MysticRarity): string {
  const colors: Record<MysticRarity, string> = {
    1: 'border-gray-400 bg-gray-50 dark:bg-gray-900', // 일반
    2: 'border-blue-400 bg-blue-50 dark:bg-blue-950', // 희귀
    3: 'border-purple-400 bg-purple-50 dark:bg-purple-950', // 영웅
    4: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950', // 전설
  }
  return colors[rarity]
}
