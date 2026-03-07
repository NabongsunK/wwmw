# 외부 접속 설정 및 보안 가이드

맥미니에서 실행 중인 서버를 외부(인터넷)에서 접속할 수 있도록 설정하고 보안을 강화하는 방법을 설명합니다.

## 목차

1. [외부 접속 방법 개요](#1-외부-접속-방법-개요) ← **포트포워딩 실패 시 대안**
2. [도메인을 IP에 연결](#2-도메인을-ip에-연결-dns-설정)
3. [보안 강화 방법](#3-보안-강화-방법)
4. [전체 보안 체크리스트](#4-전체-보안-체크리스트)
5. [추천 구성](#5-추천-구성)

---

## 1. 외부 접속 방법 개요

### 포트포워딩이 안 될 때 (CGNAT, 공유기 제한 등)

라우터에서 80/443 포트포워딩이 불가능한 경우(통신사 CGNAT, 공유기 관리 권한 없음, 회사/아파트 공유망 등) 아래 방법 중 하나를 사용할 수 있습니다.

| 방법                  | 장점                                  | 단점                      | 추천도 |
| --------------------- | ------------------------------------- | ------------------------- | ------ |
| **Cloudflare Tunnel** | 무료, 포트 오픈 불필요, DDoS/WAF 활용 | Cloudflare 경유           | ⭐⭐⭐ |
| **ngrok**             | 설정 간단, 즉시 테스트 가능           | 무료는 URL/제한 있음      | ⭐⭐   |
| **Tailscale**         | 사설망처럼 안전, 포트 오픈 없음       | 접속측에도 Tailscale 필요 | ⭐⭐⭐ |
| **VPS + 리버스 터널** | 완전한 제어, 커스텀 도메인            | VPS 비용, 설정 복잡       | ⭐     |

---

### 방법 A: Cloudflare Tunnel (추천)

**아웃바운드만** 사용하므로 라우터에서 포트를 열 필요가 없습니다. 맥미니가 Cloudflare 쪽으로 터널을 만들고, 트래픽이 그 터널로 들어옵니다.

1. **Cloudflare Zero Trust / Tunnel 사용**
   - [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Networks** → **Tunnels**
   - **Create a tunnel** → 이름 입력(예: `wwe-macmini`) → **cloudflared** 설치 방식 선택

2. **맥미니에 cloudflared 설치 및 로그인**

   ```bash
   # 맥미니에서
   brew install cloudflared
   cloudflared tunnel login   # 브라우저에서 도메인 인증
   ```

3. **터널 생성 및 설정**

   ```bash
   cloudflared tunnel create wwe
   # Tunnel ID 확인 후, config 파일 작성
   ```

4. **설정 파일 예시** (`~/.cloudflared/config.yml`)

```
    cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: <TUNNEL_ID>
credentials-file: /Users/nabongsun/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: wwmw.shop
    service: http://localhost:3000
  - service: http_status:404
EOF
```

5. **터널 실행** (백그라운드 서비스로 등록 권장)

   ```bash
   cloudflared tunnel run wwe
   ```

   - 영구 실행: `brew services` 또는 launchd로 등록

6. **Cloudflare 대시보드에서 DNS**
   - **DNS** → yourdomain.com에 대해 **CNAME** 추가
   - 이름: `@` 또는 `www`, 타겟: `<TUNNEL_ID>.cfargotunnel.com`

이렇게 하면 **포트포워딩 없이** `https://yourdomain.com`으로 접속 가능합니다. SSL은 Cloudflare에서 처리합니다.

---

### 방법 B: ngrok

개발/테스트용으로 빠르게 외부 노출할 때 적합합니다.

```bash
# 맥미니에서
brew install ngrok
ngrok config add-authtoken YOUR_TOKEN   # https://ngrok.com 가입 후 토큰 발급
ngrok http 3000
```

- 무료 플랜: 매번 URL이 바뀌고 동시 연결 수 제한
- 유료 플랜: 고정 서브도메인, 커스텀 도메인 가능

---

### 방법 C: Tailscale (사설망처럼 접속)

맥미니와 접속하는 PC/폰을 모두 Tailscale에 넣으면 **같은 가상 LAN**에 있는 것처럼 접속할 수 있습니다. 포트를 인터넷에 열지 않습니다.

1. [Tailscale](https://tailscale.com/) 가입
2. 맥미니에 Tailscale 설치 및 로그인
   ```bash
   brew install tailscale
   sudo tailscale up
   ```
3. 접속할 다른 기기(PC, 폰)에도 Tailscale 앱 설치 후 같은 계정으로 로그인
4. 맥미니의 Tailscale IP(예: `100.x.x.x`)로 접속: `http://100.x.x.x:3000`

**장점**: 포트 오픈 없음, 암호화된 P2P. **단점**: 서비스에 접속하는 모든 사용자가 Tailscale 설치가 필요합니다. "나만 또는 소수만 접속"할 때 유리합니다.

---

### 방법 D: VPS + 리버스 터널 (고급)

VPS 한 대를 두고, 맥미니가 VPS로 SSH 리버스 터널(또는 WireGuard)을 붙여 두는 방식입니다. VPS에서 80/443 수신 → 터널을 통해 맥미니의 3000 포트로 전달. 설정이 복잡하고 VPS 비용이 들므로, 완전한 제어가 필요할 때만 고려합니다.

---

### 정리

- **포트포워딩 가능** → 기존 문서대로 라우터에서 80/443 포워딩 + Nginx + 도메인 연결 사용.
- **포트포워딩 불가** → **Cloudflare Tunnel**로 도메인까지 그대로 쓰거나, **Tailscale**로 제한된 사용자만 사설망처럼 접속하는 구성을 추천합니다.

---

## 2. 도메인을 IP에 연결 (DNS 설정)

### DNS A 레코드 설정

#### 가비아(Gabia)에서 도메인을 구매한 경우

도메인을 가비아에서만 구매했어도 DNS 설정으로 맥미니 공인 IP에 연결할 수 있습니다.

**방법 A: 가비아 DNS로 직접 설정 (가장 단순)**

1. **가비아 DNS 관리 접속**
   - [가비아 DNS 관리](https://dns.gabia.com/) 또는 [웹호스팅 DNS](https://webhosting.gabia.com/dns) 로그인
   - 해당 도메인이 가비아 네임서버(`ns.gabia.co.kr`, `ns1.gabia.co.kr`)를 쓰고 있는지 확인

2. **A 레코드(호스트/IP) 추가**
   - **유형**: `A` (호스트(IP)(A))
   - **호스트**: `@` (루트 도메인) 또는 `www` (서브도메인)
   - **값/IP**: 맥미니의 공인 IP (아래 명령으로 확인)
   - **TTL**: `3600` 또는 기본값

3. **공인 IP가 바뀌는 경우(동적 IP)**  
   가비아는 DDNS용 공식 API가 없을 수 있어, 아래 둘 중 하나를 추천합니다.
   - **추천**: [방법 B](#방법-b-가비아-도메인-그대로-두고-cloudflare-연결)처럼 Cloudflare 네임서버만 연결해 두고, Cloudflare API로 DDNS 스크립트 사용 (도메인 등록은 가비아에 그대로 둠)
   - 또는 공인 IP가 거의 안 바뀌면 가비아 DNS에서 A 레코드만 수동으로 바꿔도 됨

**방법 B: 가비아 도메인 그대로 두고 Cloudflare 연결**

도메인 소유권은 가비아에 두고, DNS만 Cloudflare로 옮기면 DDNS 스크립트·WAF 등을 쓸 수 있습니다.

1. [Cloudflare](https://dash.cloudflare.com/) 가입 후 **도메인 추가** (이전이 아니라 “사이트 추가”)
2. Cloudflare에서 안내하는 **네임서버 2개** 복사 (예: `xxx.ns.cloudflare.com`, `yyy.ns.cloudflare.com`)
3. **가비아** → 도메인 관리 → **네임서버 변경**에서 위 Cloudflare 네임서버로 변경
4. 전파 후 Cloudflare DNS에서 A 레코드 설정 (고정 IP) 또는 아래 [Cloudflare API DDNS](#cloudflare-api-사용-추천) 스크립트로 동적 IP 자동 반영

이렇게 하면 **등록/결제는 계속 가비아**, **DNS·보안 기능은 Cloudflare**에서 사용할 수 있습니다.

---

**그 외 업체(Cloudflare, Namecheap, GoDaddy 등) 사용 시**

1. **도메인 관리 페이지 접속**
   - 해당 도메인 등록 업체 사이트 접속

2. **DNS 설정에서 A 레코드 추가**
   - **Type**: `A`
   - **Name**: `@` (루트 도메인) 또는 `www` (서브도메인)
   - **Value**: `맥미니의 공인 IP` (예: `123.45.67.89`)
   - **TTL**: `3600` (또는 기본값)

3. **공인 IP 확인**
   ```bash
   # 맥미니에서 실행
   curl ifconfig.me
   # 또는
   curl https://api.ipify.org
   ```

### 동적 IP인 경우 (DDNS 설정)

공인 IP가 자주 바뀌는 경우, DDNS(Dynamic DNS) 서비스를 사용해야 합니다.

#### Cloudflare API 사용 (추천)

```bash
#!/bin/bash
# update-dns.sh

CURRENT_IP=$(curl -s https://api.ipify.org)
CLOUDFLARE_API_TOKEN="your-api-token"
ZONE_ID="your-zone-id"
RECORD_ID="your-record-id"
DOMAIN="yourdomain.com"

curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$CURRENT_IP\"}"

echo "DNS updated to $CURRENT_IP"
```

**설정 방법:**

1. Cloudflare에서 API Token 생성
2. Zone ID와 Record ID 확인
3. 위 스크립트를 실행 가능하게 만들기: `chmod +x update-dns.sh`
4. cron으로 정기 실행 설정:
   ```bash
   # 매 5분마다 IP 확인 및 업데이트
   */5 * * * * /path/to/update-dns.sh
   ```

#### DuckDNS 사용 (간단한 방법)

```bash
# DuckDNS에서 도메인 생성 후
# https://www.duckdns.org

# cron 설정
*/5 * * * * curl "https://www.duckdns.org/update?domains=yourdomain&token=your-token"
```

---

## 3. 보안 강화 방법

### A. HTTPS (SSL/TLS) 설정 - 필수

#### Let's Encrypt 인증서 발급

```bash
# 맥미니에서 Certbot 설치
brew install certbot

# Nginx 사용 시 자동 설정
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 인증서 자동 갱신 테스트
sudo certbot renew --dry-run
```

#### Nginx SSL 설정 예시

```nginx
# HTTP를 HTTPS로 리다이렉트
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 서버 설정
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 인증서 경로
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL 보안 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Next.js 앱으로 프록시
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### B. 방화벽 설정

#### macOS 방화벽 활성화

```bash
# 방화벽 상태 확인
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# 방화벽 활성화
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on

# Nginx만 허용 (80, 443 포트)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/nginx
# 또는 Homebrew로 설치한 경우
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /opt/homebrew/bin/nginx

# MySQL은 내부에서만 접속 가능하도록 (3306은 외부에 노출하지 않음)
# Docker MySQL의 경우 포트 매핑을 제거하거나 내부 네트워크만 사용
```

#### 시스템 설정에서 방화벽 관리

1. **시스템 설정** → **네트워크** → **방화벽**
2. 방화벽 켜기
3. **옵션...** 클릭
4. Nginx 앱 추가 및 "들어오는 연결 허용" 설정

### C. Fail2Ban 설치 (무차별 대입 공격 방지)

```bash
# 맥미니에서 설치
brew install fail2ban

# 설정 파일 생성
sudo cp /opt/homebrew/etc/fail2ban/jail.conf /opt/homebrew/etc/fail2ban/jail.local

# 설정 파일 편집
sudo nano /opt/homebrew/etc/fail2ban/jail.local
```

**jail.local 설정 예시:**

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/system.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /usr/local/var/log/nginx/error.log
maxretry = 10
```

```bash
# Fail2Ban 시작
sudo brew services start fail2ban
```

### D. 강력한 인증

#### MySQL 접속 보안

```sql
-- 강력한 비밀번호 사용
-- 특정 IP만 허용 (보안 강화)
CREATE USER 'wwe_user'@'특정IP' IDENTIFIED BY '강력한비밀번호';
GRANT ALL PRIVILEGES ON wwe_db.* TO 'wwe_user'@'특정IP';
FLUSH PRIVILEGES;

-- root 계정 외부 접속 차단
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
FLUSH PRIVILEGES;
```

#### SSH 접속 보안

```bash
# SSH 키 인증만 허용
sudo nano /etc/ssh/sshd_config

# 다음 설정 추가/수정
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no

# SSH 재시작
sudo launchctl unload /System/Library/LaunchDaemons/ssh.plist
sudo launchctl load -w /System/Library/LaunchDaemons/ssh.plist
```

### E. 정기 업데이트

```bash
# 맥미니에서 정기적으로 업데이트
brew update && brew upgrade

# 시스템 업데이트
sudo softwareupdate -i -a

# npm 패키지 보안 취약점 확인
npm audit
npm audit fix
```

### F. 로그 모니터링

```bash
# Nginx 접근 로그 모니터링
tail -f /usr/local/var/log/nginx/access.log

# 의심스러운 접속 확인
grep "404\|403\|500" /usr/local/var/log/nginx/access.log

# 실시간 모니터링 스크립트
watch -n 1 'tail -20 /usr/local/var/log/nginx/access.log'
```

### G. Rate Limiting (Nginx)

```nginx
# Nginx 설정에 추가
http {
    # Rate limiting 설정
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

    server {
        # 일반 요청 제한
        location / {
            limit_req zone=general_limit burst=50 nodelay;
            proxy_pass http://localhost:3000;
        }

        # API 요청 제한 (더 엄격)
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://localhost:3000;
        }
    }
}
```

### H. Cloudflare 보안 기능 (도메인 사용 시)

Cloudflare를 사용하면 추가 보안 기능을 활용할 수 있습니다.

#### Cloudflare 설정

1. **도메인을 Cloudflare로 이전**
   - Cloudflare 계정 생성
   - 도메인 추가 및 DNS 서버 변경

2. **Security → WAF에서 규칙 설정**
   - SQL Injection 방지
   - XSS 공격 방지
   - 자동 보안 규칙 활성화

3. **Firewall Rules에서 IP 접근 제한**

   ```
   (http.request.uri.path contains "/admin") and (ip.src ne 192.168.1.100)
   → Action: Block
   ```

4. **Rate Limiting 설정**
   - Security → WAF → Rate limiting rules
   - 예: 1분에 100회 이상 요청 시 차단

5. **Bot Fight Mode 활성화**
   - Security → Bots
   - 자동으로 봇 차단

---

## 4. 전체 보안 체크리스트

- [ ] **HTTPS 설정** (Let's Encrypt)
  - [ ] SSL 인증서 발급
  - [ ] HTTP → HTTPS 리다이렉트
  - [ ] 보안 헤더 설정

- [ ] **방화벽 설정**
  - [ ] macOS 방화벽 활성화
  - [ ] 필요한 포트만 열기 (80, 443)
  - [ ] MySQL 포트(3306) 외부 노출 차단

- [ ] **강력한 비밀번호 사용**
  - [ ] MySQL 비밀번호 강화
  - [ ] 관리자 계정 비밀번호 강화

- [ ] **MySQL 외부 접속 제한**
  - [ ] 특정 IP만 허용
  - [ ] root 계정 외부 접속 차단

- [ ] **정기적인 보안 업데이트**
  - [ ] 시스템 업데이트
  - [ ] npm 패키지 업데이트
  - [ ] 보안 취약점 점검

- [ ] **로그 모니터링**
  - [ ] Nginx 접근 로그 확인
  - [ ] 의심스러운 접속 모니터링

- [ ] **Rate Limiting 설정**
  - [ ] API 요청 제한
  - [ ] 일반 요청 제한

- [ ] **Cloudflare 보안 기능 활용** (선택)
  - [ ] WAF 활성화
  - [ ] Firewall Rules 설정
  - [ ] Bot Fight Mode 활성화

- [ ] **Fail2Ban 설치** (선택)
  - [ ] SSH 보호
  - [ ] Nginx 보호

- [ ] **SSH 보안 강화** (서버 관리용)
  - [ ] 키 인증만 허용
  - [ ] root 로그인 차단

---

## 5. 추천 구성

```
인터넷
  ↓
Cloudflare (DDoS 보호, WAF, Bot 차단)
  ↓
도메인 (yourdomain.com)
  ↓
라우터 포트 포워딩 (80, 443)  ← 불가 시: Cloudflare Tunnel 사용 (섹션 1 참고)
  ↓
맥미니 방화벽 (Nginx만 허용)
  ↓
Nginx (HTTPS, Rate Limiting, 보안 헤더)
  ↓
Node.js (localhost:3000)
  ↓
MySQL (localhost:3306, 외부 접속 차단)
```

### 보안 레이어

1. **Cloudflare**: DDoS 보호, WAF, Bot 차단
2. **라우터 방화벽**: 포트 포워딩만 허용
3. **macOS 방화벽**: Nginx만 허용
4. **Nginx**: Rate Limiting, SSL, 보안 헤더
5. **애플리케이션**: 인증, 권한 관리
6. **데이터베이스**: 내부 접속만 허용

---

## 6. 문제 해결

### DNS가 업데이트되지 않을 때

```bash
# DNS 캐시 확인
nslookup yourdomain.com
dig yourdomain.com

# DNS 캐시 삭제 (맥미니)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### SSL 인증서 갱신 실패 시

```bash
# 수동 갱신
sudo certbot renew --force-renewal

# 로그 확인
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### 방화벽 문제 해결

```bash
# 방화벽 상태 확인
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --listapps

# 특정 앱 제거 후 재추가
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --remove /path/to/app
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/app
```

---

## 참고 자료

- [Let's Encrypt 공식 문서](https://letsencrypt.org/docs/)
- [Cloudflare 보안 가이드](https://developers.cloudflare.com/fundamentals/get-started/)
- [Nginx 보안 가이드](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Fail2Ban 공식 문서](https://www.fail2ban.org/wiki/index.php/Main_Page)
