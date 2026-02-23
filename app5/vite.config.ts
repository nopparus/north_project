import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to remove crossorigin attribute from HTML output
// Cloudflare Bot Protection blocks CORS-mode requests for static assets
function removeCrossOrigin(): Plugin {
  return {
    name: 'remove-crossorigin',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(/ crossorigin/g, '');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/app5/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), removeCrossOrigin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
    },
  };
});
