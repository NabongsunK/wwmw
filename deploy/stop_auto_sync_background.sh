#!/bin/bash
# start_auto_sync_background.sh 로 띄운 auto_sync 프로세스 종료

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_PATH="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$REPO_PATH/logs/auto_sync.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "PID 파일 없음 ($PID_FILE). 이미 중지됐거나 수동 실행 중일 수 있습니다."
  exit 0
fi

PID=$(cat "$PID_FILE")
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "종료 신호 전송 (PID $PID)"
else
  echo "프로세스 없음 (PID $PID). PID 파일만 삭제합니다."
fi
rm -f "$PID_FILE"
