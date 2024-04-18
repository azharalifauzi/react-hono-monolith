import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { isProduction } from './constants/index.ts'
import index from './routes/index.tsx'

const app = new Hono()

app.route('/', index)

if (isProduction) {
  app.use(
    '*',
    serveStatic({
      root: './build/client',
    })
  )
}

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
