import crypto from 'crypto'

interface SnapTokenParams {
  transaction_id: string
  gross_amount: number
  order_id: string
}

interface SnapUrlParams extends SnapTokenParams {
  customer_name: string
  customer_email: string
}

export class MidtransService {
  private serverKey: string
  private clientKey: string
  private isSandbox: boolean

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || ''
    this.isSandbox = process.env.MIDTRANS_IS_SANDBOX === 'true'
  }

  private getBaseUrl(): string {
    return this.isSandbox
      ? 'https://app.sandbox.midtrans.com'
      : 'https://app.midtrans.com'
  }

  async createSnapToken(params: SnapTokenParams): Promise<{ token: string; redirect_url: string }> {
    const orderId = params.order_id || `ORDER-${Date.now()}-${params.transaction_id}`

    const grossAmount = params.gross_amount

    const parameter = {
      transaction_details: {
        order_id,
        gross_amount,
      },
      credit_card: {
        secure: true,
      },
    }

    const response = await fetch(`${this.getBaseUrl()}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
      },
      body: JSON.stringify(parameter),
    })

    if (!response.ok) {
      throw new Error('Failed to create Midtrans snap token')
    }

    const result = await response.json()

    return {
      token: result.token,
      redirect_url: result.redirect_url,
    }
  }

  verifyNotification(notification: Record<string, unknown>): {
    orderId: string
    status: string
    transactionId: string
  } {
    const orderId = notification.order_id as string
    const statusCode = notification.status_code as string
    const transactionId = notification.transaction_id as string

    let transactionStatus: string

    switch (statusCode) {
      case '200':
        transactionStatus = 'paid'
        break
      case '201':
        transactionStatus = 'pending'
        break
      case '202':
        transactionStatus = 'denied'
        break
      default:
        transactionStatus = 'failed'
    }

    return {
      orderId,
      status: transactionStatus,
      transactionId,
    }
  }
}

export const midtransService = new MidtransService()
