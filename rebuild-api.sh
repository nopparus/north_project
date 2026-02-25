#!/bin/bash

# Rebuild and restart the main-api container
echo "🏗️  Rebuilding nexus-main-api..."
sudo docker compose up -d --build main-api

# Reload the Nginx gateway
echo "🔄 Reloading nexus-gateway Nginx..."
sudo docker exec nexus-gateway nginx -s reload

echo "✅ Done!"
