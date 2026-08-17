import { Hono } from 'hono'
import { eq, like, or, desc, sql } from 'drizzle-orm'
import { db, products } from '../db'
import { authMiddleware } from '../middleware/auth'
import { productSchema } from '../utils/validation'
import { success, created, error, paginated } from '../utils/response'

const product = new Hono()

product.get('/', async (c) => {
  const { search, category_id, store_id, limit, random } = c.req.query()

  let conditions = [eq(products.is_active, true)]

  if (search) {
    conditions.push(like(products.name, `%${search}%`))
  }

  if (category_id) {
    conditions.push(eq(products.category_id, parseInt(category_id)))
  }

  if (store_id) {
    conditions.push(eq(products.store_id, parseInt(store_id)))
  }

  let results = await db
    .select()
    .from(products)
    .where(conditions.length > 0 ? or(...conditions) : undefined)
    .orderBy(desc(products.created_at))

  if (random === 'true') {
    results = results.sort(() => Math.random() - 0.5)
  }

  if (limit) {
    results = results.slice(0, parseInt(limit))
  }

  return success(c, results)
})

product.get('/all/paginated', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const perPage = parseInt(c.req.query('per_page') || '10')
  const search = c.req.query('search')
  const category_id = c.req.query('category_id')
  const store_id = c.req.query('store_id')

  let conditions = [eq(products.is_active, true)]

  if (search) {
    conditions.push(like(products.name, `%${search}%`))
  }

  if (category_id) {
    conditions.push(eq(products.category_id, parseInt(category_id)))
  }

  if (store_id) {
    conditions.push(eq(products.store_id, parseInt(store_id)))
  }

  const allResults = await db
    .select()
    .from(products)
    .where(or(...conditions))
    .orderBy(desc(products.created_at))

  const total = allResults.length
  const offset = (page - 1) * perPage
  const data = allResults.slice(offset, offset + perPage)

  return paginated(c, data, { page, perPage, total })
})

product.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))

  const [result] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1)

  if (!result) {
    return error(c, 'Product not found', 404)
  }

  return success(c, result)
})

product.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug')

  const [result] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1)

  if (!result) {
    return error(c, 'Product not found', 404)
  }

  return success(c, result)
})

product.post('/', authMiddleware, async (c) => {
  const body = await c.req.json()

  const result = productSchema.safeParse(body)
  if (!result.success) {
    return error(c, result.error.errors[0].message, 400)
  }

  const [newProduct] = await db
    .insert(products)
    .values({
      ...result.data,
      price: result.data.price.toString(),
    })
    .returning()

  return created(c, newProduct, 'Product created successfully')
})

product.post('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const { _method, ...updateData } = body

  const [updated] = await db
    .update(products)
    .set({
      ...updateData,
      price: updateData.price?.toString(),
    })
    .where(eq(products.id, id))
    .returning()

  if (!updated) {
    return error(c, 'Product not found', 404)
  }

  return success(c, updated, 'Product updated successfully')
})

product.delete('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))

  const [deleted] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning()

  if (!deleted) {
    return error(c, 'Product not found', 404)
  }

  return success(c, deleted, 'Product deleted successfully')
})

export default product
