# WWMW - 연운 도구

Next.js 기반 웹 앱. 심법 뽑기, 스무고개족보, 만사록(나사일) 등 게임 연동 도구를 제공합니다.

- **기술 스택**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, MySQL
- **다국어**: 쿠키 `lang` 기반 (ko/en 등), API·UI 공통 적용

---

## 프로젝트 구조

```
wwe/
├── app/                        # Next.js App Router
│   ├── api/                    # REST API
│   │   ├── db/test/            # DB 연결 테스트
│   │   ├── factions/           # 유파 목록 (다국어)
│   │   ├── innerways/simulator/# 심법 시뮬레이터용
│   │   ├── twenty-questions/   # 스무고개
│   │   ├── uid/                # 방문자 UID 발급·조회
│   │   └── wanderingtales/     # 만사록 목록·상세
│   ├── api-doc/                # Swagger API 문서 페이지
│   ├── builds/                 # 빌드 목록·상세 페이지 (주석 처리됨)
│   ├── simulator/mystic/       # 심법 뽑기 페이지
│   ├── twentyquestions/        # 스무고개 페이지
│   ├── components/             # 공통 컴포넌트 (Header, Footer, Layout, BuildForm 등)
│   ├── providers/              # LanguageProvider, Providers
│   ├── layout.tsx
│   ├── page.tsx                # 메인 (현재 심법 뽑기)
│   └── globals.css
│
├── repo/                       # Repository (DB 접근)
│   ├── T_CodeBase.repository.ts
│   ├── faction.repository.ts
│   ├── innerway.repository.ts
│   ├── twenty-questions.repository.ts
│   ├── uid.repository.ts
│   └── wanderingtales.repository.ts
│
├── service/                    # Service (비즈니스 로직)
│   ├── faction.service.ts
│   ├── innerway.service.ts
│   ├── uid.service.ts
│   └── wanderingtales.service.ts
│
├── types/                      # TypeScript 타입
│   ├── nav.ts
│   ├── wanderingtales.ts
│   ├── innerway.ts
│   ├── twenty-questions.ts
│   └── uid.ts
│
├── lib/                        # 유틸·설정
│   ├── db.ts                   # MySQL 연결 풀 (mysql2)
│   ├── api-response.ts         # 공통 API 응답 (responseOk, responseServerError 등)
│   ├── api-lang.ts             # 요청에서 lang 추출 (쿠키)
│   ├── auth.ts
│   ├── swagger.ts
│   └── lang-validator.ts / lang-cookie-client.ts / uid-cookie-client.ts
│
├── hooks/                      # React 훅
│   ├── useApi.ts
│   ├── useUid.ts
│   ├── useInput.ts
│   └── useHighlight.tsx
│
├── sql/                        # DB 스키마·시드
│   ├── schema_simple.sql       # 단순화 스키마 (T_CodeBase, 빌드보드 등)
│   ├── naesilTable.sql         # 만사록 보드 테이블
│   ├── naesilData.sql          # 만사록 코드·보드 시드
│   ├── function/UDF_BaseCode.sql
│   └── 기타 (무술계층, 이미지 등)
│
├── doc/                        # 문서
│   ├── DEPLOYMENT.md           # 맥미니/PM2/Nginx 배포
│   ├── LANGUAGE_USAGE.md      # 다국어 사용법
│   ├── EXTERNAL_ACCESS.md
│   └── fix-db-permissions.md
│
├── deploy/                     # 배포용
│   ├── Dockerfile              # MySQL 이미지
│   ├── deploy.sh
│   └── auto_sync.sh
│
├── script/                     # 스크립트 (로컬·폴링 배포 등)
│   └── auto_sync.sh            # WWE Next.js + PM2 폴링 자동 동기화
│
├── public/                     # 정적 파일
├── middleware.ts               # lang 쿠키 → x-lang 헤더 등
├── ecosystem.config.js         # PM2 설정
└── next.config.ts / tailwind.config.ts / tsconfig.json
```

### 레이어 요약

| 레이어     | 경로       | 역할                                    |
| ---------- | ---------- | --------------------------------------- |
| API Routes | `app/api/` | HTTP 요청/응답, 쿼리 파라미터·쿠키 처리 |
| Service    | `service/` | 비즈니스 로직, 검증, Repository 호출    |
| Repository | `repo/`    | MySQL 쿼리 (`lib/db` 사용)              |
| Types      | `types/`   | DTO·도메인 타입 정의                    |

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env.local` 생성:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=wwe_user
MYSQL_PASSWORD=wwe_password
MYSQL_DATABASE=wwe_db
```

**관리자 UID (선택)**  
특정 UID를 관리자로 두려면 (빌드 등 전체 수정/삭제 권한):

```env
ADMIN_UIDS=발급받은-uuid-1,발급받은-uuid-2
```

- uid는 브라우저 접속 후 `POST /api/uid`로 발급
- 비워두면 작성자만 자신 글 수정/삭제 가능

### 3. DB 준비

- MySQL 8 사용. `sql/schema_simple.sql`, `sql/naesilTable.sql`, `sql/naesilData.sql` 등으로 스키마·시드 적용
- Docker 사용 시: `deploy/Dockerfile`로 MySQL 이미지 빌드 후 실행 (자세한 내용은 `doc/DEPLOYMENT.md` 참고)

### 4. 개발 서버 실행

```bash
cd 'F:\Users\user\project\wwmw\'
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

### 5. DB 연결 확인

[http://localhost:3000/api/db/test](http://localhost:3000/api/db/test) 에서 연결 상태 확인.

---

## 주요 API

| 메서드   | 경로                       | 설명                                             |
| -------- | -------------------------- | ------------------------------------------------ |
| GET      | `/api/db/test`             | DB 연결 테스트                                   |
| GET      | `/api/factions`            | 유파 목록 (다국어, 쿠키 lang)                    |
| GET      | `/api/wanderingtales`      | 만사록 목록 (쿼리: region, subRegion, 쿠키 lang) |
| GET      | `/api/wanderingtales/:id`  | 만사록 상세                                      |
| GET/POST | `/api/uid`                 | UID 조회/발급                                    |
| GET      | `/api/twenty-questions`    | 스무고개                                         |
| GET      | `/api/innerways/simulator` | 심법 시뮬레이터용                                |

- 다국어 API는 쿠키 `lang` 또는 `x-lang` 사용. 자세한 사용법은 `doc/LANGUAGE_USAGE.md` 참고.
- API 문서: 개발 서버 실행 후 [http://localhost:3000/api-doc](http://localhost:3000/api-doc) (Swagger).

---

## 스크립트

| 스크립트                            | 설명                         |
| ----------------------------------- | ---------------------------- |
| `npm run dev`                       | 개발 서버 (Next.js)          |
| `npm run build`                     | 프로덕션 빌드                |
| `npm run start`                     | 프로덕션 서버 실행 (빌드 후) |
| `npm run lint` / `npm run lint:fix` | ESLint                       |
| `npm run type-check`                | TypeScript 검사              |
| `npm run format`                    | Prettier 포맷                |

---

## 배포

- **맥미니·PM2·Nginx**: `doc/DEPLOYMENT.md`
- **폴링 자동 동기화** (Git pull → npm ci → build → PM2 restart): `script/auto_sync.sh` (프로젝트 루트에서 실행)

---

## 참고 문서

- [Next.js Documentation](https://nextjs.org/docs)
- `doc/DEPLOYMENT.md` - 배포 가이드
- `doc/LANGUAGE_USAGE.md` - 다국어(쿠키·API) 사용법
