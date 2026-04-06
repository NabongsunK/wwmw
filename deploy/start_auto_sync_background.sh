#!/bin/bash
# auto_sync.sh 를 nohup으로 백그라운드 실행 (SSH 끊어도 유지)
# 사용: 프로젝트 아무 곳에서나 ./deploy/start_auto_sync_background.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_PATH="$(cd "$SCRIPT_DIR/.." && pwd)"
AUTO_SYNC="$SCRIPT_DIR/auto_sync.sh"
PID_FILE="$REPO_PATH/logs/auto_sync.pid"
LOG_OUT="$REPO_PATH/logs/auto_sync_bg.out"

mkdir -p "$REPO_PATH/logs"

if [ ! -f "$AUTO_SYNC" ]; then
  echo "오류: $AUTO_SYNC 없음"
  exit 1
fi

if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "이미 실행 중입니다 (PID $OLD_PID). 중지: ./deploy/stop_auto_sync_background.sh"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

chmod +x "$AUTO_SYNC" 2>/dev/null || true

# stdout/stderr → auto_sync_bg.out (스크립트 내부 logs/auto_sync.log 와 별도)
nohup bash "$AUTO_SYNC" >> "$LOG_OUT" 2>&1 &
echo $! > "$PID_FILE"

echo "백그라운드 시작됨 (PID $(cat "$PID_FILE"))"
echo "  셸 출력 로그: $LOG_OUT"
echo "  스크립트 로그: $REPO_PATH/logs/auto_sync.log"
echo "  중지: $SCRIPT_DIR/stop_auto_sync_background.sh"
