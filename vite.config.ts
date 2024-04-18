// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import devServer from '@hono/vite-dev-server'
import { resolve } from 'path'
import { readdirSync } from 'fs'

function getBuildInput() {
  const dirs = readdirSync(resolve(__dirname, './src/views'), {
    recursive: true,
  })

  const buildInput: Record<string, string> = {}

  dirs.forEach((dir) => {
    if (dir.endsWith('/entry-client.tsx')) {
      buildInput[dir.replace('/entry-client.tsx', '')] = resolve(
        __dirname,
        `/src/views/${dir}`
      )
    } else if (dir.endsWith('entry-client.tsx')) {
      buildInput[dir.replace('entry-client.tsx', '')] = resolve(
        __dirname,
        `/src/views/${dir}`
      )
    }
  })

  return buildInput
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000,
  },
  ssr: {
    external: ['react', 'react-dom'],
  },
  build: {
    outDir: 'build',
    manifest: true,
    rollupOptions: {
      input: getBuildInput(),
      output: {
        entryFileNames: 'static/client.js',
        chunkFileNames: 'static/assets/[name]-[hash].js',
        assetFileNames: 'static/assets/[name].[ext]',
      },
    },
  },
  plugins: [
    react(),
    devServer({
      entry: 'src/index.ts',
      exclude: [
        // We need to override this option since the default setting doesn't fit
        /.*\.tsx?($|\?)/,
        /.*\.(s?css|less)($|\?)/,
        /.*\.(svg|png)($|\?)/,
        /^\/@.+$/,
        /^\/favicon\.ico$/,
        /^\/(public|assets|static)\/.+/,
        /^\/node_modules\/.*/,
      ],
      injectClientScript: false, // This option is buggy, disable it and inject the code manually
    }),
  ],
})
