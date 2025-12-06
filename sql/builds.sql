-- 빌드 테이블 생성

CREATE TABLE IF NOT EXISTS `T_빌드보드` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `version` VARCHAR(50),
  `status` ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX idx_builds_status (`status`),
  INDEX idx_builds_created_at (`created_at`),
  INDEX idx_builds_deleted_at (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 빌드-무술 관계 테이블
CREATE TABLE IF NOT EXISTS `T_빌드보드_무술` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `빌드보드_id` INT NOT NULL,
  `무술_id` INT NOT NULL,
  `순서` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`무술_id`) REFERENCES `T_무술` (`id`),
  UNIQUE KEY `unique_build_martial` (`빌드보드_id`, `무술_id`),
  INDEX idx_build_id (`빌드보드_id`),
  INDEX idx_martial_id (`무술_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 빌드-심법 관계 테이블
CREATE TABLE IF NOT EXISTS `T_빌드보드_심법` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `빌드보드_id` INT NOT NULL,
  `심법_id` INT NOT NULL,
  `순서` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`심법_id`) REFERENCES `T_심법` (`id`),
  UNIQUE KEY `unique_build_technique` (`빌드보드_id`, `심법_id`),
  INDEX idx_build_id (`빌드보드_id`),
  INDEX idx_technique_id (`심법_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 빌드-비결 관계 테이블
CREATE TABLE IF NOT EXISTS `T_빌드보드_비결` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `빌드보드_id` INT NOT NULL,
  `비결_id` INT NOT NULL,
  `순서` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`비결_id`) REFERENCES `T_비결` (`id`),
  UNIQUE KEY `unique_build_secret` (`빌드보드_id`, `비결_id`),
  INDEX idx_build_id (`빌드보드_id`),
  INDEX idx_secret_id (`비결_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- View 생성: 빌드 상세 정보 조회용
-- ============================================


-- 빌드 전체 정보를 한 번에 조회하는 통합 View (JSON 형태로 집계)
CREATE OR REPLACE VIEW `V_빌드보드_전체` AS
SELECT 
  b.id,
  b.name,
  b.description,
  b.version,
  b.status,
  b.created_at,
  b.updated_at,
  -- 무술 정보를 JSON 배열로 집계
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'id', m.id,
      'title_code', m.title_code,
      'body_code', m.body_code,
      'img', m.img,
      '무기_code', m.무기_code,
      '순서', bm.순서
    )
  ) AS 무술들,
  -- 심법 정보를 JSON 배열로 집계
  COALESCE(
    (SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', s.id,
        'title_code', s.title_code,
        'body_code', s.body_code,
        'img', s.img,
        '무술_id', s.무술_id,
        '순서', bs.순서
      )
    )
    FROM `T_빌드보드_심법` bs
    INNER JOIN `T_심법` s ON bs.심법_id = s.id
    WHERE bs.빌드보드_id = b.id),
    JSON_ARRAY()
  ) AS 심법들,
  -- 비결 정보를 JSON 배열로 집계
  COALESCE(
    (SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', secret.id,
        'title_code', secret.title_code,
        'body_code', secret.body_code,
        'img', secret.img,
        '무술_id', secret.무술_id,
        '순서', bb.순서
      )
    )
    FROM `T_빌드보드_비결` bb
    INNER JOIN `T_비결` secret ON bb.비결_id = secret.id
    WHERE bb.빌드보드_id = b.id),
    JSON_ARRAY()
  ) AS 비결들
FROM `T_빌드보드` b
LEFT JOIN `T_빌드보드_무술` bm ON b.id = bm.빌드보드_id
LEFT JOIN `T_무술` m ON bm.무술_id = m.id
WHERE b.deleted_at IS NULL
GROUP BY b.id, b.name, b.description, b.version, b.status, b.created_at, b.updated_at;
