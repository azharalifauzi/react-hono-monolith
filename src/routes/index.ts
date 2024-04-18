import { Hono } from 'hono'
import { ssrMiddleware } from '../middlewares/ssr'

const app = new Hono()

app.get('/', ssrMiddleware())
app.get('/about/:id', ssrMiddleware())

export default app
