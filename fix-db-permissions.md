# MySQL 권한 문제 해결 가이드

## 문제
`Access denied for user 'wwe_user'@'%' to database 'wwe_db'`

## 해결 방법

### 방법 1: Docker 컨테이너에서 직접 권한 부여 (권장)

```powershell
# 1. MySQL 컨테이너에 root로 접속
docker exec -it wwe-mysql mysql -uroot -prootpassword

# 2. MySQL 프롬프트에서 다음 명령어 실행:
CREATE DATABASE IF NOT EXISTS wwe_db;
GRANT ALL PRIVILEGES ON wwe_db.* TO 'wwe_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 방법 2: 한 줄로 실행

```powershell
docker exec -i wwe-mysql mysql -uroot -prootpassword -e "CREATE DATABASE IF NOT EXISTS wwe_db; GRANT ALL PRIVILEGES ON wwe_db.* TO 'wwe_user'@'%'; FLUSH PRIVILEGES;"
```

### 방법 3: 환경 변수 확인 및 수정

`.env.local` 파일에서 데이터베이스 이름이 `wwe_db`로 설정되어 있는지 확인:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=wwe_user
MYSQL_PASSWORD=wwe_password
MYSQL_DATABASE=wwe_db  # 또는 z (Dockerfile에 설정된 이름)
```

### 방법 4: Dockerfile 수정 후 재빌드

`deploy/Dockerfile`을 수정하여 `wwe_db` 데이터베이스를 생성하도록 변경:

```dockerfile
ENV MYSQL_DATABASE=wwe_db
```

그 다음 컨테이너 재빌드:
```powershell
docker stop wwe-mysql
docker rm wwe-mysql
cd deploy
docker build -t wwe-mysql .
docker run -d -p 3306:3306 --name wwe-mysql wwe-mysql
```
