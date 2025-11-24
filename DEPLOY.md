# Render.com 배포 가이드 (YAML 없이)

이 가이드는 Render.com 웹 인터페이스를 사용하여 YAML 파일 없이 배포하는 방법을 설명합니다.

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 생성

1. Render.com 대시보드에 로그인 (https://dashboard.render.com)
2. **New +** 버튼 클릭 → **PostgreSQL** 선택
3. 다음 정보 입력:
   - **Name**: `order-app-db`
   - **Database**: `order_app`
   - **User**: `order_app_user` (또는 기본값 사용)
   - **Region**: 가장 가까운 지역 선택 (예: Singapore, Oregon 등)
   - **PostgreSQL Version**: 최신 버전 선택
   - **Plan**: Free (또는 원하는 플랜)
4. **Create Database** 버튼 클릭
5. 데이터베이스 생성 완료 후:
   - **Connections** 탭 클릭
   - **Internal Database URL** 복사 (백엔드 서버에서 사용)
   - **External Database URL** 복사 (로컬에서 초기화 시 사용)
   - **Password** 확인 (나중에 필요)

### 2단계: 데이터베이스 초기화 (로컬에서 실행)

로컬 컴퓨터에서 데이터베이스를 초기화합니다:

```bash
cd server

# 방법 1: External Database URL 사용
# .env 파일에 다음 내용 추가:
# DB_HOST=<External Database URL의 호스트>
# DB_PORT=5432
# DB_NAME=order_app
# DB_USER=<External Database URL의 사용자명>
# DB_PASSWORD=<비밀번호>

# 방법 2: External Database URL 전체 사용 (DATABASE_URL)
# .env 파일에 다음 내용 추가:
# DATABASE_URL=<External Database URL 전체>

# 초기화 스크립트 실행
node scripts/create-tables.js  # 테이블 생성
node scripts/seed-data.js       # 초기 데이터 삽입
```

**참고**: External Database URL 형식 예시
```
postgres://user:password@hostname:5432/database_name
```

### 3단계: 백엔드 서버 배포

1. **GitHub 저장소 준비**
   - 프로젝트를 GitHub에 푸시했는지 확인
   - 저장소가 Public이거나 Render.com에 연결된 Private 저장소여야 함

2. **Render.com에서 Web Service 생성**
   - Render.com 대시보드에서 **New +** → **Web Service** 클릭
   - **Connect account** 또는 **Connect repository** 클릭
   - GitHub 계정 연결 (처음인 경우)
   - 저장소 선택: `order-app` (또는 실제 저장소 이름)

3. **서비스 설정**
   - **Name**: `order-app-server`
   - **Environment**: `Node`
   - **Region**: 데이터베이스와 동일한 지역 선택 (권장)
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `server` ⚠️ **중요!**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (또는 원하는 플랜)

4. **Environment Variables 설정**
   - **Environment Variables** 섹션 클릭
   - 다음 변수들을 하나씩 추가:

   ```
   Key: NODE_ENV
   Value: production
   ```

   ```
   Key: PORT
   Value: 10000
   ```
   > Render.com은 자동으로 PORT 환경 변수를 설정하지만, 명시적으로 설정하는 것이 안전합니다.

   ```
   Key: DB_HOST
   Value: <데이터베이스의 Internal Host>
   ```
   > Internal Database URL에서 호스트 부분만 추출 (예: `dpg-xxxxx-a.singapore-postgres.render.com`)

   ```
   Key: DB_PORT
   Value: 5432
   ```

   ```
   Key: DB_NAME
   Value: order_app
   ```

   ```
   Key: DB_USER
   Value: order_app_user
   ```
   > 실제 데이터베이스 사용자명으로 변경

   ```
   Key: DB_PASSWORD
   Value: <데이터베이스 비밀번호>
   ```
   > 데이터베이스 생성 시 설정한 비밀번호

   **또는 DATABASE_URL 사용 (더 간단):**
   ```
   Key: DATABASE_URL
   Value: <Internal Database URL 전체>
   ```
   > Internal Database URL 전체를 복사하여 붙여넣기

5. **Create Web Service** 클릭
6. 배포 시작 - 첫 배포는 약 5-10분 소요
7. 배포 완료 후 서비스 URL 확인 (예: `https://order-app-server.onrender.com`)

### 4단계: 프런트엔드 배포

1. **API URL 확인**
   - 백엔드 서버가 배포 완료되면 서비스 URL 확인
   - 예: `https://order-app-server.onrender.com`

2. **Render.com에서 Static Site 생성**
   - Render.com 대시보드에서 **New +** → **Static Site** 클릭
   - **Connect repository** 클릭
   - 동일한 GitHub 저장소 선택

3. **Static Site 설정**
   - **Name**: `order-app-ui`
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `ui` ⚠️ **중요!**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. **Environment Variables 설정**
   - **Environment Variables** 섹션 클릭
   - 다음 변수 추가:

   ```
   Key: VITE_API_URL
   Value: https://order-app-server.onrender.com
   ```
   > 실제 백엔드 서버 URL로 변경 (3단계에서 확인한 URL)

5. **Create Static Site** 클릭
6. 배포 시작 - 첫 배포는 약 3-5분 소요
7. 배포 완료 후 프런트엔드 URL 확인

## 환경 변수 설정 요약

### 백엔드 서버 (Web Service)

**방법 1: 개별 변수 사용**
```
NODE_ENV=production
PORT=10000
DB_HOST=<Internal Database Host>
DB_PORT=5432
DB_NAME=order_app
DB_USER=order_app_user
DB_PASSWORD=<비밀번호>
```

**방법 2: DATABASE_URL 사용 (권장)**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=<Internal Database URL 전체>
```

### 프런트엔드 (Static Site)
```
VITE_API_URL=https://order-app-server.onrender.com
```

## 배포 후 확인사항

### 1. 백엔드 서버 확인
- 브라우저에서 `https://order-app-server.onrender.com` 접속
- JSON 응답이 표시되어야 함:
  ```json
  {
    "message": "커피 주문 앱 API 서버",
    "version": "1.0.0",
    "status": "running"
  }
  ```

### 2. API 엔드포인트 확인
- `https://order-app-server.onrender.com/api/menus` 접속
- 메뉴 목록 JSON이 표시되어야 함

### 3. 프런트엔드 확인
- 프런트엔드 URL 접속
- 메뉴가 정상적으로 표시되는지 확인
- 브라우저 개발자 도구 (F12) → Console 탭에서 에러 확인
- Network 탭에서 API 요청이 성공하는지 확인

## 문제 해결

### 백엔드 서버가 시작되지 않는 경우

1. **로그 확인**
   - Render.com 대시보드 → 서비스 선택 → **Logs** 탭
   - 에러 메시지 확인

2. **일반적인 문제들**
   - **Root Directory 오류**: `server`로 설정되어 있는지 확인
   - **환경 변수 오류**: 모든 변수가 올바르게 설정되었는지 확인
   - **데이터베이스 연결 실패**: Internal Database URL 사용 확인
   - **포트 오류**: PORT 환경 변수가 10000으로 설정되었는지 확인

3. **데이터베이스 연결 문제**
   - Internal Database URL 사용 확인 (External이 아님!)
   - SSL 연결이 필요할 수 있음 (코드에서 자동 처리됨)
   - 데이터베이스가 생성되었는지 확인

### 프런트엔드에서 API 호출 실패

1. **CORS 에러**
   - 백엔드 서버의 CORS 설정 확인 (현재 모든 도메인 허용)
   - 브라우저 콘솔에서 정확한 에러 메시지 확인

2. **404 에러**
   - `VITE_API_URL` 환경 변수가 올바른지 확인
   - 백엔드 서버 URL이 정확한지 확인
   - API 경로가 `/api/menus` 형식인지 확인

3. **네트워크 에러**
   - 백엔드 서버가 실행 중인지 확인
   - Render.com 무료 플랜의 경우 15분 비활성 시 sleep 모드
   - 첫 요청 시 깨어나는데 30초~1분 소요

### 데이터베이스 연결 실패

1. **Internal vs External URL**
   - Render 내부 서비스 간 연결: **Internal Database URL** 사용
   - 로컬에서 접근: **External Database URL** 사용
   - 백엔드 서버는 반드시 Internal URL 사용

2. **환경 변수 확인**
   - Render.com 대시보드 → 서비스 → **Environment** 탭
   - 모든 변수가 올바르게 설정되었는지 확인
   - 변수 이름의 대소문자 확인

3. **데이터베이스 초기화 확인**
   - 로컬에서 테이블 생성 및 시드 데이터 삽입 완료했는지 확인
   - Render.com 데이터베이스에 직접 연결하여 확인:
     ```sql
     SELECT * FROM menus;
     ```

## 무료 플랜 제한사항

1. **Sleep 모드**
   - 15분간 요청이 없으면 자동으로 sleep 모드
   - 첫 요청 시 깨어나는데 30초~1분 소요
   - 프로덕션 환경에서는 유료 플랜 사용 권장

2. **리소스 제한**
   - CPU 및 메모리 제한
   - 대용량 트래픽에는 부적합

3. **데이터베이스 제한**
   - 무료 플랜은 90일 후 삭제될 수 있음
   - 프로덕션 환경에서는 유료 플랜 사용 권장

## 추가 팁

1. **환경 변수 관리**
   - 민감한 정보는 Render.com 대시보드에서만 관리
   - `.env` 파일은 Git에 커밋하지 않음

2. **자동 배포**
   - GitHub에 푸시하면 자동으로 재배포됨
   - 특정 브랜치만 자동 배포하도록 설정 가능

3. **커스텀 도메인**
   - 유료 플랜에서 커스텀 도메인 연결 가능

4. **모니터링**
   - Render.com 대시보드에서 로그 및 메트릭 확인
   - 에러 알림 설정 가능

## 배포 체크리스트

배포 전 확인사항:
- [ ] GitHub에 코드 푸시 완료
- [ ] Render.com 계정 생성 및 GitHub 연결
- [ ] PostgreSQL 데이터베이스 생성 완료
- [ ] 데이터베이스 초기화 완료 (테이블 생성, 시드 데이터)
- [ ] 백엔드 서버 배포 설정 완료
- [ ] 환경 변수 모두 설정 완료
- [ ] 프런트엔드 배포 설정 완료
- [ ] VITE_API_URL에 실제 백엔드 URL 입력 완료

배포 후 확인사항:
- [ ] 백엔드 서버가 정상 작동하는지 확인
- [ ] API 엔드포인트가 정상 작동하는지 확인
- [ ] 프런트엔드가 정상 작동하는지 확인
- [ ] 메뉴가 표시되는지 확인
- [ ] 주문 기능이 작동하는지 확인
- [ ] 관리자 기능이 작동하는지 확인
