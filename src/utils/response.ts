import type { Context } from 'hono'
import type { ApiResponse } from '../types'

export function success<T>(c: Context, data: T, message = 'Success', meta?: ApiResponse['meta']): Response {
  const response: ApiResponse<T> = {
    data,
    message,
  }
  if (meta) {
    response.meta = meta
  }
  return c.json(response, 200)
}

export function created<T>(c: Context, data: T, message = 'Created successfully'): Response {
  return c.json({
    data,
    message,
  }, 201)
}

export function error(c: Context, message: string, status = 400): Response {
  return c.json({
    message,
  }, status)
}

export function unauthorized(c: Context, message = 'Unauthorized'): Response {
  return c.json({
    message,
  }, 401)
}

export function forbidden(c: Context, message = 'Forbidden'): Response {
  return c.json({
    message,
  }, 403)
}

export function notFound(c: Context, message = 'Not found'): Response {
  return c.json({
    message,
  }, 404)
}

export function serverError(c: Context, message = 'Internal server error'): Response {
  return c.json({
    message,
  }, 500)
}

export function paginated<T>(
  c: Context,
  data: T[],
  meta: {
    page: number
    perPage: number
    total: number
  }
): Response {
  return c.json({
    data,
    message: 'Success',
    meta: {
      current_page: meta.page,
      last_page: Math.ceil(meta.total / meta.perPage),
      per_page: meta.perPage,
      total: meta.total,
    },
  })
}
