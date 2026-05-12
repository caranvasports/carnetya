INSERT INTO email_templates (id, nombre, subject, html, activa) VALUES
(
  'admin_nuevo_lead',
  'Admin: nuevo lead recibido',
  '[CarnetYa] Nuevo lead — {{nombre}} ({{ciudad}})',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0;font-size:20px">Nuevo lead CarnetYa</h1></div><div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0"><table style="width:100%"><tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:120px">Nombre</td><td style="font-weight:600">{{nombre}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Telefono</td><td style="font-weight:600">{{telefono}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="font-weight:600">{{email}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Ciudad</td><td style="font-weight:600">{{ciudad}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Urgencia</td><td style="font-weight:600">{{urgencia}}</td></tr></table><div style="margin-top:20px"><a href="{{admin_url}}" style="background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Ver en panel admin</a></div></div></div>',
  true
),
(
  'nueva_autoescuela',
  'Confirmacion nueva autoescuela',
  'Bienvenido a CarnetYa, {{nombre_autoescuela}}',
  '<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto"><h1 style="color:#1d4ed8">Bienvenido a CarnetYa</h1><p>Hola <strong>{{nombre_autoescuela}}</strong>,</p><p>Tu autoescuela ha sido registrada correctamente. Ya puedes acceder a tu panel.</p><p><a href="{{panel_url}}" style="background:#1d4ed8;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:16px 0">Acceder al panel</a></p><p style="color:#64748b;font-size:14px">Ciudad: {{ciudad}}</p><p style="color:#94a3b8;font-size:12px">CarnetYa</p></div>',
  true
),
(
  'nuevo_lead_autoescuela',
  'Nuevo lead para autoescuela registrada',
  'Nuevo alumno interesado en {{ciudad}}',
  '<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto"><div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0;font-size:20px">Nuevo alumno interesado</h1></div><div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0"><p>Hay un alumno interesado en sacarse el carnet en <strong>{{ciudad}}</strong>.</p><table style="width:100%"><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Ciudad</td><td style="font-weight:600">{{ciudad}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Urgencia</td><td style="font-weight:600">{{urgencia}}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:14px">Carnet</td><td style="font-weight:600">{{tipo_carnet}}</td></tr></table><p><a href="{{panel_url}}" style="background:#1d4ed8;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:16px 0">Ver lead en mi panel</a></p></div></div>',
  true
),
(
  'lead_no_registrada',
  'Invitacion a autoescuela no registrada',
  'Tienes alumnos esperando en {{ciudad}} - Registrate gratis',
  '<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto"><h1 style="color:#1d4ed8">Alumnos esperando en {{ciudad}}</h1><p>Hay <strong>{{num_leads}}</strong> persona(s) interesada(s) en sacarse el carnet en <strong>{{ciudad}}</strong>.</p><p>Registrate en CarnetYa para acceder a estos clientes potenciales.</p><div style="background:#f8fafc;border:2px solid #1d4ed8;border-radius:12px;padding:20px;margin:20px 0"><p style="margin:0 0 8px;font-weight:700">Como funciona</p><ul style="margin:0;padding-left:20px;color:#374151"><li>Registrate gratis en 2 minutos</li><li>Recibes leads de alumnos de tu ciudad</li><li>Pagas solo por los leads que quieras ({{precio_lead}} eur/lead)</li></ul></div><p><a href="{{registro_url}}" style="background:#1d4ed8;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:8px 4px">Registrarme gratis</a> <a href="{{paypal_url}}" style="background:#0070ba;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:8px 4px">Pagar con PayPal</a></p><p style="color:#94a3b8;font-size:12px">CarnetYa</p></div>',
  true
),
(
  'lead_reminder',
  'Recordatorio de lead sin contactar',
  'Recordatorio: alumno interesado en {{ciudad}} (hace {{dias}} dias)',
  '<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto"><h1 style="color:#dc2626">Recordatorio: lead sin contactar</h1><p>Hola <strong>{{nombre_autoescuela}}</strong>,</p><p>Hace <strong>{{dias}} dias</strong> llego un alumno interesado en <strong>{{ciudad}}</strong> y aun no ha sido contactado.</p><p><a href="{{panel_url}}" style="background:#dc2626;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin:16px 0">Ver y contactar al alumno</a></p><p style="color:#94a3b8;font-size:12px">CarnetYa</p></div>',
  true
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  subject = EXCLUDED.subject,
  html = EXCLUDED.html,
  activa = EXCLUDED.activa,
  updated_at = now();
