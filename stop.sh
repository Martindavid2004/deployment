#!/bin/bash
# CodoAI Platform Stop Script

echo "🛑 Stopping CodoAI Platform..."

# Stop all services
docker-compose down

echo ""
echo "✅ CodoAI Platform stopped successfully!"
echo ""
echo "💡 To remove all data (including database):"
echo "   docker-compose down -v"
echo ""
echo "💡 To start again:"
echo "   ./start.sh"
echo ""