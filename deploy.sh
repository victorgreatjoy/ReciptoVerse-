#!/bin/bash

# ReceiptoVerse Deployment Script
echo "🚀 Preparing ReceiptoVerse for deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial ReceiptoVerse MVP commit"
    echo "✅ Git repository initialized"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Create a GitHub repository: https://github.com/new"
    echo "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/ReceiptoVerse.git"
    echo "3. Push code: git push -u origin main"
    echo ""
else
    echo "✅ Git repository already exists"
fi

# Check for environment file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found!"
    echo "📝 Please copy .env.example to .env and fill in your values:"
    echo "   cp .env.example .env"
    echo ""
fi

echo "🎯 Deployment Options:"
echo ""
echo "Frontend (Choose one):"
echo "1. Vercel: https://vercel.com"
echo "   - Connect GitHub repo"
echo "   - Set root directory: frontend"
echo "   - Add env var: VITE_API_URL=your_backend_url"
echo ""
echo "2. Netlify: https://netlify.com"
echo "   - Connect GitHub repo"
echo "   - Build command: cd frontend && npm run build"
echo "   - Publish directory: frontend/dist"
echo ""
echo "Backend (Choose one):"
echo "1. Railway: https://railway.app"
echo "   - Connect GitHub repo"
echo "   - Set root directory: backend"
echo "   - Add all environment variables from .env"
echo ""
echo "2. Render: https://render.com"
echo "   - Connect GitHub repo"
echo "   - Build command: cd backend && npm install"
echo "   - Start command: cd backend/src && node server.js"
echo ""
echo "📚 Full guide: see DEPLOYMENT.md"
echo ""
echo "🎉 Your ReceiptoVerse MVP is ready for the world!"