import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(key, { typescript: true })
  }
  return _stripe
}

export function formatAmountForStripe(amount: number, currency: string): number {
  const currencyMap: Record<string, number> = {
    MXN: 100,
    USD: 100,
  }
  const factor = currencyMap[currency.toUpperCase()] ?? 100
  return Math.round(amount * factor)
}
