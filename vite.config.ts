import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'app', 'renderer'),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [
    react({
      jsxImportSource: 'react',
    }),
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@app': path.resolve(__dirname, 'app'),
      '@shared': path.resolve(__dirname, 'app/shared'),
      // ❌ @backend removed - renderer must use IPC only
      '@renderer': path.resolve(__dirname, 'app/renderer'),
      '@components': path.resolve(__dirname, 'app/renderer/components'),
      '@hooks': path.resolve(__dirname, 'app/renderer/hooks'),
      '@views': path.resolve(__dirname, 'app/renderer/views'),
      '@services': path.resolve(__dirname, 'app/renderer/services'),
      '@stores': path.resolve(__dirname, 'app/renderer/stores'),
      '@contexts': path.resolve(__dirname, 'app/renderer/contexts'),
      '@utils': path.resolve(__dirname, 'app/renderer/utils'),
      '@styles': path.resolve(__dirname, 'app/renderer/styles'),
      '@assets': path.resolve(__dirname, 'assets')
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
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
    include: ['react', 'react-dom', 'lucide-react'],
    exclude: ['electron'],
  }
})
