# 슬라이딩 퍼즐 (archi)

Pygame 프로토타입(`../sliding_puzzle/`)을 wwmw Next.js에 통합한 버전입니다.

## URL


| 경로                | 설명    |
| ----------------- | ----- |
| `/archi/puzzle/1` | 1번 레벨 |


배포 시 `https://wwmw.shop/archi/puzzle/1` 형태로 접근합니다. nginx 추가 설정 없이 Next.js 라우트만으로 동작합니다.

## 레벨 추가

1. `lib/puzzle/levels/2.ts` — `LevelConfig` 작성
2. `lib/puzzle/levels/index.ts` — `LEVELS`에 등록

맵 데이터는 `sliding_puzzle/board.py`, `blocks.py`와 동일한 형식입니다.

## 로컬 실행

```bash
cd wwmw
npm run dev
```

브라우저: [http://localhost:3000/archi/puzzle/1](http://localhost:3000/archi/puzzle/1)

## 파일

- `lib/puzzle/engine.ts` — 이동·승리 판정
- `lib/puzzle/levels/` — 맵·벽·블록·골인
- `app/components/puzzle/PuzzleGame.tsx` — UI·드래그
- `app/archi/puzzle/[id]/page.tsx` — 라우트

