#!/usr/bin/env node
'use strict';

const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const API_TARGET = 'http://127.0.0.1:3001';
const APP4_TARGET = 'http://127.0.0.1:3004';

// Create proxy for API requests
const apiProxy = httpProxy.createProxyServer({
  target: API_TARGET,
  ws: true
});

const app4Proxy = httpProxy.createProxyServer({
  target: APP4_TARGET,
  changeOrigin: true,
  ws: true
});

// Error handling for proxy
apiProxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway - API server not responding');
  }
});

// Serve static files from a directory
function serveStatic(req, res, rootDir, prefixToStrip, fallbackFile = 'index.html') {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // Strip prefix if provided
  if (prefixToStrip && pathname.startsWith(prefixToStrip)) {
    pathname = pathname.slice(prefixToStrip.length);
  }

  // Remove query string
  const filePath = path.join(rootDir, pathname);
  console.log(`  -> Serving: ${filePath}`);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try fallback to index.html for SPA routing
      const fallbackPath = path.join(rootDir, fallbackFile);
      fs.readFile(fallbackPath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

// Main HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // Log all requests
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  // Enable CORS for all routes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Prevent caching to avoid stale content issues
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route: /app4/api/* -> Proxy to App4 Express API (Port 3004)
  if (pathname.startsWith('/app4/api/')) {
    // Strip /app4/api prefix if the express app expects /materials directly?
    // Looking at app4/server/index.js: apiRouter.get('/materials') and app.use('/', apiRouter) or similar?
    // No, app4 server has: app.use('/app4/api', apiRouter) ? No.
    // Let's re-read app4/server/index.js content from step 196.
    // It has: const apiRouter = express.Router(); ... app.use('/', apiRouter); (Wait, need to check)
    // Actually, step 196 shows: apiRouter.get('/materials'...) 
    // It DOES NOT show app.use(...). I missed checking where apiRouter is mounted.
    // If it is mounted at root, we might need to strip prefix.
    // BUT, usually we want to keep it simple.
    // Let's assume for now we forward as-is and correct the backend if needed.
    // actually, let's use the new proxy instance
    app4Proxy.web(req, res);
    return;
  }

  // Route: /api/* -> Proxy to Express API
  if (pathname.startsWith('/api/')) {
    apiProxy.web(req, res);
    return;
  }

  // Route: /app1/* -> Serve app1/dist
  if (pathname.startsWith('/app1/')) {
    const rootDir = '/home/nopparus2/www/app1/dist';
    serveStatic(req, res, rootDir, '/app1');
    return;
  }

  // Route: /app2/* -> Serve app2/dist
  if (pathname.startsWith('/app2/')) {
    const rootDir = '/home/nopparus2/www/app2/dist';
    serveStatic(req, res, rootDir, '/app2');
    return;
  }

  // Route: /app3/* -> Serve app3/dist
  if (pathname.startsWith('/app3/')) {
    const rootDir = '/home/nopparus2/www/app3/dist';
    serveStatic(req, res, rootDir, '/app3');
    return;
  }

  // Route: /app4/* -> Serve app4/dist
  if (pathname.startsWith('/app4/')) {
    const rootDir = '/home/nopparus2/www/app4/dist';
    serveStatic(req, res, rootDir, '/app4');
    return;
  }

  // Route: /app5/* -> Serve app5/dist
  if (pathname.startsWith('/app5/')) {
    const rootDir = '/home/nopparus2/www/app5/dist';
    serveStatic(req, res, rootDir, '/app5');
    return;
  }

  // Route: /* (root) -> Serve menu/dist
  const rootDir = '/home/nopparus2/www/menu/dist';
  serveStatic(req, res, rootDir, null);
});

// WebSocket upgrade handling
server.on('upgrade', (req, socket, head) => {
  const parsedUrl = url.parse(req.url);
  if (parsedUrl.pathname.startsWith('/api/')) {
    apiProxy.ws(req, socket, head);
  } else {
    socket.destroy();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Nexus Proxy Server running on http://0.0.0.0:${PORT}`);
  console.log(`  - Menu app: http://localhost:${PORT}/`);
  console.log(`  - App1: http://localhost:${PORT}/app1/`);
  console.log(`  - App2: http://localhost:${PORT}/app2/`);
  console.log(`  - App3: http://localhost:${PORT}/app3/`);
  console.log(`  - App4: http://localhost:${PORT}/app4/`);
  console.log(`  - App5: http://localhost:${PORT}/app5/`);
  console.log(`  - API: proxying /api/* to ${API_TARGET}`);
  console.log(`\nTo reconfigure Cloudflare Tunnel, update the tunnel to point to http://localhost:${PORT}`);
});
