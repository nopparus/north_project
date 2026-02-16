#!/bin/bash
set -e

echo "🚀 Deploying Nexus Portal via Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running or you don't have permission."
  echo "   Try running: sudo service docker start"
  echo "   Or check if your user is in the 'docker' group."
  exit 1
fi

# Stop existing non-docker services
echo "🛑 Stopping existing local services..."
if [ -f /home/nopparus2/www/start-all.sh ]; then
   kill $(cat /tmp/nexus-*.pid 2>/dev/null) 2>/dev/null || true
fi

# Build and Start Containers
echo "🏗️  Building and Starting Containers..."
docker compose up -d --build

echo ""
echo "✅ Deployment Complete!"
echo "   Gateway: http://localhost:8080"
echo "   Main API: http://localhost:3001"
echo "   App4 API: http://localhost:3004"
echo ""
echo "logs: docker compose logs -f"
