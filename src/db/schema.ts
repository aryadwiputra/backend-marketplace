import { mysqlTable, varchar, text, int, decimal, boolean, datetime, json, index } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

// Users
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('buyer'),
  avatar: varchar('avatar', { length: 500 }),
  created_at: datetime('created_at'),
  updated_at: datetime('updated_at'),
}, (table) => [
  index('email_idx').on(table.email),
])

// Stores
export const stores = mysqlTable('stores', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  description: text('description'),
  logo: varchar('logo', { length: 500 }),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0'),
  is_verified: boolean('is_verified').default(false),
  created_at: datetime('created_at'),
  updated_at: datetime('updated_at'),
}, (table) => [
  index('user_id_idx').on(table.user_id),
  index('username_idx').on(table.username),
])

// Product Categories
export const productCategories = mysqlTable('product_categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  parent_id: int('parent_id'),
  icon: varchar('icon', { length: 255 }),
  created_at: datetime('created_at'),
  updated_at: datetime('updated_at'),
}, (table) => [
  index('slug_idx').on(table.slug),
  index('parent_id_idx').on(table.parent_id),
])

// Products
export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  store_id: int('store_id').notNull().references(() => stores.id),
  category_id: int('category_id').notNull().references(() => productCategories.id),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  stock: int('stock').notNull().default(0),
  weight: int('weight').notNull().default(1),
  images: json('images').$type<string[]>().default([]),
  is_active: boolean('is_active').default(true),
  created_at: datetime('created_at'),
  updated_at: datetime('updated_at'),
}, (table) => [
  index('store_id_idx').on(table.store_id),
  index('category_id_idx').on(table.category_id),
  index('slug_idx').on(table.slug),
])

// Addresses
export const addresses = mysqlTable('addresses', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => users.id),
  label: varchar('label', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  city_name: varchar('city_name', { length: 255 }).notNull(),
  zip_code: varchar('zip_code', { length: 10 }).notNull(),
  created_at: datetime('created_at'),
}, (table) => [
  index('user_id_idx').on(table.user_id),
])

// Transactions
export const transactions = mysqlTable('transactions', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => users.id),
  store_id: int('store_id').notNull().references(() => stores.id),
  address_id: int('address_id').notNull().references(() => addresses.id),
  total: decimal('total', { precision: 15, scale: 2 }).notNull(),
  shipping: varchar('shipping', { length: 100 }).notNull(),
  shipping_cost: decimal('shipping_cost', { precision: 15, scale: 2 }).notNull(),
  shipping_type: varchar('shipping_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  snap_token: varchar('snap_token', { length: 500 }),
  snap_url: varchar('snap_url', { length: 500 }),
  created_at: datetime('created_at'),
  updated_at: datetime('updated_at'),
}, (table) => [
  index('user_id_idx').on(table.user_id),
  index('store_id_idx').on(table.store_id),
])

// Transaction Items
export const transactionItems = mysqlTable('transaction_items', {
  id: int('id').primaryKey().autoincrement(),
  transaction_id: int('transaction_id').notNull().references(() => transactions.id),
  product_id: int('product_id').notNull().references(() => products.id),
  qty: int('qty').notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
}, (table) => [
  index('transaction_id_idx').on(table.transaction_id),
  index('product_id_idx').on(table.product_id),
])

// Store Balances
export const storeBalances = mysqlTable('store_balances', {
  id: int('id').primaryKey().autoincrement(),
  store_id: int('store_id').notNull().references(() => stores.id),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description'),
  created_at: datetime('created_at'),
}, (table) => [
  index('store_id_idx').on(table.store_id),
])

// Withdrawals
export const withdrawals = mysqlTable('withdrawals', {
  id: int('id').primaryKey().autoincrement(),
  store_id: int('store_id').notNull().references(() => stores.id),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  bank: varchar('bank', { length: 100 }).notNull(),
  account_number: varchar('account_number', { length: 100 }).notNull(),
  account_name: varchar('account_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  created_at: datetime('created_at'),
  updated_at: datetime('updated_at'),
}, (table) => [
  index('store_id_idx').on(table.store_id),
])

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  store: one(stores, {
    fields: [users.id],
    references: [stores.user_id],
  }),
  addresses: many(addresses),
  transactions: many(transactions),
}))

export const storesRelations = relations(stores, ({ one, many }) => ({
  user: one(users, {
    fields: [stores.user_id],
    references: [users.id],
  }),
  products: many(products),
  transactions: many(transactions),
  balances: many(storeBalances),
  withdrawals: many(withdrawals),
}))

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  parent: one(productCategories, {
    fields: [productCategories.parent_id],
    references: [productCategories.id],
  }),
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.store_id],
    references: [stores.id],
  }),
  category: one(productCategories, {
    fields: [products.category_id],
    references: [productCategories.id],
  }),
  transactionItems: many(transactionItems),
}))

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.user_id],
    references: [addresses.id],
  }),
  transactions: many(transactions),
}))

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.user_id],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [transactions.store_id],
    references: [stores.id],
  }),
  address: one(addresses, {
    fields: [transactions.address_id],
    references: [addresses.id],
  }),
  items: many(transactionItems),
}))

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transaction_id],
    references: [transactions.id],
  }),
  product: one(products, {
    fields: [transactionItems.product_id],
    references: [products.id],
  }),
}))

export const storeBalancesRelations = relations(storeBalances, ({ one }) => ({
  store: one(stores, {
    fields: [storeBalances.store_id],
    references: [stores.id],
  }),
}))

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  store: one(stores, {
    fields: [withdrawals.store_id],
    references: [stores.id],
  }),
}))
