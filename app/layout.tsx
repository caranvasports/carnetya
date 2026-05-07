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
      <head>
        {/* Microsoft Clarity */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","wj7nfcvgdz");`,
          }}
        />
        {/* Google Ads */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18145874968"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'AW-18145874968');`,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
