import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carnetyainfo@gmail.com'
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD no configurado en Vercel env vars' }, { status: 500 })
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    // pequeño delay para evitar fuerza bruta
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const token = createAdminToken(email)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}
