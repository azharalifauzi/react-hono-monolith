import { Hono } from 'hono'
import { ssrMiddleware } from '../middlewares/ssr'
import AboutPage from '../views/about/page'
import HomePage from '../views/index/page'

const app = new Hono()

app.get(
  '/',
  ssrMiddleware({
    getInitialProps: async () => ({ test: 'data' }),
  }),
  (c) => {
    const props = c.get('initialProps')

    return c.render(<HomePage {...props} />)
  }
)
app.get(
  '/about',
  ssrMiddleware({
    getInitialProps: async () => ({ test: 'data' }),
  }),
  (c) => {
    const a = c.get('initialProps')

    return c.render(<AboutPage />)
  }
)

export default app
