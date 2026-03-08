// 심법 관련 타입 정의

export interface WanderingTales {
  id: number
  title: string
  region: string
  subRegion: string
  order?: number
  sort_order?: number
  body?: string
  created_at: Date
  updated_at: Date
  writer: string
  notice: number
  view_count: number
  like_count: number
  comment_count: number
}
