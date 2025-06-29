#!/bin/bash

echo "🚀 Quick Start - 30-Day Challenge App"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose up --build -d

# Wait a moment for the container to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Application is running!"
    echo "🌐 Visit: http://localhost:3000"
    echo "🔧 Test connection: http://localhost:3000/test-connection"
    
    # Show logs
    echo ""
    echo "📋 Recent logs:"
    docker-compose logs --tail=20
else
    echo "❌ Application failed to start. Showing logs:"
    docker-compose logs
fi
