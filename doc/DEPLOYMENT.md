# 맥미니 배포 가이드

이 문서는 맥미니에서 WWE Next.js 애플리케이션을 배포하는 방법을 설명합니다.

## 필수 요구사항

- macOS (맥미니)
- Node.js 18 이상 (nvm 사용 권장)
- MySQL 8.0 이상 (Docker 사용 권장, 또는 Homebrew)
- PM2 (프로세스 관리자)
- Nginx (선택사항, 도메인 사용 시)

**배포 구성 요약**

- 앱: Next.js를 맥미니에서 PM2로 실행 (포트 3000).
- DB: MySQL 8 — Docker(`deploy/Dockerfile`) 사용 권장, 또는 Homebrew 설치.
- 배포 스크립트: `deploy/deploy.sh` (프로젝트 루트에서 실행).

## 1. 초기 설정

### 1.1 Node.js 및 필수 도구 설치

```bash
# Homebrew가 없다면 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치 (nvm 사용 권장 - 전역 패키지 권한 문제 방지)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# 터미널 재시작 또는: source ~/.zshrc
nvm install 20
nvm use 20

# PM2 전역 설치 (nvm 사용 시 sudo 불필요)
npm install -g pm2
```

### 1.3 MySQL 데이터베이스 설정

**방법 A: Docker 사용 (권장)**

프로젝트의 `deploy/` 디렉터리에 MySQL Dockerfile이 있습니다. README와 동일한 방식으로 사용합니다.

```bash
# WWE 프로젝트의 deploy 디렉터리에서
cd ./sideProject/WWE/deploy
docker build -t wwe-mysql .
docker run -d -p 3306:3306 --name wwe-mysql wwe-mysql

# 재부팅 후 MySQL만 다시 켜려면
docker start wwe-mysql
```

Docker 이미지에 이미 `wwe_db`, `wwe_user` / `wwe_password`가 설정되어 있으므로 별도 DB 생성 없이 `.env.production`만 맞추면 됩니다.


### 1.4 환경 변수 (.env.production)

프로젝트 루트에 `.env.production` 파일을 만들고 다음을 설정하세요. (README의 `.env.local`과 동일한 키, 프로덕션용 값 사용)

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=wwe_user
MYSQL_PASSWORD=wwe_password
MYSQL_DATABASE=wwe_db
```

**관리자 uid (선택)**  
빌드 수정/삭제를 모든 글에 할 수 있는 관리자 uid를 두려면:

```env
ADMIN_UIDS=발급받은-uuid-1,발급받은-uuid-2
```

- 비워두면 작성자만 자신의 글 수정/삭제 가능.
- uid는 브라우저에서 로그인/접속 후 `POST /api/uid`로 발급받은 값입니다.

## 2. PM2 설정

### 2.1 PM2 설정 파일 수정

프로젝트 루트의 `ecosystem.config.js`에서 `cwd`를 실제 WWE 프로젝트 경로로 변경:

```javascript
cwd: '/Users/your-username/sideProject/WWE',  // 실제 경로로 변경
```

### 2.2 로그 디렉토리 생성

```bash
# 프로젝트 루트에서
cd /path/to/WWE
mkdir -p logs
```

### 2.3 PM2로 앱 시작

```bash
# 프로젝트 루트에서
cd /path/to/WWE

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

**Apple Silicon 맥미니** (M1/M2/M3 등):

```bash
# servers 디렉토리 생성 (없으면)
sudo mkdir -p /opt/homebrew/etc/nginx/servers

# 설정 파일 복사
sudo cp nginx.conf.example /opt/homebrew/etc/nginx/servers/wwe

# 설정 파일 편집 (도메인 등 수정)
sudo vi /opt/homebrew/etc/nginx/servers/wwe
```


**설정 파일 수정 사항:**
- `server_name your-domain.com;` → 실제 도메인 또는 `localhost` (로컬 테스트 시)

### 3.3 Nginx 시작 및 재시작

```bash
# 설정 테스트
sudo nginx -t

# Nginx 시작 (부팅 시 자동 시작)
brew services start nginx

# 또는 수동 시작 (백그라운드 서비스 없이)
sudo /opt/homebrew/opt/nginx/bin/nginx

# 재시작 (설정 변경 후)
brew services restart nginx
# 또는
sudo nginx -s reload
```

### 3.4 다른 기기에서 접근하기

Nginx가 실행 중이면, 같은 Wi‑Fi/네트워크의 다른 기기(휴대폰, 다른 PC 등)에서도 접근할 수 있습니다.

**1. 맥미니 IP 주소 확인:**

```bash
# Wi‑Fi IP 확인 (일반적으로 en0)
ipconfig getifaddr en0

# 또는 모든 네트워크 인터페이스 확인
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**2. 방화벽 설정:**

- **시스템 설정 → 네트워크 → 방화벽 → 옵션**
- "자동으로 서명된 소프트웨어가 들어오는 연결 허용" 체크
- 또는 방화벽에서 nginx/포트 80 허용

**3. 다른 기기에서 접속:**

- 브라우저에서 `http://<맥미니IP>` 입력
- 예: `http://192.168.0.10`

**참고:**
- `server_name localhost;`로 설정되어 있어도 IP로 접근 가능합니다.
- 도메인을 사용하려면 `server_name`에 도메인을 추가하거나 `_` (모든 호스트 허용)를 사용할 수 있습니다.

## 4. 배포 프로세스

### 4.1 자동 배포 스크립트 사용

`deploy/deploy.sh`는 의존성 설치 → 빌드 → PM2 재시작까지 수행합니다. **프로젝트 루트(WWE)**에서 실행하세요.

```bash
cd /path/to/WWE

# 실행 권한 부여 (최초 1회)
chmod +x deploy/deploy.sh

# 배포 실행
./deploy/deploy.sh
```

코드 반영이 필요하면 `deploy/deploy.sh` 안의 `git pull origin main` 주석을 해제한 뒤 사용하세요.

### 4.2 수동 배포

```bash
cd /path/to/WWE

# 1. 코드 업데이트 (Git 사용 시)
git pull origin main

# 2. 의존성 설치
npm ci --production=false

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

- `.env.production`의 `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` 확인
- **Docker 사용 시**: `docker ps`로 MySQL 컨테이너 실행 여부 확인. 중지됐으면 `docker start wwe-mysql`
- **Homebrew 사용 시**: `brew services list`로 mysql 실행 여부 확인
- 방화벽에서 3306 포트 차단 여부 확인

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

**Docker MySQL 사용 시:**

```bash
# 백업 (컨테이너 이름은 wwe-mysql 가정)
docker exec wwe-mysql mysqldump -u wwe_user -pwwe_password wwe_db > backup_$(date +%Y%m%d).sql

# 복구
docker exec -i wwe-mysql mysql -u wwe_user -pwwe_password wwe_db < backup_20240213.sql
```

**Homebrew(로컬) MySQL 사용 시:**

```bash
# 백업
mysqldump -u wwe_user -p wwe_db > backup_$(date +%Y%m%d).sql

# 복구
mysql -u wwe_user -p wwe_db < backup_20240213.sql
```

### 9.2 자동 백업 스크립트 (cron)

Docker 사용 시 예시 (백업 디렉터리 존재해야 함):

```bash
crontab -e

# 매일 새벽 2시에 백업
0 2 * * * docker exec wwe-mysql mysqldump -u wwe_user -pwwe_password wwe_db > /backup/wwe_db_$(date +\%Y\%m\%d).sql
```

로컬 MySQL 사용 시:

```bash
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
