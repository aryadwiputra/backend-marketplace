import { type MiddlewareHandler } from 'hono'
import { ZodError } from 'zod'

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json({
        message: 'Validation error',
        errors: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }, 400)
    }

    if (err instanceof Error) {
      console.error('Error:', err)
      return c.json({
        message: err.message || 'Internal server error',
      }, 500)
    }

    return c.json({
      message: 'Internal server error',
    }, 500)
  }
}
