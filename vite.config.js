import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/upload': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/contas': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // '/login' também é uma rota de página (react-router). Navegação de
        // browser (reload, digitar a URL) manda Accept: text/html — nesse
        // caso não proxiamos, deixando o Vite servir o index.html da SPA.
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        },
      },
      '/register': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Mesmo motivo do '/login' acima — '/register' também é rota de página.
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        },
      },
      '/logout': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/me': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/clients': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/drafts': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/draft': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/feed': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // '/feed' também é uma rota de página (react-router). Navegação de
        // browser (reload, digitar a URL) manda Accept: text/html — nesse
        // caso não proxiamos, deixando o Vite servir o index.html da SPA.
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        },
      },
      '/schedule': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/posts': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/kanban': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ai-lab': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/columns': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
