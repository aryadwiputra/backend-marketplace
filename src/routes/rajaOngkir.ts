import { Hono } from 'hono'
import { rajaOngkirService } from '../services/rajaOngkir.service'
import { success, error } from '../utils/response'

const rajaOngkir = new Hono()

rajaOngkir.get('/destination', async (c) => {
  const search = c.req.query('search')

  if (!search) {
    return error(c, 'Search parameter is required', 400)
  }

  try {
    const results = await rajaOngkirService.searchDestination(search)
    return success(c, results)
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 500)
    }
    return error(c, 'Failed to search destination', 500)
  }
})

rajaOngkir.post('/cost', async (c) => {
  const body = await c.req.json()

  const { origin, destination, weight, courier } = body

  if (!origin || !destination || !weight || !courier) {
    return error(c, 'Missing required parameters', 400)
  }

  try {
    const results = await rajaOngkirService.calculateCost({
      origin,
      destination,
      weight,
      courier,
    })
    return success(c, results)
  } catch (err) {
    if (err instanceof Error) {
      return error(c, err.message, 500)
    }
    return error(c, 'Failed to calculate cost', 500)
  }
})

export default rajaOngkir
