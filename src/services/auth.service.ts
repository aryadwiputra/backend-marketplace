import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db, users } from '../db'
import type { RegisterInput, LoginInput } from '../utils/validation'
import type { JwtPayload } from '../types'

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1)

    if (existingUser.length > 0) {
      throw new Error('Email already registered')
    }

    const hashedPassword = await bcrypt.hash(input.password, 10)

    const [newUser] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'buyer',
      })
      .returning()

    const token = await this.generateToken(newUser)

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      },
      token,
    }
  }

  async login(input: LoginInput) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1)

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password)

    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    const token = await this.generateToken(user)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        permissions: this.getPermissions(user.role),
      },
      token,
    }
  }

  async getMe(userId: number) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      permissions: this.getPermissions(user.role),
    }
  }

  private async generateToken(user: typeof users.$inferSelect) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const token = await sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    })

    return token
  }

  private getPermissions(role: string): string[] {
    const adminPermissions = [
      'dashboard-menu',
      'product-category-list',
      'product-category-create',
      'product-category-edit',
      'product-list',
      'product-create',
      'product-edit',
      'store-list',
      'store-create',
      'transaction-list',
      'store-balance-list',
      'withdrawal-list',
      'withdrawal-approve',
      'user-list',
    ]

    const sellerPermissions = [
      'dashboard-menu',
      'product-list',
      'product-create',
      'product-edit',
      'store-list',
      'transaction-list',
      'store-balance-list',
      'withdrawal-list',
      'withdrawal-create',
    ]

    const buyerPermissions = [
      'transaction-list',
    ]

    switch (role) {
      case 'admin':
        return adminPermissions
      case 'seller':
        return sellerPermissions
      case 'buyer':
        return buyerPermissions
      default:
        return []
    }
  }
}

export const authService = new AuthService()
