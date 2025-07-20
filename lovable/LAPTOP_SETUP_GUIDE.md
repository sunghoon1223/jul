# 💻 랩탑 환경 프로젝트 이관 완벽 가이드

## 🎯 목표
데스크탑에서 작업한 E-Commerce MVP Framework를 랩탑 환경으로 완벽하게 이관하여 즉시 작업을 재개할 수 있도록 합니다.

## ⚡ 빠른 시작 (5분 완료)

### 1단계: Git 클론 (1분)
```bash
# 프로젝트 클론
git clone [YOUR_REPOSITORY_URL] ecommerce-project
cd ecommerce-project

# 최신 상태 확인
git status
git log --oneline -5
```

### 2단계: 환경 설정 (2분)
```bash
# Node.js 설치 확인 (18+ 필요)
node --version
npm --version

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 Supabase 키 설정
```

### 3단계: Claude Code 메모리 복원 (2분)
```bash
# Claude Code 설치 확인
claude --version

# 프로젝트 디렉토리에서 Claude Code 시작
claude

# CLAUDE.md 파일이 자동으로 메모리로 로드됨을 확인
```

## 🔧 상세 설정 가이드

### Claude Code 설정

#### 1. Claude Code 설치 (필요시)
```bash
# macOS
brew install claude

# Windows
# Claude 공식 사이트에서 다운로드
```

#### 2. MCP 서버 설정
프로젝트 루트의 `.claude/settings.local.json` 파일이 자동으로 적용됩니다.

**포함된 MCP 서버들:**
- `filesystem` - 파일 시스템 작업
- `shrimp-task-manager` - 작업 관리
- `playwright` - 브라우저 자동화
- `rag-memory-mcp` - RAG 메모리 시스템
- `edit-file-lines` - 파일 편집

### 메모리 시스템 확인

#### 1. CLAUDE.md 메모리 확인
```bash
# 메모리 파일 존재 확인
ls -la CLAUDE.md

# 메모리 내용 확인
head -20 CLAUDE.md
```

#### 2. 프로젝트 컨텍스트 복원
Claude Code에서 다음 명령으로 메모리 상태 확인:
```
프로젝트 현재 상태는?
E-Commerce MVP Framework는 어디에 있어?
```

### 개발 환경 테스트

#### 1. 개발 서버 시작
```bash
npm run dev
```

#### 2. 빌드 테스트
```bash
npm run build
```

#### 3. 프레임워크 확인
```bash
# E-Commerce MVP Framework 구조 확인
ls -la E-Commerce_MVP_Framework/

# 가이드 문서 확인
cat E-Commerce_MVP_Framework/COMPLETE_IMPLEMENTATION_GUIDE.md | head -30
```

## 🎨 E-Commerce MVP Framework 사용법

### 새 프로젝트 생성
```bash
# 프레임워크를 사용한 새 프로젝트 생성
cp -r E-Commerce_MVP_Framework my-new-store
cd my-new-store

# 프로젝트 설정 스크립트 실행
chmod +x tools/scripts/setup-project.sh
./tools/scripts/setup-project.sh new-store-frontend
```

### 기존 프로젝트 계속 작업
```bash
# JP Caster 프로젝트 계속 작업
cd src/
npm run dev

# 관리자 대시보드 접속
open http://localhost:5173/admin
```

## 🚨 문제 해결

### 자주 발생하는 문제들

#### 1. npm 명령어 실행 안됨
```bash
# Node.js 재설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 2. Claude Code 메모리 인식 안됨
```bash
# 프로젝트 루트에서 Claude 재시작
cd /path/to/project
claude

# CLAUDE.md 파일 경로 확인
pwd
ls -la CLAUDE.md
```

#### 3. MCP 서버 연결 실패
```bash
# Claude Code 권한 확인
claude doctor

# .claude/settings.local.json 확인
cat .claude/settings.local.json
```

#### 4. Supabase 연결 실패
```bash
# 환경 변수 확인
cat .env.local

# Supabase 프로젝트 상태 확인 (브라우저에서)
# https://supabase.com/dashboard
```

## 📚 핵심 파일 위치

### 메모리 관련
- `CLAUDE.md` - 프로젝트 메모리 (자동 로드)
- `.claude/settings.local.json` - MCP 설정
- `E-Commerce_MVP_Framework/docs/` - 모든 가이드 문서

### 개발 관련
- `src/` - 현재 작업 중인 소스코드
- `E-Commerce_MVP_Framework/src-template/` - 템플릿 소스
- `E-Commerce_MVP_Framework/config-templates/` - 설정 파일들

### 문서 관련
- `E-Commerce_MVP_Framework/COMPLETE_IMPLEMENTATION_GUIDE.md` - 완전 구현 가이드
- `E-Commerce_MVP_Framework/README.md` - 프레임워크 소개
- `E-Commerce_MVP_Framework/development-flow/` - 단계별 가이드

## ✅ 설정 완료 체크리스트

- [ ] Git 저장소 클론 완료
- [ ] Node.js 18+ 설치 확인
- [ ] npm 의존성 설치 완료
- [ ] .env.local 환경 변수 설정
- [ ] Claude Code 설치 및 실행
- [ ] CLAUDE.md 메모리 로딩 확인
- [ ] MCP 서버들 연결 확인
- [ ] 개발 서버 정상 실행 확인
- [ ] E-Commerce MVP Framework 구조 확인

## 🎉 완료 후 다음 단계

1. **즉시 작업 재개**: Claude Code에서 "현재 프로젝트 상태는?" 질문
2. **고객 요청사항 적용**: 기존 UI/기능 수정
3. **새 기능 개발**: E-Commerce MVP Framework 활용
4. **배포**: `tools/scripts/deploy-to-vercel.sh` 사용

## 🔄 동기화 방법

### 랩탑 → 데스크탑 동기화
```bash
# 작업 완료 후 커밋
git add .
git commit -m "랩탑에서 작업 완료: [작업 내용]"
git push origin main
```

### 데스크탑 → 랩탑 동기화
```bash
# 최신 변경사항 가져오기
git pull origin main
```

이 가이드를 따라하면 **5분 내에** 랩탑에서 프로젝트 작업을 이어갈 수 있습니다! 🚀