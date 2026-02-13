#!/bin/bash

# WWE Next.js 배포 스크립트
# 사용법: ./deploy.sh

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 WWE 배포 시작..."

# 1. 최신 코드 가져오기 (Git 사용 시)
# git pull origin main

# 2. 의존성 설치
echo "📦 의존성 설치 중..."
npm ci --production=false

# 3. 빌드
echo "🔨 프로덕션 빌드 중..."
npm run build

# 4. PM2로 재시작
echo "🔄 PM2로 앱 재시작 중..."
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

# 5. 상태 확인
echo "✅ 배포 완료!"
pm2 status

echo ""
echo "📊 로그 확인: pm2 logs wwe-nextjs"
echo "🛑 중지: pm2 stop wwe-nextjs"
echo "▶️  시작: pm2 start wwe-nextjs"
