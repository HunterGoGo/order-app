# Node.js 업그레이드 가이드

## 현재 Node.js 버전 확인

```bash
node --version
npm --version
```

## Windows에서 Node.js 업그레이드 방법

### 방법 1: 공식 웹사이트에서 설치 (권장)

1. **Node.js 공식 웹사이트 접속**
   - https://nodejs.org 접속
   - **LTS (Long Term Support)** 버전 다운로드 (권장)
   - 최신 버전: Node.js 20.x LTS 또는 22.x LTS

2. **설치 프로그램 실행**
   - 다운로드한 `.msi` 파일 실행
   - 설치 마법사 따라하기
   - 기존 버전을 자동으로 업그레이드

3. **설치 확인**
   ```bash
   node --version
   npm --version
   ```

### 방법 2: nvm-windows 사용 (여러 버전 관리)

1. **nvm-windows 설치**
   - https://github.com/coreybutler/nvm-windows/releases 접속
   - `nvm-setup.exe` 다운로드 및 설치

2. **최신 LTS 버전 설치**
   ```bash
   nvm install lts
   nvm use lts
   ```

3. **특정 버전 설치**
   ```bash
   nvm install 20.18.0
   nvm use 20.18.0
   ```

### 방법 3: Chocolatey 사용 (패키지 매니저)

```bash
choco upgrade nodejs
```

## 프로젝트 권장 Node.js 버전

프로젝트의 `package.json`에 `engines` 필드를 추가하여 권장 버전을 명시할 수 있습니다.

### 권장 버전
- **최소**: Node.js 18.x 이상
- **권장**: Node.js 20.x LTS
- **최신**: Node.js 22.x LTS

## 업그레이드 후 확인사항

1. **의존성 재설치**
   ```bash
   # 서버
   cd server
   rm -rf node_modules package-lock.json
   npm install
   
   # 프런트엔드
   cd ui
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **프로젝트 실행 테스트**
   ```bash
   # 서버
   cd server
   npm run dev
   
   # 프런트엔드
   cd ui
   npm run dev
   ```

## 주의사항

1. **의존성 호환성**
   - Node.js 버전 업그레이드 시 일부 패키지가 호환되지 않을 수 있음
   - `npm install` 후 에러가 발생하면 패키지 업데이트 필요

2. **Render.com 배포**
   - Render.com은 자동으로 Node.js 버전을 감지
   - `package.json`에 `engines` 필드를 추가하면 특정 버전 지정 가능

3. **로컬 개발 환경**
   - 팀원들과 동일한 Node.js 버전 사용 권장
   - `.nvmrc` 파일로 버전 고정 가능

