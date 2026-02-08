# UID API (외부/게임 유저 식별자)

**uid**는 리더보드·좋아요에 쓰는 **문자열 사용자 식별자**(`user_id`)입니다.  
(클라이언트/게임에서 부여한 ID, OAuth 제공자의 sub 등)

현재는 **uid만 등록·조회**하고, **닉네임 등 프로필은 나중에 user(회원) 기능을 만들 때 그쪽과 연동**하는 방향으로 둡니다.

---

## 1. 역할

- uid **존재 여부 검증** (리더보드/좋아요에 쓰기 전에 유효한 uid인지 확인)
- uid **최초 등록** (아직 없으면 생성, 있으면 기존 정보 반환)
- 프로필(닉네임 등)은 **user 쪽에서 관리 후 uid와 연동** 예정

---

## 2. API 엔드포인트

| 메서드    | 경로             | 설명                                                     |
| --------- | ---------------- | -------------------------------------------------------- |
| **GET**   | `/api/uid/[uid]` | uid 조회(검증). 없으면 404.                              |
| **POST**  | `/api/uid`       | uid 등록(최초 생성). body: `{ uid }`. 있으면 200 + 기존. |
| **PATCH** | `/api/uid/[uid]` | (현재는 uid만 저장. 나중에 user 연동 시 용도 확장 가능)  |

- `[uid]`는 **경로 파라미터**. 길이·패턴 검사 권장.
- 리더보드 조회는 `/api/leaderboard/users/[user_id]` 사용 (`user_id` = uid).

---

## 3. 테이블 (uid만 저장)

닉네임·프로필은 넣지 않고 **uid와 타임스탬프만** 둡니다.  
닉네임 등은 추후 **user(회원) 테이블/API**에서 관리하고 uid와 연동할 예정입니다.

```sql
-- uid 전용 테이블 (식별자만, 프로필은 user 연동 시 처리)
CREATE TABLE IF NOT EXISTS `T_유저_uid` (
  `uid` VARCHAR(255) NOT NULL PRIMARY KEY,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (`created_at`)
);
```

---

## 4. 나중에 user 연동 시

- **user(회원)** 기능 추가 시: 닉네임, 로그인 정보 등은 user 쪽 테이블/API에서 관리.
- **uid ↔ user** 연결: 예) `users` 테이블에 `uid` 컬럼 추가, 또는 `T_유저_uid`에 `user_id` FK 추가.
- 그때 GET/PATCH `/api/uid/[uid]`에서 user와 조인해 닉네임 등을 내려주도록 확장하면 됨.

지금은 uid만 유지하고, 프로필(닉네임 등)은 user 도입 후 그쪽에 연동하는 흐름으로 두었습니다.
