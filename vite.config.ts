import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), dts({
    include: 'src/index.ts',
  })],
  define: {
    // 在构建时替换 BUILD_TIME 为实际构建日期
    'BUILD_TIME': JSON.stringify(new Date().toISOString().split('T')[0]),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FloatingBall',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
        },
      },
    },
  },
  server: {
    open: true,
  },
})
