import Link from 'next/link'
import { Car, Mail, Phone } from 'lucide-react'

const footerLinks = {
  Autoescuelas: [
    { label: 'Autoescuelas Madrid', href: '/autoescuelas/madrid' },
    { label: 'Autoescuelas Barcelona', href: '/autoescuelas/barcelona' },
    { label: 'Autoescuelas Valencia', href: '/autoescuelas/valencia' },
    { label: 'Autoescuelas Sevilla', href: '/autoescuelas/sevilla' },
    { label: 'Ver todas las ciudades', href: '/autoescuelas' },
  ],
  'Información': [
    { label: '¿Cuánto cuesta el carnet?', href: '/cuanto-cuesta-carnet-conducir' },
    { label: '¿Cuánto se tarda?', href: '/cuanto-tarda-sacarse-carnet' },
    { label: 'Requisitos carnet', href: '/requisitos-carnet-conducir' },
    { label: 'Test DGT gratis', href: '/test-dgt' },
  ],
  'Para autoescuelas': [
    { label: 'Registrar mi autoescuela', href: '/autoescuela/registro' },
    { label: 'Acceso al panel', href: '/autoescuela/login' },
    { label: 'Planes y precios', href: '/autoescuela/planes' },
  ],
  'Empresa': [
    { label: 'Sobre nosotros', href: '/sobre-nosotros' },
    { label: 'Política de privacidad', href: '/privacidad' },
    { label: 'Términos de uso', href: '/terminos' },
    { label: 'Contacto', href: '/contacto' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-main pt-16 pb-8">
        {/* Top */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span>Carnet<span className="text-cta">Ya</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              El comparador líder de autoescuelas en España. Encuentra la mejor autoescuela al mejor precio.
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:carnetyainfo@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> carnetyainfo@gmail.com
              </a>
              <a href="tel:+34900000000" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> 900 000 000
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-sm mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-800 mb-8">
          {[
            { value: '+500', label: 'Autoescuelas' },
            { value: '+10.000', label: 'Alumnos al mes' },
            { value: '4.7/5', label: 'Valoración media' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} CarnetYa — Todos los derechos reservados</p>
          <p>Hecho con ❤️ en España</p>
        </div>
      </div>
    </footer>
  )
}
