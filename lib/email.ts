import nodemailer from 'nodemailer'
import { createServiceClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carnetyainfo@gmail.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carnetya.es'

export type EmailVars = Record<string, string | number | null | undefined>

export function renderTemplate(template: string, vars: EmailVars) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => String(vars[key] ?? ''))
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.GMAIL_APP_PASSWORD) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: ADMIN_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
    await transporter.sendMail({ from: `CarnetYa <${ADMIN_EMAIL}>`, to, subject, html })
    return { sent: true, provider: 'gmail' }
  }

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && !resendKey.startsWith('re_placeholder')) {
    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? `CarnetYa <noreply@carnetya.es>`,
      to,
      subject,
      html,
    })
    return { sent: true, provider: 'resend' }
  }

  console.warn('[CarnetYa] EMAIL NO ENVIADO: faltan GMAIL_APP_PASSWORD o RESEND_API_KEY')
  return { sent: false, provider: 'none' }
}

// ─── Template helpers ───────────────────────────────────────────────────────

async function getTemplate(id: string): Promise<{ subject: string; html: string } | null> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('email_templates')
      .select('subject, html')
      .eq('id', id)
      .eq('activa', true)
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}

async function getConfig(key: string): Promise<string | null> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('email_config')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    return data?.value ?? null
  } catch {
    return null
  }
}

// ─── Concrete email senders ─────────────────────────────────────────────────

/** Email al admin cuando llega un nuevo lead */
export async function sendAdminNewLeadEmail(lead: {
  nombre: string; telefono: string; email: string; ciudad: string
  urgencia: string; tipo_carnet?: string; utm_source?: string
}) {
  const tpl = await getTemplate('admin_nuevo_lead')
  if (!tpl) return

  const vars: EmailVars = {
    ...lead,
    urgencia: lead.urgencia === 'rapido' ? '🔴 URGENTE' : '🟡 Normal',
    tipo_carnet: lead.tipo_carnet ?? 'B (coche)',
    utm_source: lead.utm_source ?? '',
    admin_url: `${SITE_URL}/admin/leads`,
  }

  await sendEmail(ADMIN_EMAIL, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Email a la autoescuela registrada cuando llega un lead de su ciudad */
export async function sendAutoescuelaNewLeadEmail(autoescuela: {
  email: string; nombre: string; ciudad: string
}, lead: {
  ciudad: string; urgencia: string; tipo_carnet?: string
}, leadId: string) {
  const tpl = await getTemplate('nuevo_lead_autoescuela')
  if (!tpl) return

  const vars: EmailVars = {
    nombre_autoescuela: autoescuela.nombre,
    ciudad: lead.ciudad,
    urgencia: lead.urgencia === 'rapido' ? '🔴 URGENTE' : '🟡 Normal',
    tipo_carnet: lead.tipo_carnet ?? 'B (coche)',
    panel_url: `${SITE_URL}/autoescuela/leads`,
  }

  await sendEmail(autoescuela.email, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Email de confirmación al crear una nueva autoescuela */
export async function sendAutoescuelaBienvenidaEmail(autoescuela: {
  email: string; nombre: string; ciudad: string
}) {
  const tpl = await getTemplate('nueva_autoescuela')
  if (!tpl) return

  const vars: EmailVars = {
    nombre_autoescuela: autoescuela.nombre,
    ciudad: autoescuela.ciudad,
    panel_url: `${SITE_URL}/autoescuela/dashboard`,
  }

  await sendEmail(autoescuela.email, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Email a autoescuela NO registrada invitándola a registrarse */
export async function sendInvitacionAutoescuelaEmail(destEmail: string, params: {
  ciudad: string; numLeads?: number
}) {
  const tpl = await getTemplate('lead_no_registrada')
  if (!tpl) return

  const precioLead = await getConfig('lead_price') ?? '8'
  const paypalUrl = await getConfig('paypal_url') ?? 'https://www.paypal.com/paypalme/carnetya'

  const vars: EmailVars = {
    ciudad: params.ciudad,
    num_leads: params.numLeads ?? 1,
    precio_lead: precioLead,
    registro_url: `${SITE_URL}/autoescuela/registro`,
    paypal_url: paypalUrl,
  }

  await sendEmail(destEmail, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Email de recordatorio para lead sin contactar */
export async function sendLeadReminderEmail(autoescuela: {
  email: string; nombre: string
}, lead: {
  ciudad: string; dias: number; leadId: string
}) {
  const tpl = await getTemplate('lead_reminder')
  if (!tpl) return

  const vars: EmailVars = {
    nombre_autoescuela: autoescuela.nombre,
    ciudad: lead.ciudad,
    dias: lead.dias,
    panel_url: `${SITE_URL}/autoescuela/leads`,
  }

  await sendEmail(autoescuela.email, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Devuelve los días de recordatorio configurados (array de números) */
export async function getReminderDays(): Promise<number[]> {
  const raw = await getConfig('lead_reminder_days') ?? '1,3,7'
  return raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0)' }
  }

  console.warn('[CarnetYa] EMAIL NO ENVIADO: faltan GMAIL_APP_PASSWORD o RESEND_API_KEY')
  return { sent: false, provider: 'none' }
}

// ─── Template helpers ───────────────────────────────────────────────────────

async function getTemplate(id: string): Promise<{ subject: string; html: string } | null> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('email_templates')
      .select('subject, html')
      .eq('id', id)
      .eq('activa', true)
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}

async function getConfig(key: string): Promise<string | null> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('email_config')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    return data?.value ?? null
  } catch {
    return null
  }
}

// ─── Concrete email senders ─────────────────────────────────────────────────

/** Email al admin cuando llega un nuevo lead */
export async function sendAdminNewLeadEmail(lead: {
  nombre: string; telefono: string; email: string; ciudad: string
  urgencia: string; tipo_carnet?: string; utm_source?: string
}) {
  const tpl = await getTemplate('admin_nuevo_lead')
  if (!tpl) return

  const vars: EmailVars = {
    ...lead,
    urgencia: lead.urgencia === 'rapido' ? '🔴 URGENTE' : '🟡 Normal',
    tipo_carnet: lead.tipo_carnet ?? 'B (coche)',
    utm_source: lead.utm_source ?? '',
    admin_url: `${SITE_URL}/admin/leads`,
  }

  await sendEmail(ADMIN_EMAIL, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Email a la autoescuela registrada cuando llega un lead de su ciudad */
export async function sendAutoescuelaNewLeadEmail(autoescuela: {
  email: string; nombre: string; ciudad: string
}, lead: {
  ciudad: string; urgencia: string; tipo_carnet?: string
}, leadId: string) {
  const tpl = await getTemplate('nuevo_lead_autoescuela')
  if (!tpl) return

  const vars: EmailVars = {
    nombre_autoescuela: autoescuela.nombre,
    ciudad: lead.ciudad,
    urgencia: lead.urgencia === 'rapido' ? '🔴 URGENTE' : '🟡 Normal',
    tipo_carnet: lead.tipo_carnet ?? 'B (coche)',
    panel_url: `${SITE_URL}/autoescuela/leads`,
  }

  await sendEmail(autoescuela.email, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Email de confirmación al crear una nueva autoescuela */
export async function sendAutoescuelaBienvenidaEmail(autoescuela: {
  email: string; nombre: string; ciudad: string
}) {
  const tpl = await getTemplate('nueva_autoescuela')
  if (!tpl) return

  const vars: EmailVars = {
    nombre_autoescuela: autoescuela.nombre,
    ciudad: autoescuela.ciudad,
    panel_url: `${SITE_URL}/autoescuela/dashboard`,
  }

  await sendEmail(autoescuela.email, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Email a autoescuela NO registrada invitándola a registrarse */
export async function sendInvitacionAutoescuelaEmail(destEmail: string, params: {
  ciudad: string; numLeads?: number
}) {
  const tpl = await getTemplate('lead_no_registrada')
  if (!tpl) return

  const precioLead = await getConfig('lead_price') ?? '8'
  const paypalUrl = await getConfig('paypal_url') ?? 'https://www.paypal.com/paypalme/carnetya'

  const vars: EmailVars = {
    ciudad: params.ciudad,
    num_leads: params.numLeads ?? 1,
    precio_lead: precioLead,
    registro_url: `${SITE_URL}/autoescuela/registro`,
    paypal_url: paypalUrl,
  }

  await sendEmail(destEmail, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Email de recordatorio para lead sin contactar */
export async function sendLeadReminderEmail(autoescuela: {
  email: string; nombre: string
}, lead: {
  ciudad: string; dias: number; leadId: string
}) {
  const tpl = await getTemplate('lead_reminder')
  if (!tpl) return

  const vars: EmailVars = {
    nombre_autoescuela: autoescuela.nombre,
    ciudad: lead.ciudad,
    dias: lead.dias,
    panel_url: `${SITE_URL}/autoescuela/leads`,
  }

  await sendEmail(autoescuela.email, renderTemplate(tpl.subject, vars), renderTemplate(tpl.html, vars))
}

/** Devuelve los días de recordatorio configurados (array de números) */
export async function getReminderDays(): Promise<number[]> {
  const raw = await getConfig('lead_reminder_days') ?? '1,3,7'
  return raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0)
}
