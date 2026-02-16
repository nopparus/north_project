#!/bin/bash

export PATH="/home/nopparus2/.nvm/versions/node/v22.22.0/bin:$PATH"

echo "🚀 Starting Nexus Portal Services..."

# Start Express API server
echo "Starting Express API server on port 3001..."
cd /home/nopparus2/www/server
node server.js > /tmp/nexus-api.log 2>&1 &
API_PID=$!
echo "  ✓ Express API started (PID: $API_PID)"

# Wait for API to be ready
sleep 2

# Start App4 Server (Material DB)
echo "Starting App4 Server on port 3004..."
cd /home/nopparus2/www/app4/server
PORT=3004 node index.js > /tmp/nexus-app4.log 2>&1 &
APP4_PID=$!
echo "  ✓ App4 Server started (PID: $APP4_PID)"

# Start Proxy Server
echo "Starting Proxy Server on port 8080..."
cd /home/nopparus2/www
node proxy-server.js > /tmp/nexus-proxy.log 2>&1 &
PROXY_PID=$!
echo "  ✓ Proxy Server started (PID: $PROXY_PID)"

# Save PIDs
echo $API_PID > /tmp/nexus-api.pid
echo $PROXY_PID > /tmp/nexus-proxy.pid
echo $APP4_PID > /tmp/nexus-app4.pid

echo ""
echo "✓ All services started!"
echo ""
echo "Services:"
echo "  - Express API: http://localhost:3001"
echo "  - Proxy Server: http://localhost:8080"
echo ""
echo "Logs:"
echo "  - API: tail -f /tmp/nexus-api.log"
echo "  - Proxy: tail -f /tmp/nexus-proxy.log"
echo ""
echo "To stop services:"
echo "  kill $(cat /tmp/nexus-api.pid) $(cat /tmp/nexus-proxy.pid)"
echo ""
echo "⚠️  IMPORTANT: Update Cloudflare Tunnel to point to http://localhost:8080"
echo "   Currently it's pointing to port 80 (nginx), change it to 8080"
