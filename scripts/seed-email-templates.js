// Run: node scripts/seed-email-templates.js
const https = require('https')

const PROJECT_ID = 'iiuhavnilqrzlffvgoyx'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpdWhhdm5pbHFyemxmZnZnb3l4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU3NjA3MCwiZXhwIjoyMDk0MTUyMDcwfQ.Wy3Z9HkCZjTkjlUAGBwZY5lLcX8nNiPFZFBWOFvUHqY'

// ─── Shared design tokens ───────────────────────────────────────────────────
const brand = '#1B4FFF'
const brandDark = '#1340CC'
const bg = '#F8FAFF'
const cardBg = '#FFFFFF'
const gray = '#64748B'
const dark = '#0F172A'
const green = '#16A34A'
const red = '#DC2626'
const yellow = '#D97706'

function wrap(inner) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CarnetYa</title></head><body style="margin:0;padding:0;background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:32px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
      <!-- Header -->
      <tr><td style="background:${brand};border-radius:16px 16px 0 0;padding:28px 36px">
        <img src="https://www.carnetya.es/logo-white.png" alt="CarnetYa" height="32" style="display:block;height:32px;margin-bottom:8px" onerror="this.style.display='none'">
        <span style="color:rgba(255,255,255,0.9);font-size:13px;font-weight:500;letter-spacing:0.5px">carnetya.es</span>
      </td></tr>
      <!-- Body -->
      <tr><td style="background:${cardBg};padding:36px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0">
        ${inner}
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#F1F5F9;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;border:1px solid #E2E8F0;border-top:none">
        <p style="margin:0;color:#94A3B8;font-size:12px">CarnetYa · La plataforma de autoescuelas de España · <a href="https://www.carnetya.es" style="color:${brand};text-decoration:none">carnetya.es</a></p>
        <p style="margin:6px 0 0;color:#CBD5E1;font-size:11px">Si no esperabas este correo, puedes ignorarlo.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

function ctaBtn(href, text, color) {
  color = color || brand
  return `<table cellpadding="0" cellspacing="0" style="margin:8px 0"><tr><td style="background:${color};border-radius:10px"><a href="${href}" style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.2px">${text}</a></td></tr></table>`
}

function h1(text) {
  return `<h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:${dark};line-height:1.2">${text}</h1>`
}

function p(text, extra) {
  extra = extra || ''
  return `<p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6${extra ? ';' + extra : ''}">${text}</p>`
}

function benefit(icon, title, desc) {
  return `<tr>
    <td style="width:36px;vertical-align:top;padding:0 12px 14px 0;font-size:22px">${icon}</td>
    <td style="vertical-align:top;padding-bottom:14px">
      <span style="display:block;font-weight:700;color:${dark};font-size:14px;margin-bottom:2px">${title}</span>
      <span style="font-size:13px;color:${gray};line-height:1.5">${desc}</span>
    </td>
  </tr>`
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0">`
}

function tag(text, color) {
  color = color || brand
  return `<span style="display:inline-block;background:${color}15;color:${color};font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;margin-right:6px">${text}</span>`
}

// ─── TEMPLATES ──────────────────────────────────────────────────────────────

const TEMPLATES = [

  // 1. Admin notification — functional, data-forward
  {
    id: 'admin_nuevo_lead',
    nombre: 'Admin: nuevo lead recibido',
    subject: '[CarnetYa] Nuevo lead — {{nombre}} en {{ciudad}}',
    html: wrap(`
      ${h1('🚗 Nuevo lead recibido')}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFF;border:1px solid #E2E8F0;border-radius:12px;padding:20px;margin-bottom:24px">
        <tr><td style="padding:0">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;color:${gray};width:110px">Nombre</td><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;font-weight:700;color:${dark}">{{nombre}}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;color:${gray}">Teléfono</td><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;font-weight:700"><a href="tel:{{telefono}}" style="color:${brand}">{{telefono}}</a></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;color:${gray}">Email</td><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px"><a href="mailto:{{email}}" style="color:${brand}">{{email}}</a></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;color:${gray}">Ciudad</td><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;font-weight:700;color:${dark}">{{ciudad}}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:${gray}">Urgencia</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:${dark}">{{urgencia}}</td></tr>
          </table>
        </td></tr>
      </table>
      ${ctaBtn('{{admin_url}}', 'Ver lead en el panel →')}
    `)
  },

  // 2. Welcome to new autoescuela
  {
    id: 'nueva_autoescuela',
    nombre: 'Bienvenida nueva autoescuela',
    subject: '¡Bienvenido a CarnetYa, {{nombre_autoescuela}}! Empieza a conseguir alumnos hoy',
    html: wrap(`
      ${h1('¡Bienvenido a CarnetYa! 🎉')}
      ${p('Hola <strong>{{nombre_autoescuela}}</strong>, tu autoescuela ya está activa en CarnetYa. A partir de ahora, cuando un alumno busque autoescuela en <strong>{{ciudad}}</strong>, podrás aparecer entre las primeras opciones y recibir sus datos directamente.')}
      ${divider()}
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${dark};text-transform:uppercase;letter-spacing:0.5px">¿Qué consigues con CarnetYa?</p>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        ${benefit('🎯', 'Alumnos de tu ciudad, en tiempo real', 'Recibe leads de personas que quieren sacarse el carnet exactamente donde tú operas.')}
        ${benefit('📱', 'Panel todo en uno', 'Gestiona leads, alumnos, clases y facturación desde un único lugar.')}
        ${benefit('💸', 'Solo pagas si recibes alumnos', 'Sin cuota fija. Paga únicamente por los leads que contactas.')}
        ${benefit('⚡', 'Más rápido que nunca', 'Recibes el aviso en segundos y puedes llamar al alumno antes que la competencia.')}
      </table>
      ${divider()}
      ${ctaBtn('{{panel_url}}', 'Acceder a mi panel →')}
      ${p('Si tienes cualquier duda, responde a este email y te ayudamos. ¡Mucho éxito!', 'font-size:14px;color:#64748B')}
    `)
  },

  // 3. New lead for registered autoescuela
  {
    id: 'nuevo_lead_autoescuela',
    nombre: 'Nuevo lead para autoescuela registrada',
    subject: '🔔 Nuevo alumno en {{ciudad}} — contacta ya antes que la competencia',
    html: wrap(`
      <div style="background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:4px solid ${brand}">
        <p style="margin:0;font-size:13px;font-weight:700;color:${brand};text-transform:uppercase;letter-spacing:0.5px">Lead recibido ahora mismo</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:${dark}">Alumno interesado en {{ciudad}}</p>
      </div>
      ${h1('¡Date prisa, el tiempo importa!')}
      ${p('Acaba de llegar una persona que quiere sacarse el carnet en <strong>{{ciudad}}</strong>. Las autoescuelas que contactan en los primeros 10 minutos convierten <strong>8 veces más</strong>.')}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFF;border:1px solid #E2E8F0;border-radius:12px;padding:16px 20px;margin-bottom:24px">
        <tr>
          <td style="padding:6px 16px 6px 0;font-size:13px;color:${gray}">📍 Ciudad</td><td style="font-size:14px;font-weight:700;color:${dark};padding:6px 0">{{ciudad}}</td>
          <td style="padding:6px 16px 6px 0;font-size:13px;color:${gray}">⚡ Urgencia</td><td style="font-size:14px;font-weight:700;color:${dark};padding:6px 0">{{urgencia}}</td>
        </tr>
        <tr>
          <td style="padding:6px 16px 6px 0;font-size:13px;color:${gray}">🎓 Carnet</td><td style="font-size:14px;font-weight:700;color:${dark};padding:6px 0">{{tipo_carnet}}</td>
        </tr>
      </table>
      ${ctaBtn('{{panel_url}}', '🚀 Ver datos completos y llamar →')}
      ${p('Los datos de contacto del alumno están disponibles en tu panel ahora mismo.', 'font-size:13px;color:#64748B')}
    `)
  },

  // 4. Invite to unregistered autoescuela
  {
    id: 'lead_no_registrada',
    nombre: 'Invitación a autoescuela no registrada',
    subject: '{{num_leads}} alumno(s) buscando autoescuela en {{ciudad}} — ¿los atiendes tú?',
    html: wrap(`
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center">
        <p style="margin:0;font-size:32px;font-weight:900;color:${yellow}">{{num_leads}}</p>
        <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#92400E">alumno(s) buscando autoescuela en <strong>{{ciudad}}</strong> ahora mismo</p>
      </div>
      ${h1('¿Tu autoescuela no está en CarnetYa?')}
      ${p('Estos alumnos van a elegir <em>alguna</em> autoescuela. Si la tuya no está registrada, ese alumno irá a tu competencia. Es así de simple.')}
      ${divider()}
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${dark};text-transform:uppercase;letter-spacing:0.5px">Por qué CarnetYa</p>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        ${benefit('💰', `Solo ${'{'}{'{'}{'{'}precio_lead${'}'}${'}'}${'}'}${'}'}€ por lead`, 'Sin cuotas mensuales. Paga solo cuando recibes un alumno real interesado.')}
        ${benefit('⚡', 'En 2 minutos estás operativo', 'Registro gratuito. Acceso inmediato a leads de tu ciudad.')}
        ${benefit('📈', '+40% de conversión media', 'Nuestros alumnos buscan activamente autoescuela. No son contactos fríos.')}
        ${benefit('🛡️', 'Sin compromiso de permanencia', 'Úsalo cuando quieras, para siempre o solo esta temporada.')}
      </table>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px">${ctaBtn('{{registro_url}}', '✅ Registrarme gratis →', green)}</td>
          <td>${ctaBtn('{{paypal_url}}', '💳 Pagar con PayPal →', '#0070BA')}</td>
        </tr>
      </table>
      ${p(`Precio por lead: <strong>{{precio_lead}}€</strong>. Sin letra pequeña.`, 'font-size:13px;color:#64748B;margin-top:16px')}
    `)
  },

  // 5. Reminder for uncontacted lead
  {
    id: 'lead_reminder',
    nombre: 'Recordatorio: lead sin contactar',
    subject: '⏰ Llevas {{dias}} día(s) sin contactar a un alumno de {{ciudad}}',
    html: wrap(`
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:4px solid ${red}">
        <p style="margin:0;font-size:13px;font-weight:700;color:${red};text-transform:uppercase;letter-spacing:0.5px">Atención requerida</p>
        <p style="margin:4px 0 0;font-size:18px;font-weight:800;color:#7F1D1D">Lead sin contactar desde hace {{dias}} día(s)</p>
      </div>
      ${h1('El alumno todavía está buscando autoescuela')}
      ${p('Hola <strong>{{nombre_autoescuela}}</strong>, hace <strong>{{dias}} día(s)</strong> recibiste un lead de un alumno en <strong>{{ciudad}}</strong> y aún no has registrado contacto.')}
      ${p('Los alumnos suelen elegir en 48-72 horas. Si aún no te has puesto en contacto, ahora es el momento.')}
      ${divider()}
      ${ctaBtn('{{panel_url}}', '📞 Contactar al alumno ahora →', red)}
      ${p('Si ya lo has contactado, márcalo como "Contactado" en tu panel para no recibir más recordatorios.', 'font-size:13px;color:#64748B')}
    `)
  },
]

// ─── Upload to Supabase ──────────────────────────────────────────────────────

function patch(id, subject, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ subject, html, activa: true })
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      path: `/rest/v1/email_templates?id=eq.${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(options, (res) => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        console.log(`  ${res.statusCode === 204 ? '✅' : '⚠️ ' + res.statusCode} ${id}`)
        resolve()
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function run() {
  console.log('Seeding email templates...\n')
  for (const t of TEMPLATES) {
    await patch(t.id, t.subject, t.html)
  }
  console.log('\nDone.')
}

run().catch(console.error)
