import Stripe from 'stripe'

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return null
  return new Stripe(secretKey)
}

export const STRIPE_PRICE_IDS = {
  basic: process.env.STRIPE_PRICE_BASIC_ID,
  premium: process.env.STRIPE_PRICE_PREMIUM_ID,
}
