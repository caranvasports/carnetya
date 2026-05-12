import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendLeadReminderEmail, getReminderDays } from '@/lib/email'

// This endpoint is called by a cron job (e.g. Vercel Cron) or manually from admin.
// It checks all lead_assignments that are in 'enviado' or 'visto' state and sends
// reminder emails at configured day intervals.
// Protected by CRON_SECRET or admin cookie.

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const reminderDays = await getReminderDays()
  const now = new Date()
  let sent = 0

  for (const days of reminderDays) {
    // Find assignments created exactly N days ago (within a 1h window to avoid duplicate reminders)
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString()
    const to   = new Date(now.getTime() - days * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()

    const { data: assignments } = await supabase
      .from('lead_assignments')
      .select('id, autoescuela_id, lead_id, lead:leads(ciudad_id, ciudades(nombre)), autoescuela:autoescuelas(email, nombre, plan)')
      .in('estado', ['enviado', 'visto'])
      .gte('created_at', from)
      .lte('created_at', to)

    for (const a of assignments ?? []) {
      const ae = (a as { autoescuela?: { email?: string; nombre?: string; plan?: string } }).autoescuela
      const lead = (a as { lead?: { ciudades?: { nombre?: string } } }).lead

      if (!ae?.email || ae.plan === 'free') continue

      // Check if we already sent this reminder for this assignment+days
      const { data: existing } = await supabase
        .from('lead_reminders')
        .select('id')
        .eq('lead_assignment_id', a.id)
        .eq('dias', days)
        .maybeSingle()

      if (existing) continue

      const ciudad = lead?.ciudades?.nombre ?? ''

      try {
        await sendLeadReminderEmail(
          { email: ae.email, nombre: ae.nombre ?? '' },
          { ciudad, dias: days, leadId: a.lead_id },
        )

        // Record that we sent this reminder
        await supabase.from('lead_reminders').insert({
          lead_assignment_id: a.id,
          dias: days,
          sent_at: now.toISOString(),
        })

        sent++
      } catch (e) {
        console.error('[CarnetYa] Error enviando recordatorio:', e)
      }
    }
  }

  return NextResponse.json({ ok: true, remindersSent: sent })
}
