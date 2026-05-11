import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: 'Stripe no está configurado' }, { status: 500 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const service = createServiceClient()
  const { data: usuario } = await service.from('usuarios').select('autoescuela_id').eq('id', user.id).maybeSingle()
  if (!usuario?.autoescuela_id) return NextResponse.json({ error: 'No se encontró la autoescuela' }, { status: 400 })

  const { data: autoescuela } = await service
    .from('autoescuelas')
    .select('stripe_customer_id')
    .eq('id', usuario.autoescuela_id)
    .single()

  if (!autoescuela?.stripe_customer_id) {
    return NextResponse.json({ error: 'Todavía no hay cliente de Stripe' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.carnetya.es'
  const session = await stripe.billingPortal.sessions.create({
    customer: autoescuela.stripe_customer_id,
    return_url: `${siteUrl}/autoescuela/facturacion`,
  })

  return NextResponse.json({ url: session.url })
}
