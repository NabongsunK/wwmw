// uid (T_유저_uid) 관련 타입

export interface Uid {
  uid: string
  created_at: Date
  updated_at: Date
}

export interface CreateUidDto {
  uid: string
}
