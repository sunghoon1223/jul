#!/bin/bash

# Hostinger FTP Deployment Script
# This script deploys the built files to Hostinger via FTP

echo "🚀 Starting deployment to studio-sb.com..."

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo "❌ lftp is required but not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y lftp
fi

# Build the project first
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting deployment."
    exit 1
fi

# Deploy using lftp
echo "📤 Uploading files to Hostinger..."

lftp -c "
set ssl:verify-certificate no
open ftp://u597195020.ssh:Jj2478655!@ftp.studio-sb.com
mirror -R --delete --verbose dist/ /home/u597195020/public_html/
bye
"

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your site is live at: https://studio-sb.com"
    echo ""
    echo "🧪 Test these problematic routes:"
    echo "   - https://studio-sb.com/categories/agv-casters"
    echo "   - https://studio-sb.com/products/mecanum-multi-directional-125mm"
    echo "   - https://studio-sb.com/route-debug.html"
else
    echo "❌ Deployment failed!"
    exit 1
fi