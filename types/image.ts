// 이미지 관련 타입 정의

export type ImageType = '유파' | '장비' | '무술' | '스킬' | '비결' | '심법';

export interface Image {
  id: number;
  code: string;
  image_type: ImageType;
  img_path: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateImageDto {
  code: string;
  image_type: ImageType;
  img_path: string;
}

export interface UpdateImageDto {
  code?: string;
  image_type?: ImageType;
  img_path?: string;
}
