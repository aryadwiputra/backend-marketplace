import { Hono } from 'hono'
import { eq, like, or, desc } from 'drizzle-orm'
import { db, productCategories } from '../db'
import { authMiddleware } from '../middleware/auth'
import { productCategorySchema } from '../utils/validation'
import { success, created, error, paginated } from '../utils/response'

const productCategory = new Hono()

productCategory.get('/', async (c) => {
  const { search, parent_id, limit } = c.req.query()

  let query = db.select().from(productCategories)

  if (search) {
    query = query.where(like(productCategories.name, `%${search}%`))
  }

  let results = await query

  if (limit) {
    results = results.slice(0, parseInt(limit))
  }

  return success(c, results)
})

productCategory.get('/all/paginated', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const perPage = parseInt(c.req.query('per_page') || '10')
  const search = c.req.query('search')

  let conditions = []

  if (search) {
    conditions.push(like(productCategories.name, `%${search}%`))
  }

  const allResults = await db
    .select()
    .from(productCategories)
    .where(conditions.length > 0 ? or(...conditions) : undefined)
    .orderBy(desc(productCategories.created_at))

  const total = allResults.length
  const offset = (page - 1) * perPage
  const data = allResults.slice(offset, offset + perPage)

  return paginated(c, data, { page, perPage, total })
})

productCategory.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))

  const [result] = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.id, id))
    .limit(1)

  if (!result) {
    return error(c, 'Category not found', 404)
  }

  return success(c, result)
})

productCategory.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug')

  const [result] = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.slug, slug))
    .limit(1)

  if (!result) {
    return error(c, 'Category not found', 404)
  }

  return success(c, result)
})

productCategory.post('/', authMiddleware, async (c) => {
  const body = await c.req.json()

  const result = productCategorySchema.safeParse(body)
  if (!result.success) {
    return error(c, result.error.errors[0].message, 400)
  }

  const [newCategory] = await db
    .insert(productCategories)
    .values(result.data)
    .returning()

  return created(c, newCategory, 'Category created successfully')
})

productCategory.post('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const result = productCategorySchema.safeParse(body)
  if (!result.success) {
    return error(c, result.error.errors[0].message, 400)
  }

  const [updated] = await db
    .update(productCategories)
    .set(result.data)
    .where(eq(productCategories.id, id))
    .returning()

  if (!updated) {
    return error(c, 'Category not found', 404)
  }

  return success(c, updated, 'Category updated successfully')
})

productCategory.delete('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))

  const [deleted] = await db
    .delete(productCategories)
    .where(eq(productCategories.id, id))
    .returning()

  if (!deleted) {
    return error(c, 'Category not found', 404)
  }

  return success(c, deleted, 'Category deleted successfully')
})

export default productCategory
