@echo off
echo 원본 페이지 복원 스크립트
echo =====================

echo 테스트 페이지에서 원본 페이지로 복원 중...

copy "src\pages\Index.backup.tsx" "src\pages\Index.tsx"

echo 복원 완료!
echo.
echo 브라우저에서 Ctrl+Shift+R로 하드 리프레시 하세요.
echo.
pause