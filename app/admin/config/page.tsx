import { getAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { CheckCircle, XCircle, Settings, Mail, CreditCard, Database, Globe } from 'lucide-react'

function EnvRow({ label, var: varName, value, sensitive = true }: { label: string; var: string; value: string | undefined; sensitive?: boolean }) {
  const ok = Boolean(value)
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div>
        <p className="text-sm text-white">{label}</p>
        <p className="text-xs text-gray-500 font-mono">{varName}</p>
      </div>
      <div className="flex items-center gap-3">
        {ok && !sensitive && (
          <span className="text-xs text-gray-400 font-mono max-w-[200px] truncate">{value}</span>
        )}
        {ok && sensitive && (
          <span className="text-xs text-gray-500 font-mono">••••••••••••</span>
        )}
        {ok ? (
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        )}
      </div>
    </div>
  )
}

export default async function AdminConfigPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY
  const postgresUrl = process.env.POSTGRES_URL_NON_POOLING
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const stripePriceBasic = process.env.STRIPE_PRICE_BASIC_ID
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  const gmailUser = process.env.GMAIL_USER
  const resendKey = process.env.RESEND_API_KEY
  const adminPassword = process.env.ADMIN_PASSWORD
  const nextPublicUrl = process.env.NEXT_PUBLIC_SITE_URL

  const groups = [
    {
      title: 'Supabase',
      icon: Database,
      items: [
        { label: 'URL pública', var: 'NEXT_PUBLIC_SUPABASE_URL', value: supabaseUrl, sensitive: false },
        { label: 'Anon key', var: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: supabaseAnon },
        { label: 'Service role key', var: 'SUPABASE_SERVICE_ROLE_KEY', value: supabaseService },
        { label: 'Postgres direct URL', var: 'POSTGRES_URL_NON_POOLING', value: postgresUrl },
      ],
    },
    {
      title: 'Stripe',
      icon: CreditCard,
      items: [
        { label: 'Secret key', var: 'STRIPE_SECRET_KEY', value: stripeSecret },
        { label: 'Price ID (Basic)', var: 'STRIPE_PRICE_BASIC_ID', value: stripePriceBasic, sensitive: false },
        { label: 'Webhook secret', var: 'STRIPE_WEBHOOK_SECRET', value: stripeWebhook },
      ],
    },
    {
      title: 'Email',
      icon: Mail,
      items: [
        { label: 'Gmail usuario', var: 'GMAIL_USER', value: gmailUser, sensitive: false },
        { label: 'Gmail App Password', var: 'GMAIL_APP_PASSWORD', value: gmailPass },
        { label: 'Resend API key (fallback)', var: 'RESEND_API_KEY', value: resendKey },
      ],
    },
    {
      title: 'General',
      icon: Globe,
      items: [
        { label: 'URL pública del sitio', var: 'NEXT_PUBLIC_SITE_URL', value: nextPublicUrl, sensitive: false },
        { label: 'Admin password', var: 'ADMIN_PASSWORD', value: adminPassword },
      ],
    },
  ]

  const totalOk = groups.flatMap((g) => g.items).filter((i) => Boolean(i.value)).length
  const totalItems = groups.flatMap((g) => g.items).length

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-gray-400" /> Configuración</h1>
        <p className="text-gray-400 text-sm mt-1">
          Variables de entorno · {totalOk}/{totalItems} configuradas
        </p>
      </div>

      {!stripeSecret && (
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 mb-6 text-sm text-amber-300">
          <strong>Stripe no configurado.</strong> Los planes de pago y webhooks no funcionarán hasta que añadas <span className="font-mono">STRIPE_SECRET_KEY</span>, <span className="font-mono">STRIPE_PRICE_BASIC_ID</span> y <span className="font-mono">STRIPE_WEBHOOK_SECRET</span> en Vercel → Settings → Environment Variables.
        </div>
      )}
      {!gmailPass && !resendKey && (
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 mb-6 text-sm text-amber-300">
          <strong>Email no configurado.</strong> Los emails de captación no se enviarán. Añade <span className="font-mono">GMAIL_APP_PASSWORD</span> (+ <span className="font-mono">GMAIL_USER</span>) o <span className="font-mono">RESEND_API_KEY</span>.
        </div>
      )}

      <div className="space-y-5">
        {groups.map(({ title, icon: Icon, items }) => (
          <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Icon className="w-4 h-4 text-gray-400" /> {title}
            </h2>
            <div className="divide-y divide-gray-800">
              {items.map((item) => (
                <EnvRow key={item.var} label={item.label} var={item.var} value={item.value} sensitive={item.sensitive !== false} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Acciones de mantenimiento</h2>
        <p className="text-xs text-gray-400 mb-4">
          Si recientemente activaste Supabase o añadiste nuevas tablas, ejecuta el setup de BD para crear las tablas necesarias.
        </p>
        <a
          href="/admin/leads"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm"
        >
          <Database className="w-4 h-4" /> Ir a Setup BD (panel de leads)
        </a>
      </div>
    </div>
  )
}
