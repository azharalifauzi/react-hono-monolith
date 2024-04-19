// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import devServer from '@hono/vite-dev-server'
import { resolve } from 'path'
import { readdirSync } from 'fs'
import { run } from 'vite-plugin-run'

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

  buildInput['.monrho'] = resolve(__dirname, '/.monrho/routes.tsx')

  return buildInput
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 4000,
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
    cssMinify: true,
  },
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
        ],
      },
    }),
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
    run([
      {
        name: 'generate route',
        run: ['npx', 'tsx', 'scripts/generate-route.tsx'],
        startup: true,
        build: true,
        condition: (file) => file.endsWith('page.tsx'),
      },
      {
        name: 'generate entry',
        run: ['npx', 'tsx', 'scripts/generate-entry.ts'],
        startup: true,
        build: true,
        condition: (file) => file.endsWith('page.tsx'),
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '.monrho': resolve(__dirname, './.monrho'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
}))
