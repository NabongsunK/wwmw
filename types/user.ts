// 사용자 관련 타입 정의

export interface User {
  id: number
  name: string
  email: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
}

export interface CreateUserDto {
  name: string
  email: string
}

export interface UpdateUserDto {
  name?: string
  email?: string
}
