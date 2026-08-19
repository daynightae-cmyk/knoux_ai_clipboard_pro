import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(rootDir, 'app', 'renderer'),
  publicDir: path.resolve(rootDir, 'public'),
  plugins: [
    react({
      jsxImportSource: 'react',
    }),
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(rootDir, '.'),
      '@app': path.resolve(rootDir, 'app'),
      '@shared': path.resolve(rootDir, 'app/shared'),
      // âŒ @backend removed - renderer must use IPC only
      '@renderer': path.resolve(rootDir, 'app/renderer'),
      '@components': path.resolve(rootDir, 'app/renderer/components'),
      '@hooks': path.resolve(rootDir, 'app/renderer/hooks'),
      '@views': path.resolve(rootDir, 'app/renderer/views'),
      '@services': path.resolve(rootDir, 'app/renderer/services'),
      '@stores': path.resolve(rootDir, 'app/renderer/stores'),
      '@contexts': path.resolve(rootDir, 'app/renderer/contexts'),
      '@utils': path.resolve(rootDir, 'app/renderer/utils'),
      '@styles': path.resolve(rootDir, 'app/renderer/styles'),
      '@assets': path.resolve(rootDir, 'assets')
    }
  },
  build: {
    outDir: path.resolve(rootDir, 'dist'),
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: {
        toplevel: true,
      },
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
        manualChunks(id) {
          if (id.includes('node_modules/@zxing/')) return 'vendor-barcode'
          return undefined
        },
      },
    },
    sourcemap: false,
    reportCompressedSize: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'motion'],
    exclude: ['electron'],
  }
})

