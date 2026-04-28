import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carnetyainfo@gmail.com'

export async function GET() {
  const config = {
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? '✅ configurado' : '❌ falta',
    RESEND_API_KEY: process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_placeholder') ? '✅ configurado' : '❌ falta o es placeholder',
    ADMIN_EMAIL,
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json({
      ok: false,
      mensaje: 'GMAIL_APP_PASSWORD no configurado. Añádelo en Vercel > Settings > Environment Variables',
      config,
    }, { status: 400 })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: ADMIN_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
    await transporter.sendMail({
      from: `CarnetYa <${ADMIN_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: '✅ Test email CarnetYa — funciona',
      html: '<p>Si recibes esto, el email está correctamente configurado en CarnetYa.</p>',
    })
    return NextResponse.json({ ok: true, mensaje: `Email de prueba enviado a ${ADMIN_EMAIL}`, config })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      mensaje: 'Error al enviar: ' + (err instanceof Error ? err.message : String(err)),
      config,
    }, { status: 500 })
  }
}
