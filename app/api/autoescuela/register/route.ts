import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email, password, nombre } = await req.json()

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Email y contraseña (mínimo 8 caracteres) son obligatorios' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Crear usuario directamente confirmado (sin email de verificación)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: nombre ?? '', rol: 'autoescuela' },
  })

  if (error) {
    const msg = error.message.includes('already') || error.message.includes('existe')
      ? 'Ya existe una cuenta con ese email'
      : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ ok: true, userId: data.user.id })
}
