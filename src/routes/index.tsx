import { Hono } from 'hono'
import { ssrMiddleware } from '../middlewares/ssr'

const app = new Hono()

app.get(
  '/',
  ssrMiddleware({
    getInitialProps: async () => ({ test: 'data' }),
  })
)

export default app
