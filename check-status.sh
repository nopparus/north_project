#!/bin/bash

export PATH="/home/nopparus2/.nvm/versions/node/v22.22.0/bin:$PATH"

echo "═══════════════════════════════════════════"
echo "  Nexus Portal - Status Check"
echo "═══════════════════════════════════════════"
echo ""

# Check Express API
echo "📡 Express API (port 3001):"
if ps aux | grep -v grep | grep "node server.js" > /dev/null; then
    echo "   ✅ Running (PID: $(cat /tmp/nexus-api.pid 2>/dev/null || echo 'unknown'))"
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "   ✅ Responding to health check"
    else
        echo "   ⚠️  Not responding to requests"
    fi
else
    echo "   ❌ Not running"
fi
echo ""

# Check Proxy Server
echo "🔀 Proxy Server (port 8080):"
if ps aux | grep -v grep | grep "node proxy-server.js" > /dev/null; then
    echo "   ✅ Running (PID: $(cat /tmp/nexus-proxy.pid 2>/dev/null || echo 'unknown'))"
    if curl -s -I http://localhost:8080/ > /dev/null 2>&1; then
        echo "   ✅ Responding to requests"
    else
        echo "   ⚠️  Not responding to requests"
    fi
else
    echo "   ❌ Not running"
fi
echo ""

# Check App4 Server
echo "📦 App4 Server (port 3004):"
if ps aux | grep -v grep | grep "node index.js" | grep "app4" > /dev/null; then
    echo "   ✅ Running (PID: $(cat /tmp/nexus-app4.pid 2>/dev/null || echo 'unknown'))"
    if curl -s http://localhost:3004/app4/api/materials > /dev/null 2>&1; then
         echo "   ✅ Responding to requests"
    else
         echo "   ⚠️  Process running but endpoint not responding (Check logs: /tmp/nexus-app4.log)"
    fi
else
    echo "   ❌ Not running"
fi
echo ""

# Check Cloudflared
echo "☁️  Cloudflare Tunnel:"
if ps aux | grep -v grep | grep cloudflared > /dev/null; then
    echo "   ✅ Cloudflared is running"
    echo "   ⚠️  Tunnel should point to: http://localhost:8080"
    echo ""
    echo "   📝 To update tunnel configuration:"
    echo "      1. Go to https://one.dash.cloudflare.com/"
    echo "      2. Access > Tunnels"
    echo "      3. Edit tunnel for 'north.porjai.uk'"
    echo "      4. Change URL from localhost:80 to localhost:8080"
else
    echo "   ❌ Cloudflared not running"
fi
echo ""

# Check built artifacts
echo "📦 Built Artifacts:"
for app in menu app1 app2 app3; do
    if [ -d "/home/nopparus2/www/$app/dist" ]; then
        echo "   ✅ $app/dist exists"
    else
        echo "   ❌ $app/dist missing"
    fi
done
echo ""

# Check database
echo "🗄️  Database:"
if [ -f "/home/nopparus2/www/server/nexus.db" ]; then
    echo "   ✅ nexus.db exists"
    SIZE=$(ls -lh /home/nopparus2/www/server/nexus.db | awk '{print $5}')
    echo "   📊 Size: $SIZE"
else
    echo "   ⚠️  nexus.db not found (will be created on first API start)"
fi
echo ""

echo "═══════════════════════════════════════════"
echo ""
echo "Quick Actions:"
echo "  Start services:   /home/nopparus2/www/start-all.sh"
echo "  Stop services:    kill \$(cat /tmp/nexus-*.pid)"
echo "  API logs:         tail -f /tmp/nexus-api.log"
echo "  Proxy logs:       tail -f /tmp/nexus-proxy.log"
echo "  Full guide:       cat /home/nopparus2/www/SETUP-GUIDE.md"
echo ""
