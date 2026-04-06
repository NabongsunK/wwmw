#!/bin/bash
# 이름으로 찾기 쉽게: auto_sync.sh 를 nohup 백그라운드로 실행
# 실제 로직은 start_auto_sync_background.sh 와 동일

exec "$(cd "$(dirname "$0")" && pwd)/start_auto_sync_background.sh" "$@"
