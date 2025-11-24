# 커피 주문 앱 백엔드 서버

Express.js를 사용한 RESTful API 서버입니다.

## 설치

```bash
npm install
```

## 환경 설정

`.env` 파일이 이미 생성되어 있습니다. 필요에 따라 환경 변수를 수정하세요.

### 데이터베이스 설정

`.env` 파일에 다음 데이터베이스 설정을 추가하거나 수정하세요:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_app
DB_USER=postgres
DB_PASSWORD=your_password
```

### 데이터베이스 초기화

프로젝트를 처음 시작할 때 다음 순서로 데이터베이스를 설정하세요:

1. 데이터베이스 생성:
```bash
node scripts/init-db.js
```

2. 테이블 생성:
```bash
node scripts/create-tables.js
```

3. 초기 데이터 삽입 (선택사항):
```bash
node scripts/seed-data.js
```

이 스크립트는 `order_app` 데이터베이스를 생성하고, 필요한 테이블을 생성하며, 샘플 메뉴 데이터를 삽입합니다.

## 실행

### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

## API 엔드포인트

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회

### 주문 관련
- `POST /api/orders` - 주문 생성
- `GET /api/orders/:orderId` - 주문 정보 조회

### 관리자 관련
- `GET /api/admin/dashboard` - 대시보드 통계 조회
- `GET /api/admin/orders` - 주문 목록 조회
- `PUT /api/admin/orders/:orderId/status` - 주문 상태 업데이트
- `POST /api/admin/orders/:orderId/complete` - 주문 완료 처리
- `GET /api/admin/inventory` - 재고 조회
- `PUT /api/admin/inventory/:menuId` - 재고 업데이트

## 프로젝트 구조

```
server/
├── index.js          # 메인 서버 파일
├── config/           # 설정 파일
│   └── db.js         # 데이터베이스 연결 설정
├── scripts/          # 유틸리티 스크립트
│   └── init-db.js    # 데이터베이스 초기화 스크립트
├── routes/           # API 라우트 (추후 생성)
├── controllers/      # 컨트롤러 (추후 생성)
├── models/          # 데이터 모델 (추후 생성)
├── middleware/      # 미들웨어 (추후 생성)
├── utils/           # 유틸리티 함수 (추후 생성)
├── .env             # 환경 변수 (gitignore)
└── package.json     # 패키지 설정
```

