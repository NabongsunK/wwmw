// PM2 설정 파일
module.exports = {
  apps: [
    {
      name: 'wwe-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/wwe', // 실제 경로로 변경 필요
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
