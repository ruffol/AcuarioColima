export function getPaypalBaseUrl(): string {
  const sandbox = (process.env.PAYPAL_SANDBOX || '').trim().toLowerCase()
  const paypalEnv = (process.env.PAYPAL_ENV || '').trim().toLowerCase()
  console.log('[paypal] Sandbox env:', sandbox, '| PAYPAL_ENV:', paypalEnv)
  // Accept multiple truthy values
  const isSandbox = sandbox === 'true' || sandbox === '1' || sandbox === 'yes' || paypalEnv === 'sandbox'
  return isSandbox
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'
}

export function getPaypalClientId(): string {
  const id = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
  console.log('[paypal] getClientId found:', id ? 'YES (' + id.substring(0, 8) + '...)' : 'NO')
  return id
}

export function getPaypalClientSecret(): string {
  return process.env.PAYPAL_CLIENT_SECRET || ''
}
