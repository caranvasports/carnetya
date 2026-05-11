import nodemailer from 'nodemailer'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carnetyainfo@gmail.com'

export function renderTemplate(template: string, vars: Record<string, string | number | null | undefined>) {
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
