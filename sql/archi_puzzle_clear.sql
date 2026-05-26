-- ============================================
-- 아치 퍼즐 클리어 기록 (/archi/puzzle/1, /2) — archi = 아치
-- ============================================
USE `wwe_db`;

CREATE TABLE IF NOT EXISTS `T_아치_퍼즐_클리어` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `puzzle_id` VARCHAR(16) NOT NULL COMMENT '퍼즐 ID (1=슬라이딩, 2=구슬점프)',
  `nickname` VARCHAR(64) NOT NULL COMMENT '플레이어 닉네임 (미입력 시 테스트아치)',
  `move_count` INT NOT NULL COMMENT '클리어 시 이동 횟수',
  `uid` VARCHAR(255) NULL COMMENT 'T_UID.uid (선택, 브라우저 식별)',
  `cleared_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '클리어 시각',
  INDEX idx_puzzle_id (`puzzle_id`),
  INDEX idx_cleared_at (`cleared_at` DESC),
  INDEX idx_puzzle_moves (`puzzle_id`, `move_count`),
  INDEX idx_nickname (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


select * from T_아치_퍼즐_클리어;
