import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { db, users } from '../db'
import { authMiddleware } from '../middleware/auth'
import { success, error, paginated } from '../utils/response'

const user = new Hono()

user.get('/all/paginated', authMiddleware, async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const perPage = parseInt(c.req.query('per_page') || '10')
  const search = c.req.query('search')

  let query = db.select().from(users)

  if (search) {
    query = query.where(eq(users.name, `%${search}%`))
  }

  const allResults = await query.orderBy(desc(users.created_at))

  const total = allResults.length
  const offset = (page - 1) * perPage
  const data = allResults.slice(offset, offset + perPage).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    created_at: u.created_at,
  }))

  return paginated(c, data, { page, perPage, total })
})

export default user
