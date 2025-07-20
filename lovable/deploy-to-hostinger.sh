#!/bin/bash

# Hostinger FTP 배포 스크립트
# 사용법: ./deploy-to-hostinger.sh

echo "🚀 Starting deployment to studio-sb.com..."

# 빌드 실행
echo "📦 Building production files..."
npm run build

# dist 폴더 존재 확인
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found. Build may have failed."
    exit 1
fi

echo "✅ Build completed successfully!"

# .htaccess 파일을 dist 폴더로 복사
echo "📄 Copying .htaccess file..."
cp .htaccess dist/

echo "📁 Files ready for upload in dist/ folder"
echo ""
echo "📤 Please upload the contents of dist/ folder to:"
echo "   FTP Server: ftp.studio-sb.com"
echo "   Directory: /home/u597195020/domains/studio-sb.com/public_html"
echo ""
echo "🔧 FTP Connection Info:"
echo "   Host: ftp.studio-sb.com"
echo "   Username: u597195020.ssh"
echo "   Password: Jj2478655!"
echo ""
echo "💡 You can use FileZilla or any FTP client to upload the files."
echo ""
echo "✨ After upload, test these URLs:"
echo "   - https://studio-sb.com/products"
echo "   - https://studio-sb.com/categories/agv-casters"
echo "   - https://studio-sb.com/products/mecanum-multi-directional-125mm"