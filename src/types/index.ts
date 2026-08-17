export interface ApiResponse<T = unknown> {
  data?: T
  message: string
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface JwtPayload {
  sub: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface User {
  id: number
  name: string
  email: string
  password: string
  role: 'admin' | 'seller' | 'buyer'
  avatar?: string
  permissions?: string[]
  created_at: Date
  updated_at?: Date
}

export interface Store {
  id: number
  user_id: number
  name: string
  username: string
  description?: string
  logo?: string
  balance: number
  is_verified: boolean
  created_at: Date
  updated_at?: Date
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
  parent_id?: number
  icon?: string
  created_at: Date
  updated_at?: Date
}

export interface Product {
  id: number
  store_id: number
  category_id: number
  name: string
  slug: string
  description?: string
  price: number
  stock: number
  weight: number
  images: string[]
  is_active: boolean
  created_at: Date
  updated_at?: Date
}

export interface Address {
  id: number
  user_id: number
  label: string
  city: string
  city_name: string
  zip_code: string
  created_at: Date
}

export interface Transaction {
  id: number
  user_id: number
  store_id: number
  address_id: number
  total: number
  shipping: string
  shipping_cost: number
  shipping_type: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  snap_token?: string
  snap_url?: string
  created_at: Date
  updated_at?: Date
}

export interface TransactionItem {
  id: number
  transaction_id: number
  product_id: number
  qty: number
  price: number
}

export interface StoreBalance {
  id: number
  store_id: number
  amount: number
  type: 'credit' | 'debit'
  description: string
  created_at: Date
}

export interface Withdrawal {
  id: number
  store_id: number
  amount: number
  bank: string
  account_number: string
  account_name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: Date
  updated_at?: Date
}
