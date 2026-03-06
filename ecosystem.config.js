// PM2 설정 파일 (이 파일이 있는 디렉터리가 프로젝트 루트)
const path = require('path')

module.exports = {
  apps: [
    {
      name: 'wwe-nextjs',
      script: 'npm',
      args: 'start',
      cwd: path.resolve(__dirname),
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // 자동 재시작 설정
      watch: false,
      max_memory_restart: '1G',
      // 로그 설정
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 재시작 설정
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
}
