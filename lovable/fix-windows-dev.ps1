# Windows PowerShell 스크립트 - 관리자 권한으로 실행
Write-Host "Windows npm 실행 문제 해결 스크립트" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# 현재 디렉토리 확인
Write-Host "현재 디렉토리: $(Get-Location)" -ForegroundColor Yellow

# 권한 문제 해결을 위한 강제 삭제
Write-Host "1. node_modules 및 package-lock.json 삭제 중..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   - node_modules 삭제 완료" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "   - package-lock.json 삭제 완료" -ForegroundColor Green
}

# npm 캐시 정리
Write-Host "2. npm 캐시 정리 중..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "   - 캐시 정리 완료" -ForegroundColor Green

# 의존성 재설치
Write-Host "3. 의존성 재설치 중..." -ForegroundColor Yellow
npm install
Write-Host "   - 의존성 설치 완료" -ForegroundColor Green

# 개발 서버 실행
Write-Host "4. 개발 서버 실행 중..." -ForegroundColor Yellow
Write-Host "   주의: Ctrl+C로 종료할 수 있습니다" -ForegroundColor Red
npm run dev