#!/bin/bash

echo "🔧 Installing browser dependencies for Playwright..."

# Try to install dependencies without sudo first
echo "Attempting to install dependencies..."

# Check if we have sudo access
if sudo -n true 2>/dev/null; then
    echo "✅ sudo access available"
    
    # Update package list
    echo "📦 Updating package list..."
    sudo apt-get update -y
    
    # Install required dependencies
    echo "📦 Installing browser dependencies..."
    sudo apt-get install -y \
        libnspr4 \
        libnss3 \
        libasound2t64 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm1 \
        libxss1 \
        libasound2 \
        libatspi2.0-0 \
        libgtk-3-0
    
    echo "🎭 Installing Playwright browsers..."
    npx playwright install chromium
    
    echo "✅ Installation complete!"
    
else
    echo "❌ No sudo access available"
    echo "💡 Please run the following commands manually:"
    echo ""
    echo "sudo apt-get update"
    echo "sudo apt-get install -y libnspr4 libnss3 libasound2t64"
    echo "npx playwright install chromium"
    echo ""
    echo "Or try running this script with sudo:"
    echo "sudo bash scripts/install-browser.sh"
fi