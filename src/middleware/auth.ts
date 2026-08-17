import { verify } from 'hono/jwt'
import type { Context, Next } from 'hono'
import { unauthorized } from '../utils/response'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(c, 'No token provided')
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verify(token, process.env.JWT_SECRET || 'secret')
    c.set('user', payload)
    c.set('userId', Number(payload.sub))
    await next()
  } catch {
    return unauthorized(c, 'Invalid or expired token')
  }
}

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user')
    if (!user) {
      return unauthorized(c, 'Unauthorized')
    }
    if (roles.length > 0 && !roles.includes(user.role)) {
      return c.json({ message: 'Forbidden: Insufficient permissions' }, 403)
    }
    await next()
  }
}

export function requirePermission(...permissions: string[]) {
  return async (c: Context, next: Next) => {
    await next()
  }
}
