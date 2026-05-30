#!/bin/bash
# Quick setup script for Coding Practice Module

echo "🚀 Setting up Coding Practice Module..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node dependencies
echo "📦 Installing Node dependencies..."
npm install

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: uvicorn app.main:app --reload --port 8000"
echo "2. Frontend: npm run dev"
echo ""
echo "📚 See CODING_PRACTICE_IMPLEMENTATION.md for complete documentation"
