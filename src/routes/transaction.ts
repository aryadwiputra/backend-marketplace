import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { db, transactions, transactionItems, addresses, products } from '../db'
import { authMiddleware } from '../middleware/auth'
import { midtransService } from '../services/midtrans.service'
import { success, error, paginated } from '../utils/response'

const transaction = new Hono()

transaction.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const user = c.get('user')
  const { store_id } = c.req.query()

  let results

  if (user?.role === 'buyer') {
    results = await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.created_at))
  } else if (store_id) {
    results = await db
      .select()
      .from(transactions)
      .where(eq(transactions.store_id, parseInt(store_id)))
      .orderBy(desc(transactions.created_at))
  } else {
    results = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.created_at))
  }

  return success(c, results)
})

transaction.get('/all/paginated', authMiddleware, async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const perPage = parseInt(c.req.query('per_page') || '10')

  const allResults = await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.created_at))

  const total = allResults.length
  const offset = (page - 1) * perPage
  const data = allResults.slice(offset, offset + perPage)

  return paginated(c, data, { page, perPage, total })
})

transaction.get('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))

  const [result] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1)

  if (!result) {
    return error(c, 'Transaction not found', 404)
  }

  const items = await db
    .select()
    .from(transactionItems)
    .where(eq(transactionItems.transaction_id, id))

  return success(c, { ...result, items })
})

transaction.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()

  const { store_id, address_id, shipping, shipping_type, products: orderProducts } = body

  if (!orderProducts || orderProducts.length === 0) {
    return error(c, 'Products are required', 400)
  }

  const [address] = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, address_id))
    .limit(1)

  if (!address) {
    return error(c, 'Address not found', 404)
  }

  let totalAmount = 0
  const transactionItemsData = []

  for (const item of orderProducts) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.product_id))
      .limit(1)

    if (!product) {
      return error(c, `Product ${item.product_id} not found`, 404)
    }

    const itemTotal = parseFloat(product.price) * item.qty
    totalAmount += itemTotal

    transactionItemsData.push({
      product_id: item.product_id,
      qty: item.qty,
      price: itemTotal,
    })
  }

  const shippingCost = 0
  const grandTotal = totalAmount + shippingCost

  const [newTransaction] = await db
    .insert(transactions)
    .values({
      user_id: userId,
      store_id,
      address_id,
      total: grandTotal.toString(),
      shipping,
      shipping_cost: shippingCost.toString(),
      shipping_type,
      status: 'pending',
    })
    .returning()

  for (const item of transactionItemsData) {
    await db.insert(transactionItems).values({
      ...item,
      transaction_id: newTransaction.id,
      price: item.price.toString(),
    })
  }

  try {
    const snap = await midtransService.createSnapToken({
      transaction_id: newTransaction.id.toString(),
      gross_amount: grandTotal,
      order_id: `ORD-${newTransaction.id}-${Date.now()}`,
    })

    await db
      .update(transactions)
      .set({
        snap_token: snap.token,
        snap_url: snap.redirect_url,
      })
      .where(eq(transactions.id, newTransaction.id))

    return success(c, { ...newTransaction, snap_token: snap.token }, 'Transaction created successfully')
  } catch {
    return success(c, newTransaction, 'Transaction created successfully')
  }
})

transaction.post('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const { _method, ...updateData } = body

  const [updated] = await db
    .update(transactions)
    .set(updateData)
    .where(eq(transactions.id, id))
    .returning()

  if (!updated) {
    return error(c, 'Transaction not found', 404)
  }

  return success(c, updated, 'Transaction updated successfully')
})

export default transaction
