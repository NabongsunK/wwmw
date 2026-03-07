// 스무고개 (hint-answer) 타입

export interface TwentyQuestion {
  id: number
  hint: string
  answer: string
  user_id: string | null
  lang: string
  created_at: Date
}

export interface CreateTwentyQuestionDto {
  hint: string
  answer: string
  user_id?: string
  lang?: string
}
