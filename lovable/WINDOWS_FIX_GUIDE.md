# Windows 환경 npm 실행 문제 해결 가이드

## 🚨 문제 상황
Windows 명령 프롬프트에서 `npm run dev` 실행 시 다음 오류 발생:
- `'vite'은(는) 내부 또는 외부 명령... 이 아닙니다`
- `Permission denied` 오류들
- `NPM RUN DEV` 대소문자 오류

## 🔧 해결 방법

### 방법 1: PowerShell 관리자 권한 사용 (권장)

1. **PowerShell을 관리자 권한으로 실행**
   - Windows 키 + X → "Windows PowerShell (관리자)" 클릭
   - 또는 시작 메뉴에서 PowerShell 검색 → 우클릭 → "관리자 권한으로 실행"

2. **프로젝트 디렉토리로 이동**
   ```powershell
   cd "C:\MYCLAUDE_PROJECT\jul\lovable"
   ```

3. **준비된 스크립트 실행**
   ```powershell
   .\fix-windows-dev.ps1
   ```

### 방법 2: 수동 명령어 실행

1. **관리자 권한으로 PowerShell 실행**

2. **프로젝트 디렉토리로 이동**
   ```powershell
   cd "C:\MYCLAUDE_PROJECT\jul\lovable"
   ```

3. **완전 삭제 후 재설치**
   ```powershell
   # 강제 삭제 (권한 문제 해결)
   Remove-Item -Path "node_modules" -Recurse -Force
   Remove-Item -Path "package-lock.json" -Force
   
   # 캐시 정리
   npm cache clean --force
   
   # 의존성 재설치
   npm install
   
   # 개발 서버 실행 (소문자로!)
   npm run dev
   ```

### 방법 3: WSL 사용 (대안)

Windows에서 계속 문제가 발생하면 WSL 환경 사용:

1. **WSL 터미널에서 프로젝트 디렉토리로 이동**
   ```bash
   cd /mnt/c/MYCLAUDE_PROJECT/jul/lovable
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

## ⚠️ 주의사항

1. **대소문자 구분**: 반드시 소문자로 입력
   - ✅ `npm run dev`
   - ❌ `NPM RUN DEV`

2. **관리자 권한**: Windows에서는 관리자 권한이 필요할 수 있음

3. **바이러스 백신**: 바이러스 백신 프로그램이 node_modules를 차단할 수 있음

4. **경로 문제**: 공백이 있는 경로는 따옴표로 감싸기

## 🎯 성공 확인

명령어가 성공하면 다음과 같은 메시지가 나타납니다:
```
VITE v5.4.19  ready in 1503 ms

➜  Local:   http://localhost:5173/
➜  Network: http://10.255.255.254:5173/
```

## 🔍 추가 문제 해결

### 포트 충돌 문제
```powershell
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :5173

# 프로세스 종료 (PID 확인 후)
taskkill /PID <PID번호> /F
```

### 환경 변수 문제
```powershell
# Node.js 버전 확인
node --version
npm --version

# PATH 환경 변수 확인
echo $env:PATH
```

이 가이드를 따라하면 Windows 환경에서도 정상적으로 개발 서버를 실행할 수 있습니다!