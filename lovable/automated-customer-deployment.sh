#!/bin/bash

# 고객별 자동 배포 시스템
# 사용법: ./automated-customer-deployment.sh [customer-config.json]

set -e

CUSTOMER_CONFIG=${1:-"customer-config.json"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== JPCaster 고객별 자동 배포 시스템 ==="
echo "설정 파일: $CUSTOMER_CONFIG"
echo "배포 시간: $TIMESTAMP"
echo

# 1. 고객 설정 로드
if [ ! -f "$CUSTOMER_CONFIG" ]; then
    echo "❌ 고객 설정 파일을 찾을 수 없습니다: $CUSTOMER_CONFIG"
    exit 1
fi

# JSON에서 값 추출 (jq 필요)
CUSTOMER_NAME=$(jq -r '.companyName' "$CUSTOMER_CONFIG")
DOMAIN=$(jq -r '.domain' "$CUSTOMER_CONFIG")
PRIMARY_COLOR=$(jq -r '.branding.primaryColor' "$CUSTOMER_CONFIG")
LOGO_URL=$(jq -r '.branding.logoUrl' "$CUSTOMER_CONFIG")
SUPABASE_URL=$(jq -r '.supabase.url' "$CUSTOMER_CONFIG")
SUPABASE_KEY=$(jq -r '.supabase.anonKey' "$CUSTOMER_CONFIG")

echo "🏢 고객사: $CUSTOMER_NAME"
echo "🌐 도메인: $DOMAIN"
echo "🎨 메인 컬러: $PRIMARY_COLOR"
echo

# 2. 작업 디렉토리 생성
WORK_DIR="deployments/${DOMAIN}_${TIMESTAMP}"
mkdir -p "$WORK_DIR"
echo "📁 작업 디렉토리 생성: $WORK_DIR"

# 3. 소스 코드 복사
echo "📋 소스 코드 복사 중..."
cp -r src/ "$WORK_DIR/"
cp -r public/ "$WORK_DIR/"
cp package.json "$WORK_DIR/"
cp vite.config.ts "$WORK_DIR/"
cp tailwind.config.ts "$WORK_DIR/"
cp tsconfig.json "$WORK_DIR/"
cp index.html "$WORK_DIR/"

# 4. 고객별 환경 변수 생성
echo "⚙️ 환경 변수 설정 중..."
cat > "$WORK_DIR/.env" << EOF
# ${CUSTOMER_NAME} Environment Configuration
VITE_SITE_NAME="${CUSTOMER_NAME}"
VITE_PRIMARY_COLOR="${PRIMARY_COLOR}"
VITE_LOGO_URL="${LOGO_URL}"

# Supabase Configuration  
VITE_SUPABASE_URL="${SUPABASE_URL}"
VITE_SUPABASE_ANON_KEY="${SUPABASE_KEY}"

# Build Configuration
NODE_ENV=production
VITE_APP_URL="https://${DOMAIN}"
EOF

# 5. 고객별 브랜딩 적용
echo "🎨 브랜딩 적용 중..."
if [ -f "customer-assets/${DOMAIN}/logo.png" ]; then
    cp "customer-assets/${DOMAIN}/logo.png" "$WORK_DIR/public/assets/"
    echo "✅ 로고 파일 적용됨"
fi

# 6. Tailwind 설정 커스터마이징
echo "🎨 Tailwind CSS 커스터마이징..."
cat > "$WORK_DIR/tailwind.config.ts" << EOF
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${PRIMARY_COLOR}",
        secondary: "$(jq -r '.branding.secondaryColor' "$CUSTOMER_CONFIG")",
      },
      fontFamily: {
        sans: ["$(jq -r '.branding.fontFamily' "$CUSTOMER_CONFIG")", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
EOF

# 7. 의존성 설치 및 빌드
echo "📦 의존성 설치 중..."
cd "$WORK_DIR"
npm install --silent

echo "🔨 프로덕션 빌드 실행 중..."
npm run build

# 8. 배포 패키지 생성
echo "📦 배포 패키지 생성 중..."
cd dist
PACKAGE_NAME="${DOMAIN}_${TIMESTAMP}.tar.gz"
tar -czf "../$PACKAGE_NAME" .
cd ..

echo "✅ 배포 패키지 생성 완료: $PACKAGE_NAME"

# 9. FTP 업로드 (설정 파일에 FTP 정보가 있는 경우)
if jq -e '.ftp' "$CUSTOMER_CONFIG" > /dev/null; then
    echo "🚀 FTP 업로드 시작..."
    
    FTP_HOST=$(jq -r '.ftp.host' "$CUSTOMER_CONFIG")
    FTP_USER=$(jq -r '.ftp.username' "$CUSTOMER_CONFIG") 
    FTP_PASS=$(jq -r '.ftp.password' "$CUSTOMER_CONFIG")
    FTP_PATH=$(jq -r '.ftp.path' "$CUSTOMER_CONFIG")
    
    # 업로드 실행
    curl -T "$PACKAGE_NAME" "ftp://${FTP_HOST}${FTP_PATH}/" --user "${FTP_USER}:${FTP_PASS}"
    
    echo "✅ FTP 업로드 완료: https://${DOMAIN}"
else
    echo "ℹ️  FTP 설정이 없습니다. 수동 업로드가 필요합니다."
fi

# 10. 배포 완료 보고서 생성
echo "📊 배포 보고서 생성 중..."
cat > "deployment_report_${DOMAIN}_${TIMESTAMP}.txt" << EOF
=== JPCaster 고객 배포 보고서 ===

고객사: ${CUSTOMER_NAME}
도메인: ${DOMAIN}
배포 시간: ${TIMESTAMP}
패키지 파일: ${PACKAGE_NAME}

✅ 배포 완료 URL:
- 메인 사이트: https://${DOMAIN}
- 관리자: https://${DOMAIN}/admin

🔧 적용된 설정:
- 메인 컬러: ${PRIMARY_COLOR}
- 로고: ${LOGO_URL}
- Supabase URL: ${SUPABASE_URL}

📁 배포 파일들:
$(ls -la dist/)

EOF

echo
echo "🎉 배포 완료!"
echo "📊 보고서: deployment_report_${DOMAIN}_${TIMESTAMP}.txt"
echo "🌐 사이트 URL: https://${DOMAIN}"
echo