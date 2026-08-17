import { z } from 'zod'

// Auth
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Product Category
export const productCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  parent_id: z.number().optional(),
  icon: z.string().optional(),
})

// Product
export const productSchema = z.object({
  store_id: z.number(),
  category_id: z.number(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative integer'),
  weight: z.number().min(1, 'Weight is required'),
  images: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
})

// Store
export const storeSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9_]+$/, 'Username must be lowercase alphanumeric with underscores'),
  description: z.string().optional(),
  logo: z.string().optional(),
})

// Transaction
export const transactionSchema = z.object({
  store_id: z.number(),
  address_id: z.number(),
  shipping: z.string().min(1, 'Shipping courier is required'),
  shipping_type: z.string().min(1, 'Shipping type is required'),
  products: z.array(z.object({
    product_id: z.number(),
    qty: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one product is required'),
})

// Withdrawal
export const withdrawalSchema = z.object({
  amount: z.number().min(10000, 'Minimum withdrawal is Rp 10,000'),
  bank: z.string().min(1, 'Bank is required'),
  account_number: z.string().min(1, 'Account number is required'),
  account_name: z.string().min(1, 'Account name is required'),
})

// Address
export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  city: z.string().min(1, 'City ID is required'),
  city_name: z.string().min(1, 'City name is required'),
  zip_code: z.string().min(1, 'ZIP code is required'),
})

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProductCategoryInput = z.infer<typeof productCategorySchema>
export type ProductInput = z.infer<typeof productSchema>
export type StoreInput = z.infer<typeof storeSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type WithdrawalInput = z.infer<typeof withdrawalSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
