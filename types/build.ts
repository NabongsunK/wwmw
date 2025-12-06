// 빌드 관련 타입 정의

export interface Build {
  id: number;
  name: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'archived';
  무술들?: BuildItem[];
  심법들?: BuildItem[];
  비결들?: BuildItem[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  // 인기도 관련 필드 (선택적)
  조회수?: number;
  좋아요수?: number;
  인기도점수?: number;
  트렌딩점수?: number;
}

export interface BuildItem {
  id: number;
  순서?: number;
}

export interface CreateBuildDto {
  name: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'archived';
  무술들?: BuildItem[];
  심법들?: BuildItem[];
  비결들?: BuildItem[];
}

export interface UpdateBuildDto {
  name?: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'archived';
  무술들?: BuildItem[];
  심법들?: BuildItem[];
  비결들?: BuildItem[];
}

// 인기도 관련 타입
export interface BuildStats {
  빌드보드_id: number;
  최근24시간_조회수: number;
  최근7일_조회수: number;
  전체_조회수: number;
  좋아요_수: number;
  최근7일_좋아요: number;
  인기도_점수: number;
}
