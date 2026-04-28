import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/** Fase del alumno en texto legible */
export const FASE_LABELS: Record<string, string> = {
  pendiente_inicio:          'Pendiente inicio',
  teoria:                    'En teoría',
  pendiente_examen_teoria:   'Pdte. examen teórico',
  examen_teoria_aprobado:    'Teórico aprobado',
  practicas:                 'En prácticas',
  pendiente_examen_practico: 'Pdte. examen práctico',
  aprobado:                  '¡Aprobado!',
  abandonado:                'Abandonado',
}

export const FASE_COLORS: Record<string, string> = {
  pendiente_inicio:          'bg-gray-100 text-gray-700',
  teoria:                    'bg-blue-100 text-blue-700',
  pendiente_examen_teoria:   'bg-yellow-100 text-yellow-700',
  examen_teoria_aprobado:    'bg-indigo-100 text-indigo-700',
  practicas:                 'bg-purple-100 text-purple-700',
  pendiente_examen_practico: 'bg-orange-100 text-orange-700',
  aprobado:                  'bg-green-100 text-green-700',
  abandonado:                'bg-red-100 text-red-700',
}
