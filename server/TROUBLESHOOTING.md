# Render PostgreSQL 연결 문제 해결 가이드

## 일반적인 연결 실패 원인

### 1. SSL 연결 문제
Render.com의 PostgreSQL은 **항상 SSL 연결이 필요**합니다.

**증상:**
- `read ECONNRESET`
- `SSL connection required`
- `Connection terminated unexpectedly`

**해결 방법:**
- 모든 연결에 `ssl: { rejectUnauthorized: false }` 설정 필요

### 2. 환경 변수 설정 오류

**확인 사항:**
- `DATABASE_URL` 또는 개별 변수(`DB_HOST`, `DB_PORT` 등)가 올바르게 설정되었는지
- Internal Database URL을 사용하는지 (External이 아님!)
- 환경 변수 이름의 대소문자 확인

### 3. 데이터베이스 URL 형식 문제

**올바른 형식:**
```
postgres://user:password@hostname:5432/database_name
```

**잘못된 형식:**
- 프로토콜 누락
- 포트 번호 누락
- 특수 문자 인코딩 문제

## 연결 테스트 방법

### 방법 1: 간단한 연결 테스트 스크립트

`server/scripts/test-connection.js` 파일을 생성하여 실행:

```bash
cd server
node scripts/test-connection.js
```

### 방법 2: 환경 변수 확인

```bash
cd server
# Windows PowerShell
$env:DB_HOST
$env:DB_PORT
$env:DB_NAME
$env:DB_USER
$env:DATABASE_URL

# 또는 .env 파일 확인 (민감한 정보이므로 주의)
```

## 문제 해결 체크리스트

- [ ] SSL 설정이 모든 연결에 적용되었는지 확인
- [ ] Internal Database URL을 사용하는지 확인 (External 아님)
- [ ] 환경 변수가 올바르게 설정되었는지 확인
- [ ] 데이터베이스가 생성되었는지 확인
- [ ] 방화벽/네트워크 문제는 아닌지 확인
- [ ] 비밀번호에 특수 문자가 있는 경우 URL 인코딩 확인

## Render.com 특정 문제

### Internal vs External URL
- **Internal Database URL**: Render 내부 서비스 간 연결용 (백엔드 서버에서 사용)
- **External Database URL**: 로컬 컴퓨터에서 접근용

**중요**: 백엔드 서버는 반드시 **Internal Database URL**을 사용해야 합니다!

### SSL 요구사항
Render.com의 PostgreSQL은 항상 SSL 연결을 요구합니다.
개발 환경에서도 SSL을 활성화해야 할 수 있습니다.

