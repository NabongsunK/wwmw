-- ============================================
-- 개선된 스키마 사용 예시
-- ============================================

-- ============================================
-- 1. 다국어 코드 조회
-- ============================================

-- 특정 코드의 모든 언어 버전 조회
SELECT * FROM `T_CodeBase` WHERE code = 'MART001' ORDER BY lang;

-- 특정 언어의 코드명 조회
SELECT code, code_nm FROM `T_CodeBase` WHERE code = 'MART001' AND lang = 'ko';

-- 다국어 뷰 사용 (모든 언어를 한 번에)
SELECT * FROM `V_CodeBase_다국어` WHERE code = 'MART001';

-- ============================================
-- 2. 무술 항목 조회 (통합 테이블)
-- ============================================

-- 특정 무술의 모든 항목 조회 (스킬, 심법, 비결 모두)
SELECT 
  id,
  type,
  title_code,
  body_code,
  img,
  순서
FROM `T_무술_항목`
WHERE 무술_id = 1
ORDER BY type, 순서;

-- 특정 타입만 조회 (예: 스킬만)
SELECT * FROM `T_무술_항목`
WHERE 무술_id = 1 AND type = '스킬'
ORDER BY 순서;

-- 무술 항목과 다국어 정보 함께 조회
SELECT 
  item.id,
  item.type,
  item.순서,
  title_ko.code_nm AS title_ko,
  title_en.code_nm AS title_en,
  body_ko.code_nm AS body_ko,
  body_en.code_nm AS body_en,
  item.img
FROM `T_무술_항목` item
LEFT JOIN `T_CodeBase` title_ko ON item.title_code = title_ko.code AND title_ko.lang = 'ko'
LEFT JOIN `T_CodeBase` title_en ON item.title_code = title_en.code AND title_en.lang = 'en'
LEFT JOIN `T_CodeBase` body_ko ON item.body_code = body_ko.code AND body_ko.lang = 'ko'
LEFT JOIN `T_CodeBase` body_en ON item.body_code = body_en.code AND body_en.lang = 'en'
WHERE item.무술_id = 1
ORDER BY item.type, item.순서;

-- ============================================
-- 3. 빌드보드 조회 (개선된 구조)
-- ============================================

-- 빌드보드 전체 정보 조회 (JSON 형태)
SELECT * FROM `V_빌드보드_전체` WHERE id = 1;

-- 빌드보드의 무술 항목을 타입별로 분리하여 조회
SELECT 
  b.id AS 빌드보드_id,
  b.name,
  bmi.type,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'id', item.id,
      'title_code', item.title_code,
      'body_code', item.body_code,
      'img', item.img,
      '순서', bmi.순서
    )
  ) AS 항목들
FROM `T_빌드보드` b
INNER JOIN `T_빌드보드_무술항목` bmi ON b.id = bmi.빌드보드_id
INNER JOIN `T_무술_항목` item ON bmi.무술항목_id = item.id
WHERE b.id = 1 AND b.deleted_at IS NULL
GROUP BY b.id, b.name, bmi.type
ORDER BY bmi.type;

-- ============================================
-- 4. 무술 항목 추가 (통합 테이블 사용)
-- ============================================

-- 스킬 추가
INSERT INTO `T_무술_항목` (`type`, `무술_id`, `title_code`, `body_code`, `img`, `순서`)
VALUES ('스킬', 1, 'SKILL001', 'SKILL001_DESC', '/images/skill1.jpg', 1);

-- 심법 추가
INSERT INTO `T_무술_항목` (`type`, `무술_id`, `title_code`, `body_code`, `img`, `순서`)
VALUES ('심법', 1, 'TECH001', 'TECH001_DESC', '/images/tech1.jpg', 1);

-- 비결 추가
INSERT INTO `T_무술_항목` (`type`, `무술_id`, `title_code`, `body_code`, `img`, `순서`)
VALUES ('비결', 1, 'SECRET001', 'SECRET001_DESC', '/images/secret1.jpg', 1);

-- ============================================
-- 5. 빌드보드에 무술 항목 추가
-- ============================================

-- 빌드보드에 스킬 추가
INSERT INTO `T_빌드보드_무술항목` (`빌드보드_id`, `무술항목_id`, `type`, `순서`)
VALUES (1, 1, '스킬', 1);

-- 빌드보드에 심법 추가
INSERT INTO `T_빌드보드_무술항목` (`빌드보드_id`, `무술항목_id`, `type`, `순서`)
VALUES (1, 2, '심법', 1);

-- ============================================
-- 6. 통계 쿼리 (개선된 구조 활용)
-- ============================================

-- 무술별 항목 개수 통계
SELECT 
  m.id AS 무술_id,
  title_ko.code_nm AS 무술명,
  COUNT(CASE WHEN item.type = '스킬' THEN 1 END) AS 스킬_개수,
  COUNT(CASE WHEN item.type = '심법' THEN 1 END) AS 심법_개수,
  COUNT(CASE WHEN item.type = '비결' THEN 1 END) AS 비결_개수,
  COUNT(*) AS 전체_항목수
FROM `T_무술` m
LEFT JOIN `T_무술_항목` item ON m.id = item.무술_id
LEFT JOIN `T_CodeBase` title_ko ON m.title_code = title_ko.code AND title_ko.lang = 'ko'
GROUP BY m.id, title_ko.code_nm
ORDER BY 전체_항목수 DESC;

-- 빌드보드별 사용된 무술 항목 타입 통계
SELECT 
  b.id AS 빌드보드_id,
  b.name,
  COUNT(CASE WHEN bmi.type = '스킬' THEN 1 END) AS 스킬_개수,
  COUNT(CASE WHEN bmi.type = '심법' THEN 1 END) AS 심법_개수,
  COUNT(CASE WHEN bmi.type = '비결' THEN 1 END) AS 비결_개수,
  COUNT(*) AS 전체_항목수
FROM `T_빌드보드` b
LEFT JOIN `T_빌드보드_무술항목` bmi ON b.id = bmi.빌드보드_id
WHERE b.deleted_at IS NULL
GROUP BY b.id, b.name
ORDER BY 전체_항목수 DESC;
