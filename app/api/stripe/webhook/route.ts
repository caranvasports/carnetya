import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) return NextResponse.json({ error: 'Stripe webhook no configurado' }, { status: 500 })

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Falta firma' }, { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json({ error: `Webhook inválido: ${String(error)}` }, { status: 400 })
  }

  const service = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const autoescuelaId = session.metadata?.autoescuela_id
    if (autoescuelaId && session.subscription) {
      await service.from('autoescuelas').update({
        plan: 'basic',
        verificada: true,
        captacion_estado: 'registrada_pago',
        stripe_subscription_id: String(session.subscription),
        stripe_subscription_status: 'active',
      }).eq('id', autoescuelaId)
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const autoescuelaId = subscription.metadata?.autoescuela_id
    if (autoescuelaId) {
      await service.from('autoescuelas').update({
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
        plan: subscription.status === 'active' || subscription.status === 'trialing' ? 'basic' : 'free',
      }).eq('id', autoescuelaId)
    }
  }

  return NextResponse.json({ received: true })
}
