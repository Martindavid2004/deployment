#!/bin/bash
# Quick setup script for Coding Practice Module

set -e

echo "🚀 Setting up Coding Practice Module..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Install Node dependencies
echo "📦 Installing Node dependencies..."
cd ../frontend
npm install

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && uvicorn app.main:app --reload --port 8000"
echo "2. Frontend: cd frontend && npm run dev"
