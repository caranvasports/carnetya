import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/admin-auth'

export async function POST() {
  const res = NextResponse.redirect(
    new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carnetya.es')
  )
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return res
}
