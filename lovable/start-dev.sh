#!/bin/bash

echo "Starting JP Caster Development Server..."
echo "======================================="

# Function to check if port is available
check_port() {
    if lsof -i :8080 > /dev/null 2>&1; then
        echo "⚠️  Port 8080 is already in use"
        echo "Kill existing process? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo "Killing existing process..."
            lsof -ti :8080 | xargs kill -9
            sleep 2
        fi
    fi
}

# Check port availability
check_port

# Try npm run dev first
echo "🚀 Attempting to start with npm run dev..."
if npm run dev; then
    echo "✅ Started successfully with npm run dev"
else
    echo "❌ npm run dev failed, trying npx vite..."
    
    # If npm run dev fails, try npx vite
    if npx vite; then
        echo "✅ Started successfully with npx vite"
    else
        echo "❌ npx vite failed, trying direct node execution..."
        
        # If npx vite fails, try direct node execution
        if node node_modules/vite/bin/vite.js; then
            echo "✅ Started successfully with direct node execution"
        else
            echo "❌ All methods failed!"
            echo ""
            echo "Please check:"
            echo "1. Node.js is installed: node --version"
            echo "2. Dependencies are installed: npm install"
            echo "3. Port 8080 is available: lsof -i :8080"
            echo ""
            exit 1
        fi
    fi
fi