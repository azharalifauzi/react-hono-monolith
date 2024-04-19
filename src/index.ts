import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { isProduction } from './constants/index.ts'
import { createStaticHandler } from 'react-router-dom/server'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const app = new Hono({
  strict: false,
})

let routes: any = [{ path: '/' }]

if (isProduction) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  const manifestServer = JSON.parse(
    readFileSync(
      resolve(__dirname, '../build/server/.vite/manifest.json'),
      'utf-8'
    )
  )

  const routesFile = manifestServer['.monrho/routes.tsx'].file
  const exported = await import(
    resolve(__dirname, `../build/server/${routesFile}`)
  )

  routes = exported.default

  app.use(
    '*',
    serveStatic({
      root: './build/client',
    })
  )
} else {
  routes = (await import('.monrho/routes.tsx')).default
}

const staticHandler = createStaticHandler(routes)

const { ssrMiddleware } = await import('./middlewares/ssr.tsx')

routes.forEach(({ path }) => {
  app.get(
    path,
    ssrMiddleware({
      staticHandler,
      routes,
    })
  )
})

export default app

if (isProduction) {
  serve(
    {
      ...app,
      port: 4000,
    },
    (info) => {
      console.log(`Listening on http://localhost:${info.port}`)
    }
  )
}
