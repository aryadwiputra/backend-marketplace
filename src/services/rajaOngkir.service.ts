export class RajaOngkirService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.RAJA_ONGKIR_API_KEY || ''
    this.baseUrl = 'https://rajaongkir.komerce.id/api'
  }

  async searchDestination(keyword: string): Promise<Array<{
    id: string
    label: string
    city_name: string
    zip_code: string
  }>> {
    const response = await fetch(`${this.baseUrl}/v1/destination/domestic-destination?search=${encodeURIComponent(keyword)}`, {
      headers: {
        key: this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to search destination')
    }

    const result = await response.json()
    return result.data || []
  }

  async calculateCost(params: {
    origin: string
    destination: string
    weight: number
    courier: string
  }): Promise<Array<{
    code: string
    name: string
    costs: Array<{
      service: string
      cost: Array<{
        value: number
        etd: string
        note: string
      }>
    }>
  }>> {
    const formData = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      weight: params.weight.toString(),
      courier: params.courier,
    })

    const response = await fetch(`${this.baseUrl}/v1/calculate/domestic-cost`, {
      method: 'POST',
      headers: {
        key: this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      throw new Error('Failed to calculate shipping cost')
    }

    const result = await response.json()
    return result.data || []
  }
}

export const rajaOngkirService = new RajaOngkirService()
