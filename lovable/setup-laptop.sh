#!/bin/bash

# 🚀 랩탑 환경 자동 설정 스크립트
# E-Commerce MVP Framework 프로젝트 이관용

set -e

echo "💻 랩탑 환경 자동 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_step() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. 환경 확인
print_step "1단계: 환경 확인 중..."

# Node.js 확인
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js 설치됨: $NODE_VERSION"
    
    # 버전 확인 (18 이상 필요)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_warning "Node.js 18+ 권장. 현재: $NODE_VERSION"
    fi
else
    print_error "Node.js가 설치되지 않았습니다."
    echo "다음 명령으로 설치하세요:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "nvm install 18"
    exit 1
fi

# npm 확인
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_success "npm 설치됨: $NPM_VERSION"
else
    print_error "npm이 설치되지 않았습니다."
    exit 1
fi

# Git 확인
if command -v git >/dev/null 2>&1; then
    print_success "Git 설치 확인됨"
else
    print_error "Git이 설치되지 않았습니다."
    exit 1
fi

# 2. 프로젝트 구조 확인
print_step "2단계: 프로젝트 구조 확인 중..."

# 현재 디렉토리가 프로젝트 루트인지 확인
if [ -f "package.json" ] && [ -f "CLAUDE.md" ]; then
    print_success "프로젝트 루트 디렉토리 확인됨"
else
    print_error "프로젝트 루트 디렉토리가 아닙니다."
    echo "CLAUDE.md와 package.json이 있는 디렉토리에서 실행하세요."
    exit 1
fi

# E-Commerce MVP Framework 확인
if [ -d "E-Commerce_MVP_Framework" ]; then
    print_success "E-Commerce MVP Framework 확인됨"
else
    print_warning "E-Commerce MVP Framework가 없습니다. 일부 기능이 제한될 수 있습니다."
fi

# 3. 의존성 설치
print_step "3단계: 의존성 설치 중..."

if [ -f "package-lock.json" ]; then
    npm ci
    print_success "의존성 설치 완료 (ci 사용)"
else
    npm install
    print_success "의존성 설치 완료 (install 사용)"
fi

# 4. 환경 변수 설정
print_step "4단계: 환경 변수 설정 중..."

if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success ".env.local 파일 생성됨"
        print_warning "Supabase 키를 .env.local에 설정해주세요!"
    else
        print_warning ".env.example 파일이 없습니다."
    fi
else
    print_success ".env.local 파일이 이미 존재합니다"
fi

# 5. Claude Code 확인
print_step "5단계: Claude Code 환경 확인 중..."

if command -v claude >/dev/null 2>&1; then
    CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "unknown")
    print_success "Claude Code 설치됨: $CLAUDE_VERSION"
else
    print_warning "Claude Code가 설치되지 않았습니다."
    echo "https://claude.ai/code 에서 다운로드하세요."
fi

# Claude 설정 파일 확인
if [ -d ".claude" ]; then
    print_success "Claude 설정 디렉토리 확인됨"
    
    if [ -f ".claude/settings.local.json" ]; then
        print_success "MCP 설정 파일 확인됨"
    else
        print_warning "MCP 설정 파일이 없습니다."
    fi
else
    print_warning "Claude 설정 디렉토리가 없습니다."
fi

# 6. 빌드 테스트
print_step "6단계: 빌드 테스트 중..."

if npm run build >/dev/null 2>&1; then
    print_success "빌드 테스트 성공"
else
    print_warning "빌드 테스트 실패. 수동으로 확인이 필요합니다."
fi

# 7. 권한 설정
print_step "7단계: 스크립트 권한 설정 중..."

# E-Commerce MVP Framework 스크립트들 권한 설정
if [ -d "E-Commerce_MVP_Framework/tools/scripts" ]; then
    chmod +x E-Commerce_MVP_Framework/tools/scripts/*.sh
    print_success "프레임워크 스크립트 권한 설정 완료"
fi

# 기타 스크립트 권한 설정
if [ -f "setup-laptop.sh" ]; then
    chmod +x setup-laptop.sh
fi

# 8. 메모리 파일 확인
print_step "8단계: 메모리 시스템 확인 중..."

if [ -f "CLAUDE.md" ]; then
    LINES=$(wc -l < CLAUDE.md)
    print_success "CLAUDE.md 메모리 파일 확인됨 ($LINES 줄)"
    
    # 최신 업데이트 확인
    if grep -q "E-Commerce MVP Framework 완성" CLAUDE.md; then
        print_success "최신 프레임워크 정보 포함됨"
    else
        print_warning "메모리 파일이 구버전일 수 있습니다."
    fi
else
    print_error "CLAUDE.md 메모리 파일이 없습니다!"
fi

# 완료 메시지
echo ""
echo "🎉 랩탑 환경 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. .env.local 파일에 Supabase 키 설정"
echo "2. Claude Code 실행: claude"
echo "3. 개발 서버 시작: npm run dev"
echo ""
echo "📚 유용한 명령어:"
echo "- npm run dev          # 개발 서버 시작"
echo "- npm run build        # 프로덕션 빌드"
echo "- claude               # Claude Code 시작"
echo ""
echo "📖 문서 참조:"
echo "- LAPTOP_SETUP_GUIDE.md                               # 상세 설정 가이드"
echo "- E-Commerce_MVP_Framework/COMPLETE_IMPLEMENTATION_GUIDE.md  # 완전 구현 가이드"
echo ""
print_success "설정 완료! 즐거운 개발 되세요! 🚀"