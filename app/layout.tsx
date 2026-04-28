import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | CarnetYa',
    default: 'CarnetYa — Encuentra tu autoescuela y consigue el mejor precio',
  },
  description:
    'Compara autoescuelas, precios y opiniones. Encuentra la mejor autoescuela cerca de ti y obtén tu carnet de conducir al mejor precio.',
  keywords: ['autoescuela', 'carnet conducir', 'precio carnet', 'comparar autoescuelas'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
