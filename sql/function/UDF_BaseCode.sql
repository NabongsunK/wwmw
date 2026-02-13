-- MySQL root로 접속 필요
-- mysql -u root -p

-- 1단계: 함수 생성 권한 설정
SET GLOBAL log_bin_trust_function_creators = 1;

-- 3단계: collation을 명시한 함수 생성
DELIMITER $$

CREATE FUNCTION UDF_BaseCode(
    p_code VARCHAR(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    p_lang VARCHAR(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) RETURNS VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
DETERMINISTIC
READS SQL DATA
BEGIN
  RETURN (
    SELECT code_nm 
    FROM T_CodeBase 
    WHERE code = p_code 
    AND lang = p_lang 
    LIMIT 1
  );
END$$

DELIMITER ;

SELECT * FROM T_심법;
select * from T_이미지;

SELECT 
        UDF_BaseCode(s.유파_code, 'ko') AS 유파,
        UDF_BaseCode(s.title, 'ko') AS 심법명,
        s.순서,
        s.등급,
        심법_이미지.img_path AS 심법_이미지_url,
        유파_이미지.img_path AS 유파_이미지_url
      FROM T_심법 s
      LEFT JOIN T_이미지 심법_이미지 ON s.img = 심법_이미지.id
      LEFT JOIN T_이미지 유파_이미지 ON s.유파_code = 유파_이미지.code
      ORDER BY s.유파_code, s.순서 ASC, s.created_at DESC;