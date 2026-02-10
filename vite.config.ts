import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip 压缩 - 生成 .gz 文件供 CDN 传输
    compression({
      verbose: true,
      disable: false,
      threshold: 10240, // 10KB 以上才压缩
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false, // 保留原文件以兼容不支持 gzip 的客户端
      compressionOptions: {
        level: 9, // 最大压缩级别
      },
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    outDir: './dist',
    emptyOutDir: true,
    // 生产级别构建配置
    target: 'es2020',
    // CSS 代码合并，减少 CDN HTTP 请求
    cssCodeSplit: false,
    // 不生成 sourcemap，减小体积
    sourcemap: false,
    // 使用 terser 进行激进压缩
    minify: 'terser',
    // chunk 大小警告阈值 (kB)
    chunkSizeWarningLimit: 2000,
    // 小文件内联为 base64（CDN 友好）
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        // JS 文件带 content hash - CDN 长期缓存
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // 静态资源分类输出
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? ''
          if (/\.(css)$/.test(name)) {
            return 'assets/css/[name]-[hash][extname]'
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/.test(name)) {
            return 'assets/img/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        // 供应商库拆包，充分利用浏览器缓存
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // 复制 CDN 配置文件到 dist
    copyPublicDir: true,
  },
})
