import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStripe, STRIPE_PRICE_IDS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { plan } = await req.json().catch(() => ({ plan: 'basic' }))
  if (plan !== 'basic') {
    return NextResponse.json({ error: 'El plan avanzado todavía no está disponible' }, { status: 400 })
  }

  const stripe = getStripe()
  const priceId = STRIPE_PRICE_IDS.basic
  if (!stripe || !priceId) {
    return NextResponse.json({ error: 'Stripe no está configurado. Faltan STRIPE_SECRET_KEY o STRIPE_PRICE_BASIC_ID.' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const service = createServiceClient()
  const { data: usuario } = await service
    .from('usuarios')
    .select('autoescuela_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!usuario?.autoescuela_id) {
    return NextResponse.json({ error: 'No se encontró la autoescuela asociada' }, { status: 400 })
  }

  const { data: autoescuela } = await service
    .from('autoescuelas')
    .select('id, nombre, stripe_customer_id')
    .eq('id', usuario.autoescuela_id)
    .single()

  let customerId = autoescuela?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: autoescuela?.nombre ?? user.email,
      metadata: { autoescuela_id: usuario.autoescuela_id, user_id: user.id },
    })
    customerId = customer.id
    await service.from('autoescuelas').update({ stripe_customer_id: customerId }).eq('id', usuario.autoescuela_id)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.carnetya.es'
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/autoescuela/facturacion?checkout=success`,
    cancel_url: `${siteUrl}/autoescuela/facturacion?checkout=cancel`,
    metadata: { autoescuela_id: usuario.autoescuela_id, plan: 'basic' },
    subscription_data: { metadata: { autoescuela_id: usuario.autoescuela_id, plan: 'basic' } },
  })

  return NextResponse.json({ url: session.url })
}
