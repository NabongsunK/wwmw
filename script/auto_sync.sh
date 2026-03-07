#!/bin/bash

# WWE(Next.js) 자동 동기화·배포 스크립트
# 사용법: 프로젝트 루트에서 ./script/auto_sync.sh
# 필요: Node.js, npm, PM2 (npm install -g pm2)

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 설정 변수
REPO_PATH="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="master"
REMOTE="origin"
CHECK_INTERVAL=30
LOG_FILE="$REPO_PATH/logs/auto_sync.log"
PM2_APP_NAME="wwe"

# 로그 폴더 생성
mkdir -p "$REPO_PATH/logs"
echo "=== WWE Auto Sync Started $(date) ===" > "$LOG_FILE"

# 애플리케이션 종료
stop_application() {
    log_info "Stopping PM2 app: $PM2_APP_NAME"
    cd "$REPO_PATH" || return 1
    if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
        pm2 stop "$PM2_APP_NAME" 2>/dev/null
        pm2 delete "$PM2_APP_NAME" 2>/dev/null
        log_success "PM2 app stopped"
    fi
    if command -v lsof > /dev/null 2>&1 && lsof -i :3000 > /dev/null 2>&1; then
        log_warning "Port 3000 in use, killing..."
        lsof -ti :3000 | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# 애플리케이션 시작 (빌드 후 PM2로 실행)
start_application() {
    log_info "Building and starting application..."
    cd "$REPO_PATH" || return 1

    stop_application

    log_info "Running: npm run build"
    if ! npm run build; then
        log_error "Build failed!"
        return 1
    fi
    log_success "Build completed"

    if [ -f "ecosystem.config.js" ]; then
        log_info "Starting with ecosystem.config.js"
        pm2 start ecosystem.config.js
    else
        log_info "Starting with: pm2 start npm --name $PM2_APP_NAME -- start"
        pm2 start npm --name "$PM2_APP_NAME" -- start
    fi

    sleep 2
    if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
        log_success "Application started (PM2: $PM2_APP_NAME)"
        log_info "App URL: http://localhost:3000"
    else
        log_error "Application start failed"
        return 1
    fi
}

# Git 동기화 후 필요 시 빌드·재시작
sync_repository() {
    log_info "Syncing Git repository..."
    cd "$REPO_PATH" || return 1

    if ! git fetch "$REMOTE" 2>/dev/null; then
        log_error "Git fetch failed"
        return 1
    fi

    LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null)
    REMOTE_COMMIT=$(git rev-parse "$REMOTE/$BRANCH" 2>/dev/null)
    if [ -z "$LOCAL_COMMIT" ] || [ -z "$REMOTE_COMMIT" ]; then
        log_warning "Could not get commit refs (branch $BRANCH?)"
        return 0
    fi

    if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
        log_info "No changes detected"
        return 0
    fi

    log_warning "New changes detected (Local: ${LOCAL_COMMIT:0:8} -> Remote: ${REMOTE_COMMIT:0:8})"
    if ! git pull "$REMOTE" "$BRANCH"; then
        log_error "Git pull failed"
        return 1
    fi

    log_success "Code updated"
    log_info "Installing dependencies..."
    if ! npm ci --production=false 2>/dev/null; then
        npm install
    fi
    start_application
}

# 헬스체크: PM2 앱이 죽었으면 재시작
health_check() {
    cd "$REPO_PATH" || return
    if ! pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
        log_warning "PM2 app not running. Starting..."
        start_application
        return
    fi
    STATUS=$(pm2 jlist 2>/dev/null | grep -o '"status":"[^"]*"' | head -1)
    if echo "$STATUS" | grep -q "stopped\|errored"; then
        log_warning "PM2 app status: $STATUS. Restarting..."
        start_application
    fi
}

# 로그 정리
cleanup_logs() {
    [ ! -d "$REPO_PATH/logs" ] && return
    find "$REPO_PATH/logs" -name "*.log" -size +10M -exec gzip {} \; 2>/dev/null
    find "$REPO_PATH/logs" -name "*.log.gz" -mtime +7 -delete 2>/dev/null
    find "$REPO_PATH/logs" -name "*.log" -empty -delete 2>/dev/null
}

cleanup() {
    log_info "Shutting down auto_sync..."
    cd "$REPO_PATH" || exit 0
    # PM2 앱은 유지 (배포 서버에서 계속 돌리려면)
    # stop_application  # 스크립트 종료 시 앱도 끄려면 주석 해제
    log_success "Auto sync stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

# 메인
main() {
    log_info "WWE Auto Sync Started"
    log_info "Repository: $REPO_PATH"
    log_info "Branch: $BRANCH, interval: ${CHECK_INTERVAL}s"

    if [ ! -d "$REPO_PATH/.git" ]; then
        log_error "Not a Git repository: $REPO_PATH"
        exit 1
    fi

    if ! command -v pm2 > /dev/null 2>&1; then
        log_error "PM2 not found. Install: npm install -g pm2"
        exit 1
    fi

    # 최초 1회 시작
    start_application || exit 1

    COUNT=0
    while true; do
        sync_repository
        health_check
        COUNT=$((COUNT + 1))
        [ $((COUNT % 10)) -eq 0 ] && cleanup_logs
        sleep "$CHECK_INTERVAL"
    done
}

main "$@"
