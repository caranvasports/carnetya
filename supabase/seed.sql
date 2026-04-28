-- ============================================================
-- SEED — Datos iniciales para desarrollo
-- ============================================================

-- Ciudades principales de España
insert into public.ciudades (nombre, slug, provincia, comunidad_autonoma, poblacion, precio_medio_carnet, lat, lng) values
  ('Madrid',     'madrid',     'Madrid',    'Comunidad de Madrid',    3223334, 850, 40.4168, -3.7038),
  ('Barcelona',  'barcelona',  'Barcelona', 'Cataluña',               1620343, 900, 41.3851, 2.1734),
  ('Valencia',   'valencia',   'Valencia',  'Comunidad Valenciana',   794288,  780, 39.4699, -0.3763),
  ('Sevilla',    'sevilla',    'Sevilla',   'Andalucía',              684234,  750, 37.3891, -5.9845),
  ('Zaragoza',   'zaragoza',   'Zaragoza',  'Aragón',                 675301,  720, 41.6488, -0.8891),
  ('Málaga',     'malaga',     'Málaga',    'Andalucía',              571026,  740, 36.7213, -4.4213),
  ('Bilbao',     'bilbao',     'Vizcaya',   'País Vasco',             345821,  820, 43.2627, -2.9253),
  ('Alicante',   'alicante',   'Alicante',  'Comunidad Valenciana',   330525,  760, 38.3452, -0.4815),
  ('Córdoba',    'cordoba',    'Córdoba',   'Andalucía',              325701,  730, 37.8882, -4.7794),
  ('Valladolid', 'valladolid', 'Valladolid','Castilla y León',        299715,  700, 41.6523, -4.7245),
  ('Murcia',     'murcia',     'Murcia',    'Región de Murcia',       460349,  710, 37.9922, -1.1307),
  ('Palma',      'palma',      'Baleares',  'Islas Baleares',         413015,  830, 39.5696, 2.6502),
  ('Granada',    'granada',    'Granada',   'Andalucía',              232208,  740, 37.1773, -3.5986),
  ('Vitoria',    'vitoria',    'Álava',     'País Vasco',             252000,  810, 42.8467, -2.6726),
  ('Santander',  'santander',  'Cantabria', 'Cantabria',              172539,  750, 43.4623, -3.8099),
  ('Burgos',     'burgos',     'Burgos',    'Castilla y León',        177879,  690, 42.3439, -3.6966),
  ('Toledo',     'toledo',     'Toledo',    'Castilla-La Mancha',     83334,   700, 39.8628, -4.0273),
  ('Salamanca',  'salamanca',  'Salamanca', 'Castilla y León',        144614,  695, 40.9701, -5.6635);

-- Autoescuelas de ejemplo (Valencia)
with ciudad as (select id from public.ciudades where slug = 'valencia')
insert into public.autoescuelas (
  ciudad_id, nombre, slug, direccion, telefono, email,
  descripcion, precio_minimo, precio_maximo, precio_practicas,
  rating_promedio, total_reviews, activa, destacada, verificada, plan, servicios
)
select
  ciudad.id,
  nombre, slug, direccion, telefono, email,
  descripcion, precio_min, precio_max, precio_prac,
  rating, reviews, true, destacada, true, plan::plan_autoescuela, servicios
from ciudad, (values
  ('Autoescuela Valencia Centro', 'autoescuela-valencia-centro',
   'Calle Colón 45, Valencia', '963 123 456', 'info@valenciacentro.es',
   'Autoescuela en el corazón de Valencia con más de 20 años de experiencia. Ofrecemos clases teóricas y prácticas para todo tipo de carnets. Tasas de aprobado superiores al 85%.',
   700, 950, 30, 4.7, 128, true, 'premium', ARRAY['Permiso B', 'Permiso A', 'Permiso AM', 'Clases online']),
  ('Autoescuela Ruzafa', 'autoescuela-ruzafa',
   'Calle Sueca 12, Valencia', '963 234 567', 'info@autoruzafa.es',
   'En pleno barrio de Ruzafa, ofrecemos la formación más completa para obtener tu carnet de conducir. Profesores nativos en valenciano y castellano.',
   650, 850, 28, 4.5, 87, false, 'basic', ARRAY['Permiso B', 'Permiso A2']),
  ('Autoescuela Norte Valencia', 'autoescuela-norte-valencia',
   'Avenida del Cid 89, Valencia', '963 345 678', 'info@autonorte.es',
   'La autoescuela más grande del norte de Valencia. Contamos con 8 vehículos de prácticas y simuladores de última generación para que apruebes a la primera.',
   620, 800, 25, 4.3, 203, false, 'basic', ARRAY['Permiso B', 'Permiso C', 'Taxi', 'CAP']),
  ('Autoescuela Flash Valencia', 'autoescuela-flash-valencia',
   'Gran Vía Fernando el Católico 22, Valencia', '963 456 789', 'info@flashvalencia.es',
   'Especialistas en cursos intensivos. Obtén tu carnet en tiempo récord con nuestro método Flash. Examen teórico garantizado en 30 días.',
   750, 1100, 35, 4.8, 54, false, 'premium', ARRAY['Permiso B', 'Curso intensivo', 'Permiso A']),
  ('Autoescuela Benimaclet', 'autoescuela-benimaclet',
   'Calle Emilio Baró 65, Valencia', '963 567 890', 'info@autobenimaclet.es',
   'Autoescuela de barrio con trato personalizado. Formamos conductores responsables desde 1998 en el barrio universitario de Benimaclet.',
   580, 780, 22, 4.1, 156, false, 'free', ARRAY['Permiso B', 'Permiso A2']),
  ('Autoescuela DGT Express', 'autoescuela-dgt-express',
   'Calle Xàtiva 5, Valencia', '963 678 901', 'info@dgtexpress.es',
   'Tu autoescuela express en el centro de Valencia. Preparamos tus exámenes teóricos con app propia y clases prácticas adaptadas a tu horario.',
   690, 920, 30, 4.6, 92, false, 'basic', ARRAY['Permiso B', 'Permiso A', 'Formación online'])
) as t(nombre, slug, direccion, telefono, email, descripcion, precio_min, precio_max, precio_prac, rating, reviews, destacada, plan, servicios);

-- Reviews de ejemplo
with ae as (select id from public.autoescuelas where slug = 'autoescuela-valencia-centro')
insert into public.reviews (autoescuela_id, nombre_usuario, rating, titulo, texto, carnet, verificada)
select ae.id, nombre, rating, titulo, texto, carnet, true
from ae, (values
  ('Carlos M.', 5, '¡Aprobé a la primera!', 'Muy buena autoescuela, los profesores son muy pacientes y profesionales. Aprobé el práctico al primer intento. 100% recomendable.', 'Permiso B'),
  ('Laura S.', 5, 'Excelente servicio', 'El mejor sitio para sacarse el carnet en Valencia. Atienden muy bien y el precio es razonable. La app para el teórico es genial.', 'Permiso B'),
  ('Miguel R.', 4, 'Muy buena experiencia', 'Profesores muy amables y flexibles con los horarios. Tardé un poco más de lo esperado pero aprobé. Buena relación calidad-precio.', 'Permiso B'),
  ('Ana P.', 5, 'Superó mis expectativas', 'Tenía miedo porque llevo años sin conducir pero los profesores tienen mucha paciencia. Muy recomendable para quienes tienen nervios.', 'Permiso A2')
) as t(nombre, rating, titulo, texto, carnet);

-- Lead de prueba
with ciudad as (select id from public.ciudades where slug = 'valencia')
insert into public.leads (ciudad_id, nombre, telefono, email, edad, tiene_experiencia, urgencia, estado, fuente_url)
select ciudad.id, 'Juan García', '612345678', 'juan@example.com', 24, false, 'normal', 'nuevo', '/autoescuelas/valencia'
from ciudad;
