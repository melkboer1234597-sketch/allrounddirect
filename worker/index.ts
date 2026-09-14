import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './types'
import { healthRoutes } from './routes/health'
import { errorHandler } from './middleware/error'

const app = new Hono<AppEnv>()

app.use('*', cors())
app.use('*', errorHandler)

app.route('/api/health', healthRoutes)

app.notFound((c) => c.json({ error: 'Not found' }, 404))

export default app
