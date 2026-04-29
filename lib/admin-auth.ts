import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const COOKIE = 'carnetya_admin'
const SECRET = process.env.ADMIN_PASSWORD ?? 'carnetya_secret_2025'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex')
}

export function createAdminToken(email: string): string {
  const exp = Date.now() + MAX_AGE * 1000
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString('base64url')
  const sig = sign(payload)
  return `${payload}.${sig}`
}

export function verifyAdminToken(token: string): { email: string } | null {
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return null
    if (sign(payload) !== sig) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (Date.now() > data.exp) return null
    return { email: data.email }
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

export function getAdminSessionFromRequest(req: NextRequest): { email: string } | null {
  const token = req.cookies.get(COOKIE)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

export const COOKIE_NAME = COOKIE
export const COOKIE_MAX_AGE = MAX_AGE
