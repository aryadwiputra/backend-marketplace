import { Hono } from 'hono'
import { authService } from '../services/auth.service'
import { registerSchema, loginSchema } from '../utils/validation'
import { authMiddleware } from '../middleware/auth'
import { success, created, error, unauthorized } from '../utils/response'

const auth = new Hono()

auth.post('/register', async (c) => {
  const body = await c.req.json()

  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return error(c, result.error.errors[0].message, 400)
  }

  try {
    const data = await authService.register(result.data)
    return created(c, data, 'Registration successful')
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 400)
    }
    return error(c, 'Registration failed', 500)
  }
})

auth.post('/login', async (c) => {
  const body = await c.req.json()

  const result = loginSchema.safeParse(body)
  if (!result.success) {
    return error(c, result.error.errors[0].message, 400)
  }

  try {
    const data = await authService.login(result.data)
    return success(c, data, 'Login successful')
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 401)
    }
    return error(c, 'Login failed', 500)
  }
})

auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')

  try {
    const user = await authService.getMe(userId)
    return success(c, user)
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 404)
    }
    return error(c, 'Failed to get user', 500)
  }
})

auth.post('/logout', authMiddleware, async (c) => {
  return success(c, null, 'Logout successful')
})

export default auth
