# 프런트엔드 Render.com 배포 가이드

## 배포 전 확인사항

### 1. 코드 확인
- ✅ API URL은 환경 변수로 설정됨 (`VITE_API_URL`)
- ✅ 빌드 스크립트 확인됨 (`npm run build`)
- ✅ 이미지 파일이 `public/images/` 폴더에 있음

### 2. 수정할 부분
현재 코드는 배포 준비가 되어 있습니다. 추가 수정은 필요 없습니다.

## Render.com 배포 과정

### 1단계: GitHub에 코드 푸시
```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "프런트엔드 배포 준비"
git push origin main
```

### 2단계: Render.com에서 Static Site 생성

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인

2. **Static Site 생성**
   - **New +** 버튼 클릭
   - **Static Site** 선택

3. **저장소 연결**
   - **Connect account** 또는 **Connect repository** 클릭
   - GitHub 계정 연결 (처음인 경우)
   - 저장소 선택: `order-app` (또는 실제 저장소 이름)

4. **서비스 설정**
   - **Name**: `order-app-ui` (원하는 이름)
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `ui` ⚠️ **중요!**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free (또는 원하는 플랜)

5. **Environment Variables 설정**
   - **Environment Variables** 섹션 클릭
   - **Add Environment Variable** 클릭
   - 다음 변수 추가:
   
   ```
   Key: VITE_API_URL
   Value: https://order-app-server.onrender.com/api
   ```
   > ⚠️ **중요**: 
   > - `order-app-server.onrender.com`을 실제 백엔드 서버 URL로 변경하세요!
   > - URL 끝에 **반드시 `/api`를 포함**해야 합니다!
   > - 예: `https://order-app-server.onrender.com/api`
   > - 백엔드 서버가 배포된 후 생성된 URL을 사용해야 합니다.

6. **Create Static Site** 클릭

### 3단계: 배포 대기 및 확인

1. **배포 진행 확인**
   - 배포 로그를 확인하여 빌드가 성공하는지 확인
   - 첫 배포는 약 3-5분 소요

2. **배포 완료 후**
   - 프런트엔드 URL 확인 (예: `https://order-app-ui.onrender.com`)
   - 브라우저에서 접속하여 정상 작동 확인

## 환경 변수 설정

### 필수 환경 변수
```
VITE_API_URL=https://order-app-server.onrender.com
```

**설명**:
- `VITE_API_URL`: 백엔드 API 서버의 URL
- Vite는 `VITE_` 접두사가 붙은 환경 변수만 클라이언트 코드에서 사용 가능
- 빌드 시점에 이 값이 코드에 포함됨

## 배포 후 확인사항

### 1. 기본 기능 확인
- [ ] 메뉴 목록이 표시되는지 확인
- [ ] 이미지가 정상적으로 로드되는지 확인
- [ ] 장바구니 기능이 작동하는지 확인
- [ ] 주문하기 기능이 작동하는지 확인

### 2. 브라우저 개발자 도구 확인
- **Console 탭**: 에러 메시지 확인
- **Network 탭**: 
  - `/api/menus` 요청이 성공하는지 확인
  - API 요청이 백엔드 서버로 전송되는지 확인

### 3. API 연결 확인
- Network 탭에서 API 요청 URL 확인
- `https://order-app-server.onrender.com/api/menus` 형식이어야 함
- CORS 에러가 없는지 확인

## 문제 해결

### 빌드 실패
- **원인**: 의존성 설치 실패, 빌드 스크립트 오류
- **해결**: 
  - Render.com 대시보드 → Logs 탭에서 에러 확인
  - 로컬에서 `npm run build` 실행하여 오류 확인
  - `package.json`의 빌드 스크립트 확인

### 이미지가 표시되지 않음
- **원인**: 이미지 경로 문제
- **해결**: 
  - 이미지가 `public/images/` 폴더에 있는지 확인
  - 데이터베이스의 `image_url`이 `/images/파일명.jpg` 형식인지 확인

### API 연결 실패 (Not Found 오류)
- **원인**: 
  - `VITE_API_URL` 환경 변수 미설정 또는 잘못된 URL
  - URL 끝에 `/api`가 누락됨
- **해결**:
  - Render.com 대시보드 → Environment Variables 확인
  - `VITE_API_URL`이 `https://order-app-server.onrender.com/api` 형식인지 확인 (끝에 `/api` 포함)
  - 백엔드 서버가 실행 중인지 확인
  - 브라우저 개발자 도구 → Network 탭에서 실제 요청 URL 확인
  - `https://order-app-server.onrender.com/api/menus` 직접 접속하여 테스트

### CORS 에러
- **원인**: 백엔드 서버의 CORS 설정 문제
- **해결**: 백엔드 서버의 CORS 설정 확인 (현재 모든 도메인 허용)

### 404 에러 (페이지 새로고침 시)
- **원인**: SPA 라우팅 문제
- **해결**: 
  - Render.com Static Site는 자동으로 `index.html`로 리다이렉트
  - 문제가 지속되면 `vite.config.js`에 base 경로 설정 확인

## 배포 체크리스트

배포 전:
- [ ] GitHub에 코드 푸시 완료
- [ ] 백엔드 서버가 배포되어 URL 확인됨
- [ ] `VITE_API_URL` 환경 변수에 올바른 백엔드 URL 입력

배포 후:
- [ ] 프런트엔드가 정상적으로 로드됨
- [ ] 메뉴가 표시됨
- [ ] API 요청이 성공함
- [ ] 이미지가 표시됨
- [ ] 주문 기능이 작동함

## 추가 팁

1. **환경 변수 변경 시**
   - Render.com 대시보드에서 환경 변수 수정
   - 자동으로 재배포됨

2. **코드 업데이트 시**
   - GitHub에 푸시하면 자동으로 재배포됨

3. **빌드 최적화**
   - Vite는 자동으로 프로덕션 빌드를 최적화함
   - 추가 설정은 `vite.config.js`에서 가능

4. **커스텀 도메인**
   - 유료 플랜에서 커스텀 도메인 연결 가능

