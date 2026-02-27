import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: '/app1/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // --- เพิ่มการตั้งค่า Build ตรงนี้เพื่อแก้ปัญหา Chunk Size ---
    build: {
      chunkSizeWarningLimit: 1000, // ขยายเพดานคำเตือนเป็น 1000 kB
      rollupOptions: {
        output: {
          manualChunks: {
            // แยกไลบรารีใหญ่ๆ ออกเป็นไฟล์ย่อย
            'vendor-react': ['react', 'react-dom'],
            'vendor-charts': ['recharts'],
            'vendor-excel': ['xlsx'],
            'vendor-icons': ['lucide-react']
          }
        }
      }
    }
    // ---------------------------------------------------
  };
});