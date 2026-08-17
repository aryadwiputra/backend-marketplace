import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { db, storeBalances } from '../db'
import { authMiddleware } from '../middleware/auth'
import { success, error, paginated } from '../utils/response'

const storeBalance = new Hono()

storeBalance.get('/all/paginated', authMiddleware, async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const perPage = parseInt(c.req.query('per_page') || '10')

  const allResults = await db
    .select()
    .from(storeBalances)
    .orderBy(desc(storeBalances.created_at))

  const total = allResults.length
  const offset = (page - 1) * perPage
  const data = allResults.slice(offset, offset + perPage)

  return paginated(c, data, { page, perPage, total })
})

storeBalance.get('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))

  const [result] = await db
    .select()
    .from(storeBalances)
    .where(eq(storeBalances.id, id))
    .limit(1)

  if (!result) {
    return error(c, 'Store balance not found', 404)
  }

  return success(c, result)
})

export default storeBalance
