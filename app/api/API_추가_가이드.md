# WWE 프로젝트 — 신규 API 추가 가이드

`app/api/` 에 새 API를 추가할 때 따라야 할 구조와 단계입니다.

---

## 1. 전체 구조 (3계층)

| 계층           | 위치                          | 역할                         |
| -------------- | ----------------------------- | ---------------------------- |
| **Route**      | `app/api/{리소스}/route.ts`   | HTTP 요청/응답, Service 호출 |
| **Service**    | `service/{리소스}.service.ts` | 비즈니스 로직, 검증          |
| **Repository** | `repo/{리소스}.repository.ts` | DB 쿼리 (CRUD)               |

타입은 `types/{리소스}.ts` 에 정의합니다.

---

## 2. 추가 순서 (예: `items` 리소스)

### Step 1. 타입 정의 — `types/item.ts`

```ts
// 엔티티
export interface Item {
  id: number
  name: string
  created_at: Date
  updated_at?: Date | null
}

// 생성용 DTO
export interface CreateItemDto {
  name: string
}

// 수정용 DTO (선택 필드)
export interface UpdateItemDto {
  name?: string
}
```

---

### Step 2. Repository — `repo/item.repository.ts`

- `@/lib/db` 의 `query()` 사용.
- 테이블명은 프로퍼티로 두고, 파라미터는 `?` 로 바인딩.

```ts
// 아이템 레포지토리

import { query } from '@/lib/db'
import type { Item, CreateItemDto, UpdateItemDto } from '@/types/item'

export class ItemRepository {
  private tableName = 'items'

  async findAll(): Promise<Item[]> {
    return await query<Item>(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ORDER BY id DESC`,
    )
  }

  async findById(id: number): Promise<Item | null> {
    const rows = await query<Item>(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id],
    )
    return rows[0] || null
  }

  async create(data: CreateItemDto): Promise<Item> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO ${this.tableName} (name, created_at) VALUES (?, NOW())`,
      [data.name],
    )
    const created = await this.findById(result[0].insertId)
    if (!created) throw new Error('Failed to create item')
    return created
  }

  async update(id: number, data: UpdateItemDto): Promise<Item> {
    await query(
      `UPDATE ${this.tableName} SET name = COALESCE(?, name), updated_at = NOW() WHERE id = ?`,
      [data.name, id],
    )
    const updated = await this.findById(id)
    if (!updated) throw new Error('Item not found')
    return updated
  }

  async delete(id: number): Promise<void> {
    await query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id])
  }
}
```

---

### Step 3. Service — `service/item.service.ts`

- Repository만 의존.
- 입력 검증, 존재 여부, 중복 등 비즈니스 규칙 처리.
- 에러는 `throw new Error('메시지')` 로 던지면 Route에서 status 결정.

```ts
// 아이템 서비스

import { ItemRepository } from '@/repo/item.repository'
import type { Item, CreateItemDto, UpdateItemDto } from '@/types/item'

export class ItemService {
  private itemRepository: ItemRepository

  constructor() {
    this.itemRepository = new ItemRepository()
  }

  async getAll(): Promise<Item[]> {
    return await this.itemRepository.findAll()
  }

  async getById(id: number): Promise<Item> {
    if (id <= 0) throw new Error('Invalid ID')
    const item = await this.itemRepository.findById(id)
    if (!item) throw new Error('Item not found')
    return item
  }

  async create(data: CreateItemDto): Promise<Item> {
    if (!data.name?.trim()) throw new Error('Name is required')
    return await this.itemRepository.create(data)
  }

  async update(id: number, data: UpdateItemDto): Promise<Item> {
    if (id <= 0) throw new Error('Invalid ID')
    const existing = await this.itemRepository.findById(id)
    if (!existing) throw new Error('Item not found')
    return await this.itemRepository.update(id, data)
  }

  async delete(id: number): Promise<void> {
    if (id <= 0) throw new Error('Invalid ID')
    const existing = await this.itemRepository.findById(id)
    if (!existing) throw new Error('Item not found')
    await this.itemRepository.delete(id)
  }
}
```

---

### Step 4. Route — 리스트/생성 `app/api/items/route.ts`

- **공통 규칙**

  - 파일 상단 주석: `// 리소스명 API 라우트`
  - Service는 모듈 상단에서 한 번만 인스턴스화: `const itemService = new ItemService()`
  - 성공: `{ success: true, data: ... }`
  - 실패: `{ success: false, message: string }`
  - 에러 메시지는 `error instanceof Error ? error.message : '기본 메시지'` 사용

- **GET** — 목록: `200`, **POST** — 생성: `201`, 잘못된 요청: `400`, 서버 에러: `500`

```ts
// 아이템 API 라우트

import { NextRequest, NextResponse } from 'next/server'
import { ItemService } from '@/service/item.service'

const itemService = new ItemService()

/**
 * GET /api/items - 목록 조회
 */
export async function GET() {
  try {
    const items = await itemService.getAll()
    return NextResponse.json({ success: true, data: items }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch items',
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/items - 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await itemService.create(body)
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create item',
      },
      { status: 400 },
    )
  }
}
```

---

### Step 5. Route — 단건/수정/삭제 `app/api/items/[id]/route.ts`

- 동적 세그먼트는 `params.id` 로 받습니다. (Next.js 15: `params` 는 Promise일 수 있으므로 필요 시 `await params` 사용)
- `id` 는 숫자면 `parseInt(params.id)` 후 유효성 검사.
- `not found` 메시지 포함 시 `404`, 그 외 서버 에러는 `500`.

```ts
// 아이템 상세 API 라우트

import { NextRequest, NextResponse } from 'next/server'
import { ItemService } from '@/service/item.service'

const itemService = new ItemService()

/**
 * GET /api/items/[id] - 단건 조회
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const item = await itemService.getById(id)
    return NextResponse.json({ success: true, data: item }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch item'
    const status = message.includes('not found') ? 404 : 500
    return NextResponse.json({ success: false, message }, { status })
  }
}

/**
 * PUT /api/items/[id] - 수정
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const item = await itemService.update(id, body)
    return NextResponse.json({ success: true, data: item }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update item'
    const status = message.includes('not found') ? 404 : 400
    return NextResponse.json({ success: false, message }, { status })
  }
}

/**
 * DELETE /api/items/[id] - 삭제
 */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    await itemService.delete(id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete item'
    const status = message.includes('not found') ? 404 : 500
    return NextResponse.json({ success: false, message }, { status })
  }
}
```

---

## 3. URL 구조 참고

| 용도                     | 경로                    | 파일                                       |
| ------------------------ | ----------------------- | ------------------------------------------ |
| 목록 + 생성              | `/api/items`            | `app/api/items/route.ts`                   |
| 단건 조회/수정/삭제      | `/api/items/[id]`       | `app/api/items/[id]/route.ts`              |
| 서브 리소스 (예: 좋아요) | `/api/items/[id]/like`  | `app/api/items/[id]/like/route.ts`         |
| 쿼리 파라미터 (예: 언어) | `/api/martials?lang=ko` | `request.nextUrl.searchParams.get('lang')` |

---

## 4. 체크리스트

- [ ] `types/{리소스}.ts` — Entity, CreateDto, UpdateDto
- [ ] `repo/{리소스}.repository.ts` — DB 접근, `query()` 사용
- [ ] `service/{리소스}.service.ts` — 검증·비즈니스 로직
- [ ] `app/api/{리소스}/route.ts` — GET(목록), POST(생성)
- [ ] (필요 시) `app/api/{리소스}/[id]/route.ts` — GET/PUT/DELETE
- [ ] 응답 형식: `{ success, data? }` / `{ success: false, message }`
- [ ] 에러 시 적절한 status (400, 404, 500)
- [ ] (권장) `@swagger` JSDoc 추가 — API 문서 페이지에 자동 반영 (아래 7절 참고)

---

## 5. 기존 API 참고

- **단순 CRUD**: `users`, `builds`
- **쿼리 파라미터·다국어**: `martials`, `mystics`
- **동적 경로·서브 리소스**: `builds/[id]`, `builds/[id]/like`, `leaderboard/[id]/users/[user_id]`

필요한 패턴에 맞춰 위 파일들을 참고하면 됩니다.

---

## 6. UID API 설계 (외부/게임 유저 식별자)

프로젝트에서 **uid**는 리더보드·좋아요에 쓰는 **문자열 사용자 식별자**(`user_id` VARCHAR)와 같은 개념으로 두면 됩니다.  
(클라이언트/게임에서 부여한 ID, OAuth 제공자의 sub 등)

### 6.1 데이터 구조 선택

| 방식                                         | 설명                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **A. 기존 `users` 테이블에 `uid` 컬럼 추가** | 내부 유저(id)와 외부 uid를 1:1 매핑. 로그인 연동·관리자 유저가 있을 때 적합.               |
| **B. uid 전용 테이블 신설**                  | `T_유저_uid` (uid PK, nickname, created_at 등). 리더보드/좋아요만 쓰는 게스트 유저에 적합. |

- **리더보드/좋아요만** 쓸 거면 → **B** (가벼운 프로필 테이블)
- **관리자 유저(users)와 로그인 연동**까지 할 거면 → **A** (users에 uid 추가)

### 6.2 추천 API 엔드포인트

| 메서드    | 경로                   | 설명                                                                          |
| --------- | ---------------------- | ----------------------------------------------------------------------------- |
| **GET**   | `/api/uid/[uid]`       | uid로 프로필(닉네임 등) 조회. 없으면 404.                                     |
| **POST**  | `/api/uid`             | uid 등록(최초 생성). body: `{ uid, nickname? }`. 이미 있으면 200 + 기존 정보. |
| **PATCH** | `/api/uid/[uid]`       | 닉네임 등 프로필 수정.                                                        |
| **GET**   | `/api/uid/[uid]/stats` | (선택) 해당 uid의 리더보드 요약·좋아요 수 등.                                 |

- `[uid]`는 **경로 파라미터**로 받고, 영문/숫자 등만 허용하도록 길이·패턴 검사 권장.
- 기존 **리더보드 조회**는 그대로 `/api/leaderboard/users/[user_id]` 사용 (여기서 `user_id` = uid).

### 6.3 구현 시 참고

- **경로 파라미터로 문자열 id 받기**: `app/api/leaderboard/users/[user_id]/route.ts` (params.user_id)
- **Service/Repository 패턴**: `UserService` + `UserRepository` 와 동일하게 `UidService` + `UidRepository` (또는 기존 User에 uid 연동 시 UserRepository에 `findByUid(uid)` 추가)
- **응답 형식**: 다른 API와 동일하게 `{ success: true, data: { uid, nickname, ... } }` / `{ success: false, message }`

### 6.4 B 방식 예시 (uid 전용 테이블)

```sql
-- uid 전용 테이블 (게스트/외부 유저)
CREATE TABLE IF NOT EXISTS `T_유저_uid` (
  `uid` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nickname` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (`created_at`)
);
```

- 리더보드·좋아요의 `user_id`는 이 테이블의 `uid`와 같은 값으로 사용.
- **GET /api/uid/[uid]**: `T_유저_uid`에서 조회. 없으면 404.
- **POST /api/uid**: `T_유저_uid`에 INSERT (이미 있으면 조회만 반환).

이렇게 하면 기존 `/api/leaderboard`, `/api/builds/[id]/like` 와 역할이 구분되고, uid 기준 프로필/통계 API를 깔끔하게 붙일 수 있습니다.

---

## 7. API 문서 (Swagger)

프로젝트에는 **next-swagger-doc** + **swagger-ui-react**로 API 문서가 연동되어 있습니다. `app/api` 폴더를 스캔하고, 각 라우트 파일의 **`@swagger` JSDoc**을 파싱해 OpenAPI 스펙을 만들며, 문서 페이지를 열 때마다 최신 코드가 반영됩니다.

### 7.1 문서 보기

- 개발 서버 실행 후 브라우저에서 **`http://localhost:3000/api-doc`** 접속.
- 페이지를 새로고침하면 현재 `app/api` 기준으로 문서가 다시 생성됩니다.

### 7.2 관련 파일

| 파일                            | 역할                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `lib/swagger.ts`                | `getApiDocs()` — `app/api` 스캔 후 OpenAPI 스펙 생성 |
| `app/api-doc/page.tsx`          | 문서 페이지 (스펙 로드 후 Swagger UI 렌더)           |
| `app/api-doc/react-swagger.tsx` | Swagger UI 클라이언트 컴포넌트                       |

### 7.3 새 API에 Swagger 문서 넣기

각 **Route 파일** 상단에 `@swagger` JSDoc 블록을 추가하면 됩니다.  
경로는 **실제 URL** 기준으로 작성합니다 (동적 세그먼트는 `{id}`, `{uid}` 등).

**리스트/생성 라우트 예시** — `app/api/items/route.ts`:

```ts
/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: 목록 조회
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: 아이템 목록
 *       500:
 *         description: 서버 오류
 *   post:
 *     summary: 아이템 생성
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: 생성됨
 *       400:
 *         description: 잘못된 요청
 */
export async function GET() { ... }
export async function POST(request: NextRequest) { ... }
```

**단건/동적 경로 예시** — `app/api/items/[id]/route.ts`:

```ts
/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: 단건 조회
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 아이템 상세
 *       404:
 *         description: 없음
 *   put:
 *     summary: 수정
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 수정됨
 *       404:
 *         description: 없음
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) { ... }
```

### 7.4 정리

- **경로**: 실제 URL과 동일 (`/api/리소스`, `/api/리소스/{동적파라미터}`).
- **tags**: 그룹 이름 (예: `[Users]`, `[Items]`) — 문서에서 묶어서 표시.
- **parameters** / **requestBody** / **responses**: 필요에 따라 작성하면 문서가 풍부해짐.
- JSDoc만 추가해 두면 **코드 수정 후 문서 페이지 새로고침**으로 자동 반영됩니다.
