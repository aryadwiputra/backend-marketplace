import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { errorHandler } from './middleware/error'
import { corsMiddleware } from './middleware/cors'

import authRoutes from './routes/auth'
import productCategoryRoutes from './routes/productCategory'
import productRoutes from './routes/product'
import storeRoutes from './routes/store'
import transactionRoutes from './routes/transaction'
import userRoutes from './routes/user'
import storeBalanceRoutes from './routes/storeBalance'
import withdrawalRoutes from './routes/withdrawal'
import dashboardRoutes from './routes/dashboard'
import rajaOngkirRoutes from './routes/rajaOngkir'

const app = new Hono()

app.use('*', logger())
app.use('*', corsMiddleware)
app.use('*', errorHandler)

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.route('/auth', authRoutes)
app.route('/product-category', productCategoryRoutes)
app.route('/product', productRoutes)
app.route('/store', storeRoutes)
app.route('/transaction', transactionRoutes)
app.route('/user', userRoutes)
app.route('/store-balance', storeBalanceRoutes)
app.route('/withdrawal', withdrawalRoutes)
app.route('/dashboard', dashboardRoutes)
app.route('/raja-ongkir', rajaOngkirRoutes)

export default app
