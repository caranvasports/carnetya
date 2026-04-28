'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Car, ChevronDown } from 'lucide-react'

const navLinks = [
  {
    label: 'Autoescuelas',
    href: '/autoescuelas/madrid',
    children: [
      { label: 'Madrid', href: '/autoescuelas/madrid' },
      { label: 'Barcelona', href: '/autoescuelas/barcelona' },
      { label: 'Valencia', href: '/autoescuelas/valencia' },
      { label: 'Sevilla', href: '/autoescuelas/sevilla' },
    ],
  },
  { label: 'Precio carnet', href: '/cuanto-cuesta-carnet-conducir' },
  { label: 'Test DGT', href: '/test-dgt' },
  { label: 'Guías', href: '/requisitos-carnet-conducir' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-600">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span>Carnet<span className="text-cta">Ya</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {dropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                        >
                          {child.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link
                          href="/autoescuelas/madrid"
                          className="block px-4 py-2 text-sm text-brand-600 font-medium hover:bg-gray-50"
                        >
                          Ver todas las ciudades →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA + mobile */}
          <div className="flex items-center gap-3">
            <Link
              href="/autoescuela/login"
              className="hidden md:block text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              Soy autoescuela
            </Link>
            <Link href="/comparar" className="btn-primary text-sm py-2">
              Comparar precios
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-50"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="container-main py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href ?? link.label}
                href={link.href ?? '#'}
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <Link
                href="/autoescuela/login"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                Acceso autoescuelas
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
