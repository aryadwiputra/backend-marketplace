import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
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

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.route('/api/auth', authRoutes)
app.route('/api/product-category', productCategoryRoutes)
app.route('/api/product', productRoutes)
app.route('/api/store', storeRoutes)
app.route('/api/transaction', transactionRoutes)
app.route('/api/user', userRoutes)
app.route('/api/store-balance', storeBalanceRoutes)
app.route('/api/withdrawal', withdrawalRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/raja-ongkir', rajaOngkirRoutes)

export default app
