// 리더보드 관련 타입 정의

export interface Leaderboard {
  id: number
  user_id: string
  빌드보드_id: number
  점수: number
  유파_code: string | null
  기록일: Date
  created_at: Date
}

export interface CreateLeaderboardDto {
  user_id: string
  빌드보드_id: number
  점수: number
  유파_code?: string | null
  기록일?: Date
}

export interface LeaderboardRanking extends Leaderboard {
  랭킹?: number
  빌드보드명?: string
  유파_랭킹?: number
  일별_랭킹?: number
}
