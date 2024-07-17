import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Inspect from 'vite-plugin-inspect';
// const isProduction = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname)
  console.log(env, mode, 'env')
  return {
    plugins: [
      vue(),
      Inspect(),
      // 自动导入
      AutoImport({
        imports: ['vue', 'vue-router'],
        dirs: ['./src/utils/**']
      }),
      // 自动导入组件
      Components({
        // 自动导入第三方组件
        resolvers: [ElementPlusResolver()],
        dirs: ['src/components'],
        // 自动导入的组件名称 包含目录 防止命名冲突
        directoryAsNamespace: true
      })
    ],
    publicDir: './public',
    base: './',
    server: {
      port: 9527,
      open: true,
      host: '0.0.0.0',
      hot: true,
      proxy: {
        '/api': {
          target: env.VITE_APP_BASEAPI,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    },
    build: {
      outDir: 'dist',
      target: 'es2015',
      sourcemap: false,
      reportCompressedSize: false,
      terserOptions: {
        // 生产环境自动删除console.log / debugger
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    }
  }
})
