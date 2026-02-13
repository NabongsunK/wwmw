# 맥미니 배포 가이드

이 문서는 맥미니에서 WWE Next.js 애플리케이션을 배포하는 방법을 설명합니다.

## 필수 요구사항

- macOS (맥미니)
- Node.js 18 이상
- MySQL 8.0 이상
- PM2 (프로세스 관리자)
- Nginx (선택사항, 도메인 사용 시)

## 1. 초기 설정

### 1.1 Node.js 및 필수 도구 설치

```bash
# Homebrew가 없다면 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치 (nvm 사용 권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# PM2 전역 설치
npm install -g pm2

# MySQL 설치 (아직 없다면)
brew install mysql
brew services start mysql
```

### 1.2 프로젝트 클론 및 설정

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/wwe

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.production.example .env.production
# .env.production 파일을 편집하여 실제 값 입력
```

### 1.3 MySQL 데이터베이스 설정

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 및 사용자 생성
CREATE DATABASE wwe_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wwe_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON wwe_db.* TO 'wwe_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 2. PM2 설정

### 2.1 PM2 설정 파일 수정

`ecosystem.config.js` 파일의 `cwd` 경로를 실제 프로젝트 경로로 변경:

```javascript
cwd: '/Users/your-username/path/to/wwe',  // 실제 경로로 변경
```

### 2.2 로그 디렉토리 생성

```bash
mkdir -p logs
```

### 2.3 PM2로 앱 시작

```bash
# 빌드 먼저 실행
npm run build

# PM2로 시작
pm2 start ecosystem.config.js

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

## 3. Nginx 설정 (선택사항)

도메인을 사용하거나 포트 80/443에서 서비스하려는 경우:

### 3.1 Nginx 설치

```bash
brew install nginx
```

### 3.2 설정 파일 생성

```bash
# 설정 파일 복사
sudo cp nginx.conf.example /usr/local/etc/nginx/servers/wwe

# 설정 파일 편집 (도메인 등 수정)
sudo nano /usr/local/etc/nginx/servers/wwe
```

### 3.3 Nginx 시작 및 재시작

```bash
# 설정 테스트
sudo nginx -t

# Nginx 시작/재시작
sudo brew services start nginx
# 또는
sudo nginx -s reload
```

## 4. 배포 프로세스

### 4.1 자동 배포 스크립트 사용

```bash
# 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

### 4.2 수동 배포

```bash
# 1. 코드 업데이트 (Git 사용 시)
git pull origin main

# 2. 의존성 설치
npm ci

# 3. 빌드
npm run build

# 4. PM2 재시작
pm2 restart wwe-nextjs
```

## 5. 모니터링 및 관리

### 5.1 PM2 명령어

```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs wwe-nextjs

# 실시간 모니터링
pm2 monit

# 재시작
pm2 restart wwe-nextjs

# 중지
pm2 stop wwe-nextjs

# 시작
pm2 start wwe-nextjs

# 삭제
pm2 delete wwe-nextjs
```

### 5.2 로그 확인

```bash
# PM2 로그
pm2 logs wwe-nextjs

# Nginx 로그 (설정한 경우)
tail -f /var/log/nginx/wwe-access.log
tail -f /var/log/nginx/wwe-error.log
```

## 6. 보안 설정

### 6.1 방화벽 설정

```bash
# macOS 방화벽 활성화
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on

# 특정 포트만 열기 (필요한 경우)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

### 6.2 SSL 인증서 설정 (Let's Encrypt)

도메인을 사용하는 경우:

```bash
# Certbot 설치
brew install certbot

# 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

## 7. 트러블슈팅

### 7.1 포트가 이미 사용 중인 경우

```bash
# 포트 사용 확인
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

### 7.2 MySQL 연결 오류

- `.env.production` 파일의 MySQL 설정 확인
- MySQL 서비스가 실행 중인지 확인: `brew services list`
- 방화벽 설정 확인

### 7.3 빌드 오류

```bash
# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
```

## 8. 성능 최적화

### 8.1 PM2 클러스터 모드 (선택사항)

`ecosystem.config.js`에서:

```javascript
instances: 'max',  // CPU 코어 수만큼 인스턴스 생성
exec_mode: 'cluster',  // 클러스터 모드
```

### 8.2 Next.js 최적화

- 이미지 최적화 활성화
- 정적 파일 캐싱 설정
- CDN 사용 고려

## 9. 백업 및 복구

### 9.1 데이터베이스 백업

```bash
# 백업
mysqldump -u wwe_user -p wwe_db > backup_$(date +%Y%m%d).sql

# 복구
mysql -u wwe_user -p wwe_db < backup_20240213.sql
```

### 9.2 자동 백업 스크립트 (cron)

```bash
# crontab 편집
crontab -e

# 매일 새벽 2시에 백업
0 2 * * * /usr/local/bin/mysqldump -u wwe_user -p'password' wwe_db > /backup/wwe_db_$(date +\%Y\%m\%d).sql
```

## 10. 업데이트 및 유지보수

정기적으로 다음을 수행하세요:

- Node.js 및 npm 패키지 업데이트
- 보안 패치 적용
- 로그 파일 정리
- 데이터베이스 최적화

```bash
# 패키지 업데이트 확인
npm outdated

# 보안 취약점 확인
npm audit

# 로그 파일 정리 (30일 이상 된 파일)
find logs -name "*.log" -mtime +30 -delete
```
