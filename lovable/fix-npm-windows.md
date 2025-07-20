# Windows npm Command Fix Guide

## Problem
When running `npm run dev`, you get the error:
```
'vite'은(는) 내부 또는 외부 명령, 실행할 수 있는 프로그램, 또는 배치 파일이 아닙니다.
```

## Solution Methods

### Method 1: Clean Install (Recommended)
```bash
# Clean npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Try starting the server
npm run dev
```

### Method 2: Use npx (Alternative)
```bash
# Use npx to run vite directly
npx vite
```

### Method 3: Direct Node Execution
```bash
# Run vite directly with node
node node_modules/vite/bin/vite.js
```

### Method 4: Use Helper Scripts
- **Windows**: Run `start-dev.bat`
- **WSL/Linux**: Run `./start-dev.sh`

## Common Issues and Solutions

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

### Node.js Version Issues
- Ensure Node.js version is 18.x or higher
- Check with: `node --version`

### Permission Issues
- Run PowerShell as Administrator (Windows)
- Use `sudo` if needed (Linux/WSL)

## Verification
After fixing, you should see:
```
VITE v5.4.19  ready in 1374 ms

➜  Local:   http://localhost:8080/
➜  Network: http://10.255.255.254:8080/
```

## Prevention
- Always use `npm install` after pulling changes
- Keep Node.js and npm updated
- Use the helper scripts for consistent startup