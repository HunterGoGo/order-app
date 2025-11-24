# API 연결 문제 해결 가이드

## 'Not Found' 오류 원인

### 문제 분석
프런트엔드에서 `fetchMenus()`를 호출할 때 `Not Found` 오류가 발생하는 경우:

1. **API URL 설정 오류**
   - `VITE_API_URL` 환경 변수가 올바르게 설정되지 않음
   - API URL에 `/api` 경로가 누락됨

2. **백엔드 서버 미실행**
   - 백엔드 서버가 배포되지 않았거나 실행되지 않음

3. **경로 불일치**
   - 프런트엔드가 요청하는 경로와 백엔드 라우트가 일치하지 않음

## 해결 방법

### 1. 환경 변수 확인

Render.com 프런트엔드 Static Site의 Environment Variables 확인:

**올바른 설정:**
```
Key: VITE_API_URL
Value: https://order-app-server.onrender.com/api
```
⚠️ **중요**: URL 끝에 `/api`가 포함되어야 합니다!

**잘못된 설정:**
```
VITE_API_URL=https://order-app-server.onrender.com  ❌ (끝에 /api 없음)
```

### 2. API URL 확인 방법

브라우저 개발자 도구에서 확인:
1. F12 → Console 탭
2. 다음 코드 실행:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

또는 Network 탭에서:
- 실패한 요청 클릭
- Request URL 확인
- 올바른 형식: `https://order-app-server.onrender.com/api/menus`

### 3. 백엔드 서버 확인

1. **백엔드 서버 URL 직접 접속**
   - `https://order-app-server.onrender.com` 접속
   - JSON 응답이 오는지 확인

2. **API 엔드포인트 직접 테스트**
   - `https://order-app-server.onrender.com/api/menus` 접속
   - 메뉴 목록 JSON이 표시되는지 확인

3. **Render.com 로그 확인**
   - 백엔드 서비스 → Logs 탭
   - API 요청이 들어오는지 확인
   - 에러 메시지 확인

## 코드 수정 (필요한 경우)

만약 환경 변수에 `/api`를 포함하지 않으려면:

`ui/src/services/api.js` 수정:
```javascript
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';
```

하지만 현재 코드는 이미 올바르게 설정되어 있으므로, **환경 변수만 올바르게 설정**하면 됩니다.

## 체크리스트

- [ ] Render.com 프런트엔드 환경 변수에 `VITE_API_URL` 설정됨
- [ ] `VITE_API_URL` 값이 `https://order-app-server.onrender.com/api` 형식임 (끝에 `/api` 포함)
- [ ] 백엔드 서버가 정상 실행 중임
- [ ] `https://order-app-server.onrender.com/api/menus` 직접 접속 시 JSON 응답 확인
- [ ] 브라우저 콘솔에서 실제 요청 URL 확인

