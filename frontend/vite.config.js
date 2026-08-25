import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Inject a preconnect to the API origin. The origin comes from an env var, so
 * it cannot be hardcoded in index.html -- but warming the TLS handshake before
 * the JS bundle asks for products saves a full round trip on first paint.
 */
function apiPreconnect(apiUrl) {
  return {
    name: 'api-preconnect',
    transformIndexHtml() {
      if (!apiUrl) return []
      return [{
        tag: 'link',
        attrs: { rel: 'preconnect', href: apiUrl, crossorigin: '' },
        injectTo: 'head-prepend',
      }]
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), apiPreconnect(env.VITE_API_BASE_URL)],
    server: {
      host: true,
      port: 5173,
    },
    esbuild: {
      // Strip debug output from production builds only.
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          // Keep the framework in its own long-lived chunk so shipping app
          // changes does not invalidate it in browser caches.
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
          },
        },
      },
    },
  }
})
