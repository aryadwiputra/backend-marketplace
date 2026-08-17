import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { db, stores, withdrawals, storeBalances } from '../db'
import { authMiddleware } from '../middleware/auth'
import { withdrawalSchema } from '../utils/validation'
import { success, created, error, paginated } from '../utils/response'

const withdrawal = new Hono()

withdrawal.get('/all/paginated', authMiddleware, async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const perPage = parseInt(c.req.query('per_page') || '10')

  const allResults = await db
    .select()
    .from(withdrawals)
    .orderBy(desc(withdrawals.created_at))

  const total = allResults.length
  const offset = (page - 1) * perPage
  const data = allResults.slice(offset, offset + perPage)

  return paginated(c, data, { page, perPage, total })
})

withdrawal.get('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))

  const [result] = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.id, id))
    .limit(1)

  if (!result) {
    return error(c, 'Withdrawal not found', 404)
  }

  return success(c, result)
})

withdrawal.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()

  const result = withdrawalSchema.safeParse(body)
  if (!result.success) {
    return error(c, result.error.errors[0].message, 400)
  }

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.user_id, userId))
    .limit(1)

  if (!store) {
    return error(c, 'Store not found', 404)
  }

  const balance = parseFloat(store.balance || '0')

  if (balance < result.data.amount) {
    return error(c, 'Insufficient balance', 400)
  }

  const [newWithdrawal] = await db
    .insert(withdrawals)
    .values({
      ...result.data,
      store_id: store.id,
      amount: result.data.amount.toString(),
      status: 'pending',
    })
    .returning()

  return created(c, newWithdrawal, 'Withdrawal request created successfully')
})

withdrawal.post('/:id/approve', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const [withdrawalRecord] = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.id, id))
    .limit(1)

  if (!withdrawalRecord) {
    return error(c, 'Withdrawal not found', 404)
  }

  const [updated] = await db
    .update(withdrawals)
    .set({ status: body.status || 'approved' })
    .where(eq(withdrawals.id, id))
    .returning()

  if (body.status === 'approved') {
    await db
      .update(stores)
      .set({
        balance: (parseFloat(withdrawalRecord.amount) * -1).toString(),
      })
      .where(eq(stores.id, withdrawalRecord.store_id))

    await db.insert(storeBalances).values({
      store_id: withdrawalRecord.store_id,
      amount: (-parseFloat(withdrawalRecord.amount)).toString(),
      type: 'debit',
      description: `Withdrawal to ${withdrawalRecord.bank} ${withdrawalRecord.account_number}`,
    })
  }

  return success(c, updated, 'Withdrawal updated successfully')
})

export default withdrawal
