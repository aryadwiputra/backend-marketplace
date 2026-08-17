import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db, products, transactions, stores, users, productCategories } from '../db'
import { authMiddleware } from '../middleware/auth'
import { success, error } from '../utils/response'

const dashboard = new Hono()

dashboard.get('/', authMiddleware, async (c) => {
  const user = c.get('user')

  try {
    const totalProducts = await db.select().from(products)
    const totalTransactions = await db.select().from(transactions)
    const totalStores = await db.select().from(stores)
    const totalUsers = await db.select().from(users)
    const categories = await db.select().from(productCategories)

    const recentTransactions = await db.select().from(transactions).limit(5)

    let dashboardData: Record<string, unknown> = {
      stats: {
        products: totalProducts.length,
        transactions: totalTransactions.length,
        stores: totalStores.length,
        users: totalUsers.length,
        categories: categories.length,
      },
      recent_transactions: recentTransactions,
    }

    if (user?.role === 'seller') {
      const userId = c.get('userId')

      const [store] = await db
        .select()
        .from(stores)
        .where(eq(stores.user_id, userId))
        .limit(1)

      if (store) {
        const storeProducts = await db
          .select()
          .from(products)
          .where(eq(products.store_id, store.id))

        const storeTransactions = await db
          .select()
          .from(transactions)
          .where(eq(transactions.store_id, store.id))

        dashboardData = {
          stats: {
            products: storeProducts.length,
            transactions: storeTransactions.length,
            balance: store.balance,
          },
          recent_transactions: storeTransactions.slice(0, 5),
        }
      }
    }

    return success(c, dashboardData)
  } catch (err) {
    console.error('Dashboard error:', err)
    return error(c, 'Failed to fetch dashboard data', 500)
  }
})

export default dashboard
