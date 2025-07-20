#!/bin/bash

# Hostinger 자동 배포 스크립트
echo "=== Hostinger 자동 배포 스크립트 ==="

# FTP를 통해 명령어 실행
echo "1. 서브디렉토리 생성 및 압축 해제..."

# jpcaster 디렉토리 생성하고 파일 이동
curl -Q "MKD jpcaster" ftp://ftp.studio-sb.com/ --user u597195020.ssh:Jj2478655!

# tar.gz 파일을 jpcaster 디렉토리로 복사
curl -Q "CPTO jpcaster.tar.gz jpcaster/jpcaster.tar.gz" ftp://ftp.studio-sb.com/ --user u597195020.ssh:Jj2478655!

echo "2. FTP 명령어로 압축 해제 시도..."
# 일부 FTP 서버는 TAR 명령어를 지원합니다
curl -Q "SITE TAR -xzf jpcaster/jpcaster.tar.gz -C jpcaster/" ftp://ftp.studio-sb.com/ --user u597195020.ssh:Jj2478655!

echo "3. 배포 완료!"
echo "사이트 접속: https://studio-sb.com/jpcaster/"
echo "또는 메인 도메인: https://studio-sb.com (WordPress와 공존)"