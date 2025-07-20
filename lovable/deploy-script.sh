#!/bin/bash

# FTP 배포 스크립트
FTP_HOST="ftp.studio-sb.com"
FTP_USER="u597195020.ssh"
FTP_PASS="Jj2478655!"

echo "Connecting to FTP and deploying..."

# FTP 명령어 스크립트 생성
cat << 'EOF' > ftp_commands.txt
cd domains/studio-sb.com/public_html
mkdir wordpress_backup
mput wp-*
mv wp-* wordpress_backup/
mv .htaccess wordpress_backup/
get jpcaster-dist.tar.gz
quit
EOF

# FTP 실행
curl -T ftp_commands.txt --user ${FTP_USER}:${FTP_PASS} ftp://${FTP_HOST}/

echo "Deployment completed!"