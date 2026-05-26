# 아치 퍼즐

wwmw에 통합된 미니 퍼즐 모음입니다. URL 경로는 `/archi/...` 이고, 읽을 때는 **아치**입니다. **모두 `/archi/puzzle/{id}`** 로 접근합니다.

## URL

| 경로              | 종류          | 설명                    |
| ----------------- | ------------- | ----------------------- |
| `/archi/puzzle/1` | 슬라이딩 블록 | `sliding_puzzle` 1번 맵 |
| `/archi/puzzle/2` | 구슬 점프     | 5구슬 중반 (최소 4수)   |

배포: `https://wwmw.shop/archi/puzzle/2` 등. nginx 추가 설정 없음.

## 레벨 등록

`lib/archi/puzzle-registry.ts`의 `PUZZLES`에 id를 추가합니다.

```ts
'4': { kind: 'sliding', level: level2 },  // 슬라이딩
'5': { kind: 'peg', level: pegLevel3 },   // 구슬 점프
```

## 로컬 실행

```bash
cd wwmw
npm run dev
```

- [http://localhost:3000/archi/puzzle/1](http://localhost:3000/archi/puzzle/1) — 슬라이딩
- [http://localhost:3000/archi/puzzle/2](http://localhost:3000/archi/puzzle/2) — 구슬 점프

---

## 슬라이딩 블록 (`/archi/puzzle/1`)

- `lib/puzzle/levels/` — 맵 데이터 (`sliding_puzzle`과 동일 형식)
- `app/components/puzzle/PuzzleGame.tsx`

## 페그 솔리테어 (`/archi/puzzle/2`)

- 인접 구슬을 뛰어넘어 제거 → **구슬 1개**만 남기면 클리어
- 조작: 구슬 클릭 → 빈 칸(노란 링) 클릭
- `lib/peg/levels/` — `pegs: [row,col][]` 배치
- `app/components/peg/PegGame.tsx`

## 라우트

- `app/archi/puzzle/[id]/page.tsx` — 닉네임 입력 후 `sliding` / `peg` 분기

## DB 클리어 기록

1. MySQL에 테이블 생성: `sql/archi_puzzle_clear.sql` 실행 (`T_아치_퍼즐_클리어`)
2. 클리어 시 `POST /api/archi/puzzle/clear` 로 저장
3. 닉네임 비우면 **`테스트아치`** 로 저장
4. 저장 시 닉네임에 항상 **`#1`, `#2` …** 자동 부여 (첫 클리어도 `#1`, 퍼즐별)
5. `uid`는 브라우저 `wwe_uid`(선택) 함께 저장

| 컬럼       | 설명                       |
| ---------- | -------------------------- |
| puzzle_id  | `1` 슬라이딩, `2` 구슬점프 |
| nickname   | 표시 이름                  |
| move_count | 클리어 이동 횟수           |
| uid        | T_UID (nullable)           |
| cleared_at | 클리어 달성 시각           |

## 랭킹

- 게임 화면 **오른쪽** 패널에 표시 (모바일은 아래)
- `GET /api/archi/puzzle/ranking?puzzleId=1` — 이동 횟수 오름차순, 동점 시 `cleared_at` 빠른 순 (상위 30명)
- 클리어 저장 성공 시 목록 자동 갱신
