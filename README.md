# CarnetFácil — Marketplace + SaaS para Autoescuelas

> El "Booking.com" de los carnets de conducir en España.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | Vercel |
| Email | Resend |
| Forms | React Hook Form + Zod |

---

## 📁 Estructura del proyecto

```
carnet-facil/
├── app/
│   ├── (main)/                  # Páginas públicas (layout con Header/Footer)
│   │   ├── page.tsx             # Home
│   │   ├── comparar/            # Formulario comparador
│   │   ├── gracias/             # Página de confirmación post-lead
│   │   ├── autoescuelas/
│   │   │   └── [ciudad]/        # /autoescuelas/madrid
│   │   │       ├── page.tsx     # Listado principal
│   │   │       ├── baratas/     # /autoescuelas/madrid/baratas
│   │   │       └── mejores/     # /autoescuelas/madrid/mejores
│   │   ├── precio-carnet-conducir/
│   │   │   └── [ciudad]/        # /precio-carnet-conducir/madrid
│   │   ├── cuanto-cuesta-carnet-conducir/
│   │   └── requisitos-carnet-conducir/
│   ├── admin/                   # Panel admin (protegido)
│   │   ├── page.tsx             # Dashboard
│   │   └── leads/               # Gestión de leads
│   ├── autoescuela/             # Panel SaaS autoescuela (protegido)
│   │   ├── dashboard/           # Resumen
│   │   ├── leads/               # Leads recibidos
│   │   └── alumnos/             # Gestión de alumnos
│   ├── api/
│   │   ├── leads/route.ts       # POST /api/leads
│   │   └── autoescuelas/        # GET/PATCH autoescuelas
│   ├── sitemap.ts               # Sitemap automático
│   └── robots.ts                # robots.txt
├── components/
│   ├── layout/                  # Header, Footer
│   ├── ui/                      # StarRating, Badge
│   ├── forms/                   # LeadForm (multi-step)
│   ├── comparator/              # SchoolCard, SchoolList, FilterBar
│   └── seo/                     # FAQSection (con schema markup)
├── lib/
│   ├── supabase/                # Cliente browser + server + service
│   ├── seo.ts                   # buildMetadata, schema.org
│   └── utils.ts                 # cn, formatPrice, etc.
├── types/index.ts               # Todos los tipos TypeScript
├── data/cities.ts               # 18 ciudades principales España
└── supabase/
    ├── schema.sql               # Schema completo BD + RLS + triggers
    └── seed.sql                 # Datos de ejemplo
```

---

## ⚡ Setup en 5 minutos

### 1. Instalar dependencias
```bash
cd carnet-facil
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta `supabase/schema.sql` en el SQL Editor
3. Ejecuta `supabase/seed.sql` para datos de ejemplo

### 3. Variables de entorno
```bash
cp .env.example .env.local
# Rellena con tus credenciales de Supabase
```

### 4. Iniciar desarrollo
```bash
npm run dev
# → http://localhost:3000
```

---

## 💰 Modelo de negocio

### Modelo 1: Venta de leads
- Leads se asignan automáticamente a autoescuelas de plan `basic` y `premium`
- Precio por lead: **5€ (basic) / 8€ (premium)**
- 3 leads máximo por solicitud (exclusividad parcial)

### Modelo 2: Suscripción SaaS
| Plan | Precio | Leads/mes | Funcionalidades |
|------|--------|-----------|-----------------|
| Free | 0€ | 0 | Solo perfil público |
| Basic | 29€/mes | 20 leads | Leads + panel alumnos básico |
| Premium | 79€/mes | 60 leads | Todo + calendario + facturas + soporte |

### Modelo 3: Comisión por conversión
- Implementable con webhook tras actualizar estado a `convertido`
- Comisión sugerida: 15-30€ por alumno matriculado

---

## 🔍 SEO Programático

Páginas generadas automáticamente para **18 ciudades × 4 variantes = 72 URLs** de ciudad + páginas informativas:

```
/autoescuelas/{ciudad}                    → Principal
/autoescuelas/{ciudad}/baratas            → Precio bajo
/autoescuelas/{ciudad}/mejores            → Mejor valoradas
/precio-carnet-conducir/{ciudad}          → Intent de precio
/cuanto-cuesta-carnet-conducir            → Informacional
/requisitos-carnet-conducir               → Informacional
/test-dgt                                 → Herramienta
```

Cada página incluye:
- ✅ `<title>` y `<meta description>` únicos y optimizados
- ✅ Schema.org (FAQPage, LocalBusiness, BreadcrumbList)
- ✅ Open Graph + Twitter Cards
- ✅ Canonical URLs
- ✅ FAQ con rich snippets
- ✅ Sitemap.xml automático
- ✅ robots.txt configurado

---

## 📊 Flujo de captación de leads

```
1. Usuario llega por SEO
2. Ve comparativa de autoescuelas
3. CTA "Comparar precios" → LeadForm (3 pasos)
4. POST /api/leads → lead guardado en BD
5. Sistema asigna lead a 3 autoescuelas premium/basic
6. Autoescuela ve lead en su panel → llama al alumno
7. Si convierte → pago de comisión
```

---

## 🚀 Deploy en Vercel

```bash
# 1. Conectar repositorio en vercel.com
# 2. Añadir variables de entorno en Vercel dashboard
# 3. Deploy automático en cada push a main
vercel deploy --prod
```

---

## 📈 Escalabilidad

### España completa
- Añadir ciudades en `data/cities.ts` + registro en Supabase
- El sitemap se regenera automáticamente
- Sin código extra — arquitectura ya preparada

### Otros países
- Duplicar proyecto con dominio local (ej: `carnetfacil.pt`)
- Adaptar textos y precios por país
- Compartir código base (monorepo con Turborepo)

### Tráfico alto
- Next.js + Vercel: auto-scaling incorporado
- Supabase: connection pooling con PgBouncer
- Páginas con `generateStaticParams` → ISR/SSG para 0ms TTFB
- Edge caching de páginas de ciudad

---

## 🔒 Seguridad

- Row Level Security (RLS) en todas las tablas
- Validación con Zod en todas las API routes
- Headers de seguridad en `next.config.ts`
- Inputs sanitizados — sin SQL injection posible
- Rate limiting básico por IP en `/api/leads`

---

## 📅 Roadmap MVP 7 días

| Día | Tarea |
|-----|-------|
| 1 | Setup Supabase + deploy base en Vercel |
| 2 | Home + ciudad Valencia con datos reales |
| 3 | Formulario de leads funcional + emails |
| 4 | Panel admin operativo |
| 5 | Panel autoescuela (leads + alumnos) |
| 6 | SEO: 5 ciudades principales + sitemap |
| 7 | Testing + ajustes + lanzamiento |
