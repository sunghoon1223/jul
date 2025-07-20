#!/bin/bash

# Studio-sb.com 메인 도메인 배포 스크립트
echo "=== Studio-sb.com 메인 도메인 배포 ==="

# 배포 설정
FTP_HOST="ftp.studio-sb.com"
FTP_USER="u597195020.ssh"
FTP_PASS="Jj2478655!"
REMOTE_PATH="/home/u597195020/domains/studio-sb.com/public_html"

# 1. 빌드 확인
if [ ! -d "dist" ]; then
    echo "❌ dist 폴더가 없습니다. 먼저 빌드를 실행하세요."
    echo "실행: npm run build"
    exit 1
fi

echo "✅ dist 폴더 확인됨"

# 2. 배포 패키지 생성
echo "📦 배포 패키지 생성 중..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="jpcaster-dist-${TIMESTAMP}.tar.gz"

cd dist
tar -czf "../${PACKAGE_NAME}" .
cd ..

echo "✅ 배포 패키지 생성 완료: ${PACKAGE_NAME}"

# 3. FTP 업로드 및 배포
echo "🚀 FTP 업로드 시작..."

# FTP 명령어 스크립트 생성
cat << EOF > ftp_deploy_commands.txt
cd ${REMOTE_PATH}
mkdir backup_${TIMESTAMP}
mput wp-*
mv wp-* backup_${TIMESTAMP}/
mv .htaccess backup_${TIMESTAMP}/ 2>/dev/null || true
put ${PACKAGE_NAME}
!tar -xzf ${PACKAGE_NAME}
delete ${PACKAGE_NAME}
quit
EOF

# FTP 실행
ftp -n ${FTP_HOST} << EOF
user ${FTP_USER} ${FTP_PASS}
$(cat ftp_deploy_commands.txt)
EOF

# 임시 파일 정리
rm -f ftp_deploy_commands.txt
rm -f ${PACKAGE_NAME}

echo "✅ 배포 완료!"
echo "🌐 사이트 URL: https://studio-sb.com"
echo "🕐 배포 시간: ${TIMESTAMP}"