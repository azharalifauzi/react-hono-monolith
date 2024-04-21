import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { isProduction } from './constants/index.ts'
import { createStaticHandler } from 'react-router-dom/server'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { render } from '@/lib/mrh.tsx'

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

  const routesFile = manifestServer['.mrh/routes.tsx'].file
  const exported = await import(
    /* @vite-ignore */
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
  routes = (await import('.mrh/routes.tsx')).default
}

const staticHandler = createStaticHandler(routes)

routes.forEach(({ path }) => {
  if (['*', '/_error', '/_404'].includes(path)) {
    return
  }

  app.get(
    path,
    render({
      staticHandler,
      routes,
    })
  )
})

app.notFound(async (c) => {
  if (c.req.method === 'GET') {
    return render({
      routes,
      staticHandler,
      notFound: true,
    })(c)
  }

  return c.json({ data: 'Endpoint Not found' })
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
