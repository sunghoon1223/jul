#!/bin/bash

# E-Commerce MVP Project Setup Script
# This script automates the initial project setup

set -e

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: ./setup-project.sh <project-name>"
    exit 1
fi

echo "🚀 Setting up E-Commerce MVP: $PROJECT_NAME"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Create Vite React project
echo "📦 Creating Vite React project..."
npm create vite@latest frontend -- --template react-ts
cd frontend

# Copy source templates
echo "📂 Copying source templates..."
cp -r ../E-Commerce_MVP_Framework/src-template/* src/

# Copy config files
echo "⚙️ Copying configuration files..."
cp ../E-Commerce_MVP_Framework/config-templates/package.json .
cp ../E-Commerce_MVP_Framework/config-templates/vite.config.ts .
cp ../E-Commerce_MVP_Framework/config-templates/tailwind.config.ts .
cp ../E-Commerce_MVP_Framework/config-templates/.env.example .env.local

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Initialize git
echo "🔧 Initializing Git repository..."
git init
git add .
git commit -m "Initial commit: E-Commerce MVP setup"

# Create basic folder structure
mkdir -p public/images
mkdir -p public/data

echo "✅ Project setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Set up Supabase backend using development-flow/01_supabase_setup_complete.md"
echo "3. Run 'npm run dev' to start development server"
echo ""
echo "📚 Documentation: Check COMPLETE_IMPLEMENTATION_GUIDE.md for detailed instructions"