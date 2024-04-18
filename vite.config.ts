// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import devServer from '@hono/vite-dev-server'
import { resolve } from 'path'
import { readdirSync } from 'fs'

function getBuildInput(mode: string) {
  const dirs = readdirSync(resolve(__dirname, './src/views'), {
    recursive: true,
  })

  const buildInput: Record<string, string> = {}

  dirs.forEach((dir) => {
    if (dir.endsWith('/entry.tsx')) {
      buildInput[dir.replace('/entry.tsx', '')] = resolve(
        __dirname,
        `/src/views/${dir}`
      )
    } else if (dir.endsWith('entry.tsx')) {
      buildInput[dir.replace('entry.tsx', '')] = resolve(
        __dirname,
        `/src/views/${dir}`
      )
    }
    if (mode !== 'client') {
      if (dir.endsWith('/page.tsx')) {
        buildInput[dir] = resolve(__dirname, `/src/views/${dir}`)
      } else if (dir.endsWith('page.tsx')) {
        buildInput[dir] = resolve(__dirname, `/src/views/${dir}`)
      }
    }
  })

  return buildInput
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 4000,
  },
  ssr: {
    external: ['react', 'react-dom'],
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      input: getBuildInput(mode),
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
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}))
