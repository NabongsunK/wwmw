This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 프로젝트 구조 (Layered Architecture)

```
WWE/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트 (RESTful endpoints)
│   │   ├── db/            # 데이터베이스 관련 API
│   │   │   └── test/
│   │   │       └── route.ts
│   │   └── users/         # 사용자 API
│   │       └── route.ts
│   ├── components/        # React 컴포넌트
│   │   ├── BuildList.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   └── globals.css        # 전역 스타일
│
├── service/               # Service 레이어 (비즈니스 로직)
│   └── user.service.ts
│
├── repo/                  # Repository 레이어 (데이터 접근)
│   └── user.repository.ts
│
├── types/                 # TypeScript 타입 정의
│   └── user.ts
│
├── lib/                   # 유틸리티 및 설정
│   ├── db.ts              # MySQL 연결 풀
│   └── db.example.ts      # 사용 예시
│
└── public/                # 정적 파일
```

### 아키텍처 레이어

1. **API Routes** (`app/api/`) - HTTP 요청/응답 처리
2. **Services** (`service/`) - 비즈니스 로직 및 검증
3. **Repositories** (`repo/`) - 데이터베이스 CRUD 작업
4. **Database** (`lib/db.ts`) - MySQL 연결 관리
5. **Types** (`types/`) - TypeScript 타입 정의

## Getting Started

### 1. 의존성 설치

```bash
npm install
```

### 2. MySQL 데이터베이스 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=wwe_user
MYSQL_PASSWORD=wwe_password
MYSQL_DATABASE=z
```

**관리자 uid (선택)**  
빌드 수정/삭제를 모든 글에 할 수 있는 관리자를 두려면, 해당 uid를 쉼표로 나열하세요.  
(uid는 브라우저에서 한 번 로그인/접속 후 `POST /api/uid`로 발급받은 값입니다.)

```env
ADMIN_UIDS=발급받은-uuid-1,발급받은-uuid-2
```

- 비워두면 **작성자만** 자신의 글 수정/삭제 가능.
- 설정하면 나열한 uid는 **모든 빌드**에 대해 수정/삭제 가능.

또는 Docker를 사용하는 경우:

```bash
cd ../deploy
docker build -t wwe-mysql .
docker run -d -p 3306:3306 --name wwe-mysql wwe-mysql

docker start wwe-mysql
```

### 3. 개발 서버 실행

```bash
cd 'F:\Users\user\sideProject\wwe\'
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. 데이터베이스 연결 테스트

브라우저에서 [http://localhost:3000/api/db/test](http://localhost:3000/api/db/test)를 열어 연결을 테스트할 수 있습니다.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
