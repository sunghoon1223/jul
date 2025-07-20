#!/bin/bash

# 🔍 환경 검증 스크립트
# 모든 메모리 시스템과 개발 환경이 정상 작동하는지 확인

set -e

echo "🔍 환경 검증을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_check() {
    echo -e "${BLUE}[CHECK] $1${NC}"
}

print_pass() {
    echo -e "${GREEN}[PASS] $1${NC}"
}

print_fail() {
    echo -e "${RED}[FAIL] $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

TOTAL_CHECKS=0
PASSED_CHECKS=0

check_item() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if eval "$2"; then
        print_pass "$1"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        print_fail "$1"
        return 1
    fi
}

# 1. 기본 환경 확인
echo ""
print_check "=== 기본 환경 확인 ==="

check_item "Node.js 18+ 설치됨" "node --version | grep -E 'v(1[8-9]|[2-9][0-9])\.'"
check_item "npm 설치됨" "command -v npm >/dev/null 2>&1"
check_item "Git 설치됨" "command -v git >/dev/null 2>&1"

# 2. 프로젝트 구조 확인
echo ""
print_check "=== 프로젝트 구조 확인 ==="

check_item "package.json 존재" "[ -f package.json ]"
check_item "CLAUDE.md 메모리 파일 존재" "[ -f CLAUDE.md ]"
check_item "E-Commerce MVP Framework 존재" "[ -d E-Commerce_MVP_Framework ]"
check_item "소스 코드 디렉토리 존재" "[ -d src ]"
check_item "node_modules 설치됨" "[ -d node_modules ]"

# 3. 설정 파일 확인
echo ""
print_check "=== 설정 파일 확인 ==="

check_item ".env.local 환경 변수 파일 존재" "[ -f .env.local ]"
check_item "vite.config.ts 설정 파일 존재" "[ -f vite.config.ts ]"
check_item "tailwind.config.ts 설정 파일 존재" "[ -f tailwind.config.ts ]"
check_item "tsconfig.json 타입스크립트 설정 존재" "[ -f tsconfig.json ]"

# 4. Claude Code 환경 확인
echo ""
print_check "=== Claude Code 환경 확인 ==="

check_item "Claude Code 설치됨" "command -v claude >/dev/null 2>&1"
check_item "Claude 설정 디렉토리 존재" "[ -d .claude ]"
check_item "MCP 설정 파일 존재" "[ -f .claude/settings.local.json ]"

# 5. 메모리 시스템 확인
echo ""
print_check "=== 메모리 시스템 확인 ==="

check_item "CLAUDE.md에 최신 정보 포함" "grep -q 'E-Commerce MVP Framework 완성' CLAUDE.md"
check_item "프레임워크 가이드 존재" "[ -f E-Commerce_MVP_Framework/COMPLETE_IMPLEMENTATION_GUIDE.md ]"
check_item "개발 플로우 가이드 존재" "[ -f E-Commerce_MVP_Framework/development-flow/01_supabase_setup_complete.md ]"

# 6. 소스 템플릿 확인
echo ""
print_check "=== 소스 템플릿 확인 ==="

check_item "React 소스 템플릿 존재" "[ -d E-Commerce_MVP_Framework/src-template ]"
check_item "API 템플릿 존재" "[ -d E-Commerce_MVP_Framework/api-template ]"
check_item "설정 템플릿 존재" "[ -d E-Commerce_MVP_Framework/config-templates ]"
check_item "자동화 도구 존재" "[ -d E-Commerce_MVP_Framework/tools ]"

# 7. 핵심 파일 확인
echo ""
print_check "=== 핵심 파일 확인 ==="

check_item "인증 훅 존재" "[ -f src/hooks/useAuth.ts ]"
check_item "장바구니 서비스 존재" "[ -f src/services/cartService.ts ] || [ -f src/hooks/useCart.ts ]"
check_item "Supabase 클라이언트 존재" "[ -f src/integrations/supabase/client.ts ] || [ -f src/lib/supabase.ts ]"

# 8. 빌드 테스트
echo ""
print_check "=== 빌드 테스트 ==="

print_check "프로젝트 빌드 테스트 중..."
if npm run build >/dev/null 2>&1; then
    print_pass "빌드 테스트 성공"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_fail "빌드 테스트 실패"
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# 9. 환경 변수 확인
echo ""
print_check "=== 환경 변수 확인 ==="

if [ -f .env.local ]; then
    if grep -q "VITE_SUPABASE_URL" .env.local && grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        print_pass "Supabase 환경 변수 설정됨"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_fail "Supabase 환경 변수 누락"
    fi
else
    print_fail ".env.local 파일 없음"
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# 10. 권한 확인
echo ""
print_check "=== 스크립트 권한 확인 ==="

check_item "랩탑 설정 스크립트 실행 가능" "[ -x setup-laptop.sh ]"
if [ -d "E-Commerce_MVP_Framework/tools/scripts" ]; then
    check_item "프레임워크 스크립트들 실행 가능" "[ -x E-Commerce_MVP_Framework/tools/scripts/setup-project.sh ]"
fi

# 결과 출력
echo ""
echo "================================================"
echo "🎯 검증 결과 요약"
echo "================================================"
echo "총 검사 항목: $TOTAL_CHECKS"
echo "통과 항목: $PASSED_CHECKS"
echo "실패 항목: $((TOTAL_CHECKS - PASSED_CHECKS))"

PASS_RATE=$(echo "scale=1; $PASSED_CHECKS * 100 / $TOTAL_CHECKS" | bc)
echo "통과율: ${PASS_RATE}%"

echo ""
if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    print_pass "🎉 모든 검사를 통과했습니다! 개발 환경이 완벽하게 설정되었습니다."
    echo ""
    echo "다음 단계:"
    echo "1. Claude Code 시작: claude"
    echo "2. 개발 서버 시작: npm run dev"
    echo "3. 브라우저에서 http://localhost:5173 접속"
elif [ $PASS_RATE -gt 80 ]; then
    print_warn "⚠️  대부분의 검사를 통과했습니다. 몇 가지 항목을 확인하세요."
    echo ""
    echo "주요 확인 사항:"
    echo "- .env.local에 Supabase 키 설정"
    echo "- Claude Code 설치 및 설정"
else
    print_fail "❌ 여러 항목에서 문제가 발견되었습니다."
    echo ""
    echo "문제 해결:"
    echo "1. LAPTOP_SETUP_GUIDE.md 참조"
    echo "2. ./setup-laptop.sh 재실행"
    echo "3. 수동으로 누락된 항목들 설정"
fi

echo ""
echo "📚 도움말:"
echo "- 상세 가이드: LAPTOP_SETUP_GUIDE.md"
echo "- 완전 구현 가이드: E-Commerce_MVP_Framework/COMPLETE_IMPLEMENTATION_GUIDE.md"
echo "- 문제 해결: E-Commerce_MVP_Framework/docs/DEBUGGING_GUIDE.md"

exit 0