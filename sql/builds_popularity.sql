-- 빌드 인기도 추적을 위한 테이블 추가

-- 빌드 조회수 추적 테이블
CREATE TABLE IF NOT EXISTS `T_빌드보드_조회` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `빌드보드_id` INT NOT NULL,
  `user_id` INT NULL, -- 로그인한 사용자 (NULL이면 비로그인)
  `ip_address` VARCHAR(45), -- IP 주소 (비로그인 사용자 추적용)
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  INDEX idx_build_id (`빌드보드_id`),
  INDEX idx_created_at (`created_at`),
  INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 빌드 좋아요/북마크 테이블
CREATE TABLE IF NOT EXISTS `T_빌드보드_좋아요` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `빌드보드_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_build_like` (`빌드보드_id`, `user_id`),
  INDEX idx_build_id (`빌드보드_id`),
  INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 빌드 통계 뷰 (실시간 집계)
CREATE OR REPLACE VIEW `V_빌드보드_통계` AS
SELECT 
  b.id AS 빌드보드_id,
  b.name,
  b.status,
  b.created_at,
  -- 최근 24시간 조회수
  COUNT(DISTINCT CASE 
    WHEN v.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
    THEN v.id 
  END) AS 최근24시간_조회수,
  -- 최근 7일 조회수
  COUNT(DISTINCT CASE 
    WHEN v.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
    THEN v.id 
  END) AS 최근7일_조회수,
  -- 전체 조회수
  COUNT(DISTINCT v.id) AS 전체_조회수,
  -- 좋아요 수
  COUNT(DISTINCT l.id) AS 좋아요_수,
  -- 최근 좋아요 수 (7일)
  COUNT(DISTINCT CASE 
    WHEN l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
    THEN l.id 
  END) AS 최근7일_좋아요,
  -- 인기도 점수 계산 (가중치 적용)
  (
    COUNT(DISTINCT CASE 
      WHEN v.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
      THEN v.id 
    END) * 10 + -- 최근 24시간 조회수 * 10
    COUNT(DISTINCT CASE 
      WHEN v.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
      THEN v.id 
    END) * 3 + -- 최근 7일 조회수 * 3
    COUNT(DISTINCT l.id) * 5 + -- 좋아요 * 5
    COUNT(DISTINCT CASE 
      WHEN l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
      THEN l.id 
    END) * 8 -- 최근 좋아요 * 8
  ) AS 인기도_점수
FROM `T_빌드보드` b
LEFT JOIN `T_빌드보드_조회` v ON b.id = v.빌드보드_id
LEFT JOIN `T_빌드보드_좋아요` l ON b.id = l.빌드보드_id
WHERE b.deleted_at IS NULL
GROUP BY b.id, b.name, b.status, b.created_at;

-- 인기 빌드 뷰 (인기도 점수 순)
CREATE OR REPLACE VIEW `V_빌드보드_인기` AS
SELECT 
  b.*,
  s.최근24시간_조회수,
  s.최근7일_조회수,
  s.전체_조회수,
  s.좋아요_수,
  s.인기도_점수
FROM `T_빌드보드` b
INNER JOIN `V_빌드보드_통계` s ON b.id = s.빌드보드_id
WHERE b.deleted_at IS NULL
  AND b.status = 'active'
ORDER BY s.인기도_점수 DESC, s.최근24시간_조회수 DESC, b.created_at DESC;

-- 트렌딩 빌드 뷰 (최근 활동이 많은 빌드)
CREATE OR REPLACE VIEW `V_빌드보드_트렌딩` AS
SELECT 
  b.*,
  s.최근24시간_조회수,
  s.최근7일_조회수,
  s.좋아요_수,
  s.최근7일_좋아요,
  s.인기도_점수,
  -- 트렌딩 점수 (최근 활동에 더 높은 가중치)
  (
    s.최근24시간_조회수 * 20 +
    s.최근7일_좋아요 * 15 +
    s.최근7일_조회수 * 2
  ) AS 트렌딩_점수
FROM `T_빌드보드` b
INNER JOIN `V_빌드보드_통계` s ON b.id = s.빌드보드_id
WHERE b.deleted_at IS NULL
  AND b.status = 'active'
  AND s.최근24시간_조회수 > 0 -- 최소한의 활동이 있는 빌드만
ORDER BY 트렌딩_점수 DESC, s.최근24시간_조회수 DESC
LIMIT 20;

