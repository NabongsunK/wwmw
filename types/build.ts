// 빌드 관련 타입 정의

export type BuildCategory = 'PVE' | 'PVP' | 'RVR' | '시련'

export interface Build {
  id: number
  name: string
  description?: string
  category: BuildCategory // 빌드 용도 구분
  version_id?: number // 게임 버전 ID (자동 설정)
  version_name?: string // 게임 버전명 (조회용)
  status?: 'active' | 'inactive' | 'archived'
  user_id?: string | null // 작성자 uid (T_UID.uid)
  무술들?: BuildItem[]
  심법들?: BuildItem[]
  비결들?: BuildItem[]
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
  // 인기도 관련 필드 (선택적)
  조회수?: number
  좋아요수?: number
  인기도점수?: number
  트렌딩점수?: number
}

export interface BuildItem {
  id: number
  순서?: number
  무술_img?: string
  유파_img?: string
  장비_img?: string
  패드_키?: string
  무술_code?: string
  유파_code?: string
  장비_code?: string
  키보드_키?: string
}

export interface CreateBuildDto {
  name: string
  description?: string
  category: BuildCategory // 필수: 빌드 용도 선택
  /** 작성자 uid (T_UID.uid). 글쓸 때 누가 썼는지 저장 */
  uid?: string
  // version은 서버에서 자동으로 현재 활성 버전으로 설정
  status?: 'active' | 'inactive' | 'archived'
  무술들?: BuildItem[]
  심법들?: BuildItem[]
  비결들?: BuildItem[]
}

export interface UpdateBuildDto {
  name?: string
  description?: string
  category?: BuildCategory
  status?: 'active' | 'inactive' | 'archived'
  무술들?: BuildItem[]
  심법들?: BuildItem[]
  비결들?: BuildItem[]
}

// 게임 버전 타입
export interface GameVersion {
  id: number
  version: string
  description?: string
  is_active: boolean
  start_date: Date
  end_date?: Date | null
  created_at: Date
  updated_at: Date
}

// 인기도 관련 타입
export interface BuildStats {
  빌드보드_id: number
  최근24시간_조회수: number
  최근7일_조회수: number
  전체_조회수: number
  좋아요_수: number
  최근7일_좋아요: number
  인기도_점수: number
}
