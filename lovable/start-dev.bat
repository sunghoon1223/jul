@echo off
echo Starting JP Caster Development Server...
echo =======================================

REM Try npm run dev first
echo Attempting to start with npm run dev...
npm run dev

REM If npm run dev fails, try npx vite
if %errorlevel% neq 0 (
    echo npm run dev failed, trying npx vite...
    npx vite
)

REM If npx vite fails, try direct node execution
if %errorlevel% neq 0 (
    echo npx vite failed, trying direct node execution...
    node node_modules/vite/bin/vite.js
)

echo.
echo If all methods failed, please check:
echo 1. Node.js is installed
echo 2. Dependencies are installed (npm install)
echo 3. Port 8080 is available
echo.
pause