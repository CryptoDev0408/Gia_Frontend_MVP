#!/bin/bash

# GIA Frontend Quick Setup Script
echo "🚀 GIA Frontend Setup Script"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created with default settings:"
    echo "   - VITE_BACKEND_URL=http://localhost:5005"
    echo "   - VITE_API_BASE_URL=http://localhost:5005/api/v1"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed!"
echo ""

# Final message
echo "============================"
echo "✅ Frontend setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "The app will run on: http://localhost:5173"
echo ""
echo "Make sure the backend is running on: http://localhost:5005"
echo "============================"
