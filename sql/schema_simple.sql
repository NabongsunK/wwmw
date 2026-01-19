-- ============================================
-- 단순화된 스키마 (최소 테이블 구성)
-- ============================================
-- 핵심 아이디어: 비슷한 구조의 테이블들을 통합
-- ============================================

-- ============================================
-- 1. 다국어 코드 베이스 (필수)
-- ============================================
CREATE TABLE IF NOT EXISTS `T_CodeBase` (
  `code` VARCHAR(7) NOT NULL,
  `lang` VARCHAR(4) NOT NULL COMMENT '언어 코드 (ko, en, ja, zh)',
  `code_nm` VARCHAR(255) NOT NULL COMMENT '코드명 (다국어)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`, `lang`),
  INDEX idx_code (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. 유파/무술/스킬 통합 테이블
-- ============================================
-- 한 행에 유파, 무술, 스킬 정보를 모두 포함
-- 유파만: 유파_id만 있고 무술_id, 스킬_id는 NULL
-- 무술만: 유파_id, 무술_id만 있고 스킬_id는 NULL
-- 스킬: 유파_id, 무술_id, 스킬_id 모두 있음
-- ============================================
DROP TABLE IF EXISTS `T_무술계층`;
CREATE TABLE IF NOT EXISTS `T_무술계층` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `유파_code` VARCHAR(7) NULL COMMENT '유파 코드 (T_CodeBase.code 참조)',
  `장비_code` VARCHAR(7) NULL COMMENT '장비 코드 (T_CodeBase.code 참조)',
  `무술_code` VARCHAR(7) NULL COMMENT '무술 코드 (T_CodeBase.code 참조)',
  `스킬_code` VARCHAR(7) NULL COMMENT '스킬 코드 (T_CodeBase.code 참조)',
  `순서` INT DEFAULT 0 COMMENT '정렬 순서 (스킬만 사용)',
  `키보드_키` VARCHAR(255) NULL COMMENT '키보드 키',
  `패드_키` VARCHAR(255) NULL COMMENT '패드 키',
  `유파_img` INT NULL COMMENT '유파 이미지 ID (T_이미지 참조)',
  `장비_img` INT NULL COMMENT '장비 이미지 ID (T_이미지 참조)',
  `무술_img` INT NULL COMMENT '무술 이미지 ID (T_이미지 참조)',
  `스킬_img` INT NULL COMMENT '스킬 이미지 ID (T_이미지 참조)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- 외래키 제약 제거: T_CodeBase의 PK가 (code, lang) 복합키라서 code만 참조 불가
  -- 대신 INDEX로 조회 성능 보장
  INDEX idx_유파_code (`유파_code`),
  INDEX idx_장비_code (`장비_code`),
  INDEX idx_무술_code (`무술_code`),
  INDEX idx_스킬_code (`스킬_code`),
  INDEX idx_순서 (`순서`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2-1. 이미지 테이블 (code 기반)
-- ============================================
CREATE TABLE IF NOT EXISTS `T_이미지` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(7) NOT NULL COMMENT '코드 (T_CodeBase.code 참조)',
  `img_path` VARCHAR(255) NOT NULL COMMENT '이미지 경로',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- 외래키 제약 제거: T_CodeBase의 PK가 (code, lang) 복합키라서 code만 참조 불가
  UNIQUE KEY `unique_code_image` (`code`),
  INDEX idx_code (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 2-2. 비결 테이블 (무술과 독립적, 유파와 무관)
-- ============================================
CREATE TABLE IF NOT EXISTS `T_비결` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(7) NOT NULL COMMENT '제목',
  `body` VARCHAR(7) NOT NULL COMMENT '설명',
  `순서` INT DEFAULT 0 COMMENT '정렬 순서',
  `img` INT NOT NULL COMMENT '비결 이미지 ID (T_이미지 참조)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`img`) REFERENCES `T_이미지` (`id`),
  INDEX idx_순서 (`순서`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2-3. 심법 테이블 (무술과 독립적, 유파에만 속함)
-- ============================================
CREATE TABLE IF NOT EXISTS `T_심법` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `유파_code` VARCHAR(7) NOT NULL COMMENT '유파 코드 (T_CodeBase.code 참조)',
  `title` VARCHAR(7) NOT NULL COMMENT '제목',
  `body` VARCHAR(7) NOT NULL COMMENT '설명',
  `순서` INT DEFAULT 0 COMMENT '정렬 순서',
  `등급` INT NOT NULL COMMENT '등급',
  `img` INT NOT NULL COMMENT '이미지 ID (T_이미지 참조)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- 외래키 제약 제거: T_CodeBase의 PK가 (code, lang) 복합키라서 code만 참조 불가
  FOREIGN KEY (`img`) REFERENCES `T_이미지` (`id`) ON DELETE CASCADE,
  INDEX idx_유파_code (`유파_code`),
  INDEX idx_순서 (`순서`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 3. 게임 버전 테이블 (관리자 설정)
-- ============================================
DROP TABLE IF EXISTS `T_게임버전`;
CREATE TABLE `T_게임버전` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `version` VARCHAR(50) NOT NULL COMMENT '버전명 (예: 1.0.0, 2024-S1)',
  `description` TEXT COMMENT '버전 설명 (패치 노트 등)',
  `is_active` BOOLEAN DEFAULT FALSE COMMENT '현재 활성 버전 여부 (한 번에 하나만 TRUE)',
  `start_date` DATE DEFAULT (CURRENT_DATE) COMMENT '버전 시작일 (자동 설정)',
  `end_date` DATE NULL COMMENT '버전 종료일 (NULL이면 현재 진행 중)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_version` (`version`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_start_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게임 버전 관리 (관리자 전용)';

-- 초기 버전 데이터 삽입 예시
-- INSERT INTO `T_게임버전` (`version`, `description`, `is_active`) 
-- VALUES ('1.0.0', '정식 출시 버전', TRUE);

-- ============================================
-- 4. 빌드보드 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS `T_빌드보드` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` ENUM('PVE', 'PVP', 'RVR', '시련') NOT NULL COMMENT '빌드 용도 구분',
  `version_id` INT NULL COMMENT '게임 버전 ID (T_게임버전 참조, 등록 시 자동 설정)',
  `status` ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`version_id`) REFERENCES `T_게임버전` (`id`) ON DELETE SET NULL,
  INDEX idx_category (`category`),
  INDEX idx_status (`status`),
  INDEX idx_version_id (`version_id`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. 빌드보드-무술 관계 테이블
-- ============================================
-- 빌드보드 1개당: 무술 2개 선택 가능
-- ============================================
CREATE TABLE IF NOT EXISTS `T_빌드보드_무술` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `빌드보드_id` INT NOT NULL,
  `무술계층_id` INT NOT NULL COMMENT '무술계층 ID (T_무술계층 참조, type이 무술)',
  `순서` INT DEFAULT 0 COMMENT '정렬 순서',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`무술계층_id`) REFERENCES `T_무술계층` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_build_martial` (`빌드보드_id`, `무술계층_id`),
  INDEX idx_build_id (`빌드보드_id`),
  INDEX idx_martial_id (`무술계층_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. 빌드보드-비결 관계 테이블
-- ============================================
-- 빌드보드 1개당: 비결 8개 선택 가능
-- ============================================
CREATE TABLE IF NOT EXISTS `T_빌드보드_비결` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `빌드보드_id` INT NOT NULL,
  `비결_id` INT NOT NULL COMMENT '비결 ID (T_비결 참조)',
  `순서` INT DEFAULT 0 COMMENT '정렬 순서',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`비결_id`) REFERENCES `T_비결` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_build_secret` (`빌드보드_id`, `비결_id`),
  INDEX idx_build_id (`빌드보드_id`),
  INDEX idx_secret_id (`비결_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. 빌드보드-심법 관계 테이블
-- ============================================
-- 빌드보드 1개당: 심법 4개 선택 가능
-- ============================================
CREATE TABLE IF NOT EXISTS `T_빌드보드_심법` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `빌드보드_id` INT NOT NULL,
  `심법_id` INT NOT NULL COMMENT '심법 ID (T_심법 참조)',
  `순서` INT DEFAULT 0 COMMENT '정렬 순서',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`심법_id`) REFERENCES `T_심법` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_build_method` (`빌드보드_id`, `심법_id`),
  INDEX idx_build_id (`빌드보드_id`),
  INDEX idx_method_id (`심법_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. 리더보드 테이블
-- ============================================
-- 사용자별 점수 기록 (빌드보드 기반)
-- 비결은 유파와 무관, 심법은 유파에만 속함
-- ============================================
CREATE TABLE IF NOT EXISTS `T_리더보드` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(255) NOT NULL COMMENT '사용자 ID',
  `빌드보드_id` INT NOT NULL COMMENT '사용한 빌드보드 ID',
  `점수` INT NOT NULL COMMENT '점수',
  `유파_code` VARCHAR(7) NULL COMMENT '유파 코드 (무술/심법 사용 시, 비결은 NULL, T_CodeBase.code 참조)',
  `기록일` DATE NOT NULL COMMENT '기록 날짜 (기간별 집계용)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  -- 외래키 제약 제거: T_CodeBase의 PK가 (code, lang) 복합키라서 code만 참조 불가
  INDEX idx_user_id (`user_id`),
  INDEX idx_빌드보드_id (`빌드보드_id`),
  INDEX idx_점수 (`점수`),
  INDEX idx_유파_code (`유파_code`),
  INDEX idx_기록일 (`기록일`),
  INDEX idx_점수_기록일 (`점수` DESC, `기록일` DESC),
  INDEX idx_유파_점수 (`유파_code`, `점수` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. 빌드보드 상호작용 통합 테이블 (조회수, 좋아요 통합)
-- ============================================
CREATE TABLE IF NOT EXISTS `T_빌드보드_상호작용` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `빌드보드_id` INT NOT NULL,
  `type` ENUM('조회', '좋아요') NOT NULL COMMENT '상호작용 타입',
  `user_id` VARCHAR(255) NULL COMMENT '사용자 ID (좋아요만 사용)',
  `ip_address` VARCHAR(45) NULL COMMENT 'IP 주소 (조회만 사용)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`빌드보드_id`) REFERENCES `T_빌드보드` (`id`) ON DELETE CASCADE,
  INDEX idx_build_type (`빌드보드_id`, `type`),
  INDEX idx_created_at (`created_at`),
  -- 좋아요는 중복 방지
  UNIQUE KEY `unique_like` (`빌드보드_id`, `user_id`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- View: 빌드보드 전체 정보 (단순화된 버전)
-- ============================================
CREATE OR REPLACE VIEW `V_빌드보드_전체` AS
SELECT 
  b.id,
  b.name,
  b.description,
  b.category,
  b.version_id,
  v.version AS version_name,
  b.status,
  b.created_at,
  b.updated_at,
  -- 무술 정보를 JSON 배열로 집계 (유파 정보 포함)
  COALESCE(
    (SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', m.id,
        '유파_code', m.유파_code,
        '장비_code', m.장비_code,
        '무술_code', m.무술_code,
        '무술_img', COALESCE(img_m.img_path, ''),
        '유파_img', COALESCE(img_u.img_path, ''),
        '장비_img', COALESCE(img_w.img_path, ''),
        '순서', bm.순서,
        '키보드_키', m.키보드_키,
        '패드_키', m.패드_키
      )
    )
    FROM `T_빌드보드_무술` bm
    INNER JOIN `T_무술계층` m ON bm.무술계층_id = m.id
    LEFT JOIN `T_이미지` img_m ON m.무술_img = img_m.id
    LEFT JOIN `T_이미지` img_u ON m.유파_img = img_u.id
    LEFT JOIN `T_이미지` img_w ON m.장비_img = img_w.id
    WHERE bm.빌드보드_id = b.id),
    JSON_ARRAY()
  ) AS 무술들,
  -- 비결 정보를 JSON 배열로 집계 (유파와 무관)
  COALESCE(
    (SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', bj.id,
        'title', bj.title,
        'body', bj.body,
        '비결_img', COALESCE(img_bj.img_path, ''),
        '순서', bb.순서
      )
    )
    FROM `T_빌드보드_비결` bb
    INNER JOIN `T_비결` bj ON bb.비결_id = bj.id
    LEFT JOIN `T_이미지` img_bj ON bj.img = img_bj.id
    WHERE bb.빌드보드_id = b.id),
    JSON_ARRAY()
  ) AS 비결들,
  -- 심법 정보를 JSON 배열로 집계 (유파에 속함)
  COALESCE(
    (SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', sm.id,
        '유파_code', sm.유파_code,
        'title', sm.title,
        'body', sm.body,
        '등급', sm.등급,
        '심법_img', COALESCE(img_sm.img_path, ''),
        '순서', bs.순서
      )
    )
    FROM `T_빌드보드_심법` bs
    INNER JOIN `T_심법` sm ON bs.심법_id = sm.id
    LEFT JOIN `T_이미지` img_sm ON sm.img = img_sm.id
    WHERE bs.빌드보드_id = b.id),
    JSON_ARRAY()
  ) AS 심법들
FROM `T_빌드보드` b
LEFT JOIN `T_게임버전` v ON b.version_id = v.id
WHERE b.deleted_at IS NULL;

-- ============================================
-- View: 다국어 지원을 위한 코드 조회 헬퍼
-- ============================================
CREATE OR REPLACE VIEW `V_CodeBase_다국어` AS
SELECT 
  code,
  MAX(CASE WHEN lang = 'ko' THEN code_nm END) AS name_ko,
  MAX(CASE WHEN lang = 'en' THEN code_nm END) AS name_en,
  MAX(CASE WHEN lang = 'ja' THEN code_nm END) AS name_ja,
  MAX(CASE WHEN lang = 'zh' THEN code_nm END) AS name_zh
FROM `T_CodeBase`
GROUP BY code;

-- ============================================
-- View: 리더보드 전체 랭킹
-- ============================================
CREATE OR REPLACE VIEW `V_리더보드_전체` AS
SELECT 
  l.id,
  l.user_id,
  l.빌드보드_id,
  b.name AS 빌드보드명,
  l.점수,
  l.유파_code,
  l.기록일,
  l.created_at,
  -- 랭킹 계산 (동점 처리: 같은 점수면 같은 순위)
  (SELECT COUNT(*) + 1
   FROM `T_리더보드` l2
   WHERE l2.점수 > l.점수) AS 랭킹
FROM `T_리더보드` l
INNER JOIN `T_빌드보드` b ON l.빌드보드_id = b.id
WHERE b.deleted_at IS NULL
ORDER BY l.점수 DESC, l.created_at ASC;

-- ============================================
-- View: 리더보드 유파별 랭킹 (심법/무술 사용 시)
-- ============================================
CREATE OR REPLACE VIEW `V_리더보드_유파별` AS
SELECT 
  l.id,
  l.user_id,
  l.빌드보드_id,
  b.name AS 빌드보드명,
  l.점수,
  l.유파_code,
  l.기록일,
  l.created_at,
  -- 유파별 랭킹
  (SELECT COUNT(*) + 1
   FROM `T_리더보드` l2
   WHERE l2.유파_code = l.유파_code AND l2.점수 > l.점수) AS 유파_랭킹
FROM `T_리더보드` l
INNER JOIN `T_빌드보드` b ON l.빌드보드_id = b.id
WHERE l.유파_code IS NOT NULL
  AND b.deleted_at IS NULL
ORDER BY l.유파_code, l.점수 DESC, l.created_at ASC;

-- ============================================
-- View: 리더보드 일별 랭킹
-- ============================================
CREATE OR REPLACE VIEW `V_리더보드_일별` AS
SELECT 
  l.기록일,
  l.user_id,
  l.빌드보드_id,
  b.name AS 빌드보드명,
  l.점수,
  l.유파_code,
  l.created_at,
  -- 일별 랭킹
  (SELECT COUNT(*) + 1
   FROM `T_리더보드` l2
   WHERE l2.기록일 = l.기록일 AND l2.점수 > l.점수) AS 일별_랭킹
FROM `T_리더보드` l
INNER JOIN `T_빌드보드` b ON l.빌드보드_id = b.id
WHERE b.deleted_at IS NULL
ORDER BY l.기록일 DESC, l.점수 DESC, l.created_at ASC;
