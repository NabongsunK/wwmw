-- 스무고개용 테이블 (hint / answer / user / lang)
-- schema_simple.sql 적용 후 실행

USE `wwe_db`;

CREATE TABLE IF NOT EXISTS `T_스무고개` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hint` VARCHAR(255) NOT NULL COMMENT '힌트 (예: 플라밍고)',
  `answer` VARCHAR(255) NOT NULL COMMENT '정답 (예: 홍학)',
  `user_id` VARCHAR(255) NULL COMMENT '등록자 uid (쿠키, T_UID.uid)',
  `lang` VARCHAR(4) NOT NULL DEFAULT 'ko' COMMENT '언어 (ko, en, ja, zh)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lang (`lang`),
  INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
