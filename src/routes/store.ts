import { Hono } from 'hono'
import { eq, like, or, desc } from 'drizzle-orm'
import { db, stores } from '../db'
import { authMiddleware } from '../middleware/auth'
import { storeSchema } from '../utils/validation'
import { success, created, error, paginated } from '../utils/response'

const store = new Hono()

store.get('/', async (c) => {
  const { search, is_verified } = c.req.query()

  let conditions = []

  if (search) {
    conditions.push(like(stores.name, `%${search}%`))
  }

  if (is_verified !== undefined) {
    conditions.push(eq(stores.is_verified, is_verified === 'true'))
  }

  const results = conditions.length > 0
    ? await db.select().from(stores).where(or(...conditions))
    : await db.select().from(stores)

  return success(c, results)
})

store.get('/all/paginated', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const perPage = parseInt(c.req.query('per_page') || '10')
  const search = c.req.query('search')

  let conditions = []

  if (search) {
    conditions.push(like(stores.name, `%${search}%`))
  }

  const allResults = await db
    .select()
    .from(stores)
    .where(conditions.length > 0 ? or(...conditions) : undefined)
    .orderBy(desc(stores.created_at))

  const total = allResults.length
  const offset = (page - 1) * perPage
  const data = allResults.slice(offset, offset + perPage)

  return paginated(c, data, { page, perPage, total })
})

store.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))

  const [result] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, id))
    .limit(1)

  if (!result) {
    return error(c, 'Store not found', 404)
  }

  return success(c, result)
})

store.get('/username/:username', async (c) => {
  const username = c.req.param('username')

  const [result] = await db
    .select()
    .from(stores)
    .where(eq(stores.username, username))
    .limit(1)

  if (!result) {
    return error(c, 'Store not found', 404)
  }

  return success(c, result)
})

store.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()

  const result = storeSchema.safeParse(body)
  if (!result.success) {
    return error(c, result.error.errors[0].message, 400)
  }

  const [existing] = await db
    .select()
    .from(stores)
    .where(eq(stores.user_id, userId))
    .limit(1)

  if (existing) {
    return error(c, 'User already has a store', 400)
  }

  const [newStore] = await db
    .insert(stores)
    .values({
      ...result.data,
      user_id: userId,
    })
    .returning()

  return created(c, newStore, 'Store created successfully')
})

store.post('/:id/verified', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))

  const [updated] = await db
    .update(stores)
    .set({ is_verified: true })
    .where(eq(stores.id, id))
    .returning()

  if (!updated) {
    return error(c, 'Store not found', 404)
  }

  return success(c, updated, 'Store verified successfully')
})

store.delete('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))

  const [deleted] = await db
    .delete(stores)
    .where(eq(stores.id, id))
    .returning()

  if (!deleted) {
    return error(c, 'Store not found', 404)
  }

  return success(c, deleted, 'Store deleted successfully')
})

store.get('/my-store', authMiddleware, async (c) => {
  const userId = c.get('userId')

  const [result] = await db
    .select()
    .from(stores)
    .where(eq(stores.user_id, userId))
    .limit(1)

  if (!result) {
    return error(c, 'Store not found', 404)
  }

  return success(c, result)
})

export default store
