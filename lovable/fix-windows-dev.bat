@echo off
echo Windows npm 실행 문제 해결 스크립트
echo =====================================

echo 1. 관리자 권한으로 PowerShell 실행하세요
echo 2. 다음 명령어를 순서대로 실행하세요:
echo.
echo cd "C:\MYCLAUDE_PROJECT\jul\lovable"
echo.
echo # 권한 문제 해결
echo Remove-Item -Path "node_modules" -Recurse -Force
echo Remove-Item -Path "package-lock.json" -Force
echo.
echo # 캐시 정리
echo npm cache clean --force
echo.
echo # 의존성 재설치
echo npm install
echo.
echo # 개발 서버 실행 (소문자로!)
echo npm run dev
echo.
echo =====================================
echo 주의: 명령어는 반드시 소문자로 입력하세요!
echo npm run dev (O)
echo NPM RUN DEV (X)
echo =====================================
pause