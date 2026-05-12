import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendAutoescuelaBienvenidaEmail, sendEmail } from '@/lib/email'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carnetyainfo@gmail.com'

function slugify(text: string) {

export async function POST(req: NextRequest) {
  const { email, password, nombre, nombre_autoescuela, ciudad_slug, telefono } = await req.json()

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

  const nombreMostrar = nombre_autoescuela || nombre || email

  let autoescuelaId: string | null = null
  try {
    const { data: ciudad } = ciudad_slug
      ? await supabase.from('ciudades').select('id, slug, nombre').eq('slug', ciudad_slug).maybeSingle()
      : { data: null }

    const { data: existingByEmail } = await supabase
      .from('autoescuelas')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingByEmail?.id) {
      autoescuelaId = existingByEmail.id
      await supabase.from('autoescuelas').update({
        registered_at: new Date().toISOString(),
        captacion_estado: 'registrada',
        contacto_nombre: nombre ?? null,
        telefono: telefono ?? null,
      }).eq('id', autoescuelaId)
    } else if (ciudad?.id) {
      const baseSlug = slugify(`${nombreMostrar}-${ciudad.slug}`)
      let slug = baseSlug
      let attempt = 2
      while (true) {
        const { data: existingSlug } = await supabase.from('autoescuelas').select('id').eq('slug', slug).maybeSingle()
        if (!existingSlug) break
        slug = `${baseSlug}-${attempt++}`
      }

      const { data: created } = await supabase.from('autoescuelas').insert({
        ciudad_id: ciudad.id,
        nombre: nombreMostrar,
        slug,
        email,
        telefono: telefono ?? null,
        contacto_nombre: nombre ?? null,
        activa: true,
        verificada: false,
        plan: 'free',
        servicios: ['Permiso B'],
        captacion_marcada: true,
        captacion_estado: 'registrada',
        registered_at: new Date().toISOString(),
      }).select('id').single()

      autoescuelaId = created?.id ?? null
    }

    await supabase.from('usuarios').upsert({
      id: data.user.id,
      role: 'autoescuela',
      autoescuela_id: autoescuelaId,
      nombre: nombre ?? nombreMostrar,
      email,
      telefono: telefono ?? null,
    })
  } catch (e) {
    console.error('[CarnetYa] Error vinculando autoescuela registrada:', e)
  }

  // Email de bienvenida a la autoescuela (usando template de DB)
  sendAutoescuelaBienvenidaEmail({
    email,
    nombre: nombreMostrar,
    ciudad: ciudad_slug ?? '',
  }).catch(e => console.error('[CarnetYa] Error enviando email bienvenida autoescuela:', e))

  // Email de notificación al admin
  sendEmail(
    ADMIN_EMAIL,
    `🏫 Nueva autoescuela registrada — ${nombreMostrar}`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0;font-size:20px">🏫 Nueva autoescuela registrada</h1></div><div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:140px">Autoescuela</td><td style="padding:8px 0;font-weight:600">${nombreMostrar}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${email}" style="color:#1d4ed8">${email}</a></td></tr>${telefono ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Teléfono</td><td style="padding:8px 0;font-weight:600">${telefono}</td></tr>` : ''}${ciudad_slug ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px">Ciudad</td><td style="padding:8px 0;font-weight:600">${ciudad_slug}</td></tr>` : ''}</table><a href="https://carnetya.es/admin" style="background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin-top:16px">Ver en el panel admin →</a></div></div>`,
  ).catch(e => console.error('[CarnetYa] Error enviando email admin nueva autoescuela:', e))

  return NextResponse.json({ ok: true, userId: data.user.id })
}
