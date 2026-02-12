// API 응답 타입 정의

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}
