#!/bin/bash

# Vercel Deployment Script for E-Commerce MVP
# Automates the deployment process to Vercel

set -e

echo "🚀 Deploying E-Commerce MVP to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Check build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Your E-Commerce MVP is now live on Vercel!"
echo "Check your Vercel dashboard for the deployment URL"