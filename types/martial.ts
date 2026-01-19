// 무술계층 관련 타입 정의

export type MartialType = '유파' | '장비' | '무술' | '스킬';
export type Lang = 'ko' | 'en' | 'ja' | 'zh';

export interface MartialHierarchy {
  id: number;
  유파_code: string | null;
  장비_code: string | null;
  무술_code: string | null;
  스킬_code: string | null;
  순서: number;
  키보드_키: string | null;
  패드_키: string | null;
  유파_img: number | null;
  장비_img: number | null;
  무술_img: number | null;
  스킬_img: number | null;
  created_at: Date;
  updated_at: Date;
}

// 다국어 지원 응답 타입
export interface MartialHierarchyWithNames extends MartialHierarchy {
  유파_name: string | null;
  장비_name: string | null;
  무술_name: string | null;
  스킬_name: string | null;
  유파_img_path: string | null;
  장비_img_path: string | null;
  무술_img_path: string | null;
  스킬_img_path: string | null;
}
