import { createClient } from '@/lib/supabase/server'
import { type Autoescuela } from '@/types'
import Link from 'next/link'
import { Building2, Star, CheckCircle, XCircle } from 'lucide-react'

export default async function AdminAutoescuelasPage() {
  const supabase = await createClient()
  const { data: autoescuelas } = await supabase
    .from('autoescuelas')
    .select('*, ciudad:ciudades(nombre)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Autoescuelas</h1>
          <p className="text-gray-400 text-sm mt-1">{autoescuelas?.length ?? 0} autoescuelas registradas</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Autoescuela</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Ciudad</th>
              <th className="text-left px-5 py-3 font-medium">Plan</th>
              <th className="text-right px-5 py-3 font-medium hidden md:table-cell">Rating</th>
              <th className="text-center px-5 py-3 font-medium">Activa</th>
              <th className="text-center px-5 py-3 font-medium">Verificada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(autoescuelas ?? []).map((ae) => (
              <tr key={ae.id} className="bg-gray-900 hover:bg-gray-800/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-white">{ae.nombre}</div>
                  <div className="text-gray-500 text-xs">{ae.slug}</div>
                </td>
                <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">
                  {(ae as any).ciudad?.nombre ?? '—'}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block text-xs font-bold rounded-full px-2.5 py-0.5 ${
                    ae.plan === 'premium'
                      ? 'bg-yellow-400/20 text-yellow-300'
                      : ae.plan === 'basic'
                      ? 'bg-brand-400/20 text-brand-300'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {ae.plan}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-gray-400 hidden md:table-cell">
                  {ae.rating_promedio ? (
                    <span className="flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {ae.rating_promedio.toFixed(1)}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {ae.activa
                    ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    : <XCircle className="w-4 h-4 text-red-500 mx-auto" />}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {ae.verificada
                    ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    : <XCircle className="w-4 h-4 text-gray-600 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
