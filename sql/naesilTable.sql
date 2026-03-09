CREATE TABLE IF NOT EXISTS `T_naesilBoard` (
 `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type_code` VARCHAR(7) NULL COMMENT '타입 코드 (T_CodeBase.code 참조)',
  `region_code` VARCHAR(7) NULL COMMENT '지역 코드 (T_CodeBase.code 참조)',
  `subRegion_code` VARCHAR(7) NULL COMMENT '지역 코드 (T_CodeBase.code 참조)',
  `title_code` VARCHAR(7) NULL COMMENT '제목 코드 (T_CodeBase.code 참조)',
  `order` INT DEFAULT 0 COMMENT '정렬 순서',
  `lang` VARCHAR(4) NOT NULL DEFAULT 'ko' COMMENT '언어 (ko, en, ja, zh)',
  `body` TEXT NULL COMMENT '내용',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `writer_id` VARCHAR(255) NULL COMMENT '작성자 uid (T_UID.uid)',
  `notice` TINYINT(1) DEFAULT 0 COMMENT '공지 여부',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '삭제 여부',
  `deleted_at` TIMESTAMP NULL COMMENT '삭제 일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS `T_Region` (
  `cd1` VARCHAR(7) NOT NULL COMMENT '코드1 (대분류)',
  `cd2` VARCHAR(7) NOT NULL COMMENT '코드2 (중분류)',
  `cd3` VARCHAR(7) NOT NULL COMMENT '코드3 (소분류)',
  PRIMARY KEY (`cd1`, `cd2`, `cd3`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 
