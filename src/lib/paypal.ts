export function getPaypalBaseUrl(): string {
  const sandbox = (process.env.PAYPAL_SANDBOX || '').trim().toLowerCase()
  const paypalEnv = (process.env.PAYPAL_ENV || '').trim().toLowerCase()
  // Accept multiple truthy values
  const isSandbox = sandbox === 'true' || sandbox === '1' || sandbox === 'yes' || paypalEnv === 'sandbox'
  return isSandbox
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'
}

export function getPaypalClientId(): string {
  const id = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
  return id
}

export function getPaypalClientSecret(): string {
  return process.env.PAYPAL_CLIENT_SECRET || ''
}

export async function getPayPalAccessToken(): Promise<string> {
  const baseUrl = getPaypalBaseUrl()
  const clientId = getPaypalClientId()
  const clientSecret = getPaypalClientSecret()
  const auth = Buffer.from(clientId + ':' + clientSecret).toString('base64')

  const res = await fetch(baseUrl + '/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[paypal] Token error:', errText)
    throw new Error('PayPal auth failed')
  }

  const data = await res.json()
  return data.access_token
}

export async function fetchPayPalOrder(orderId: string): Promise<any> {
  const token = await getPayPalAccessToken()
  const baseUrl = getPaypalBaseUrl()
  const res = await fetch(baseUrl + '/v2/checkout/orders/' + orderId, {
    headers: { 'Authorization': 'Bearer ' + token },
  })
  if (!res.ok) throw new Error('Failed to fetch PayPal order ' + orderId)
  return res.json()
}
