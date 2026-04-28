// ============================================================
// Tipos globales de CarnetYa
// ============================================================

export type PlanAutoescuela = 'free' | 'basic' | 'premium'
export type RolUsuario      = 'admin' | 'autoescuela' | 'usuario'
export type UrgenciaLead    = 'rapido' | 'normal'
export type EstadoLead      = 'nuevo' | 'asignado' | 'contactado' | 'convertido' | 'perdido'
export type EstadoAsignacion = 'enviado' | 'visto' | 'contactado' | 'convertido' | 'rechazado'
export type FaseAlumno =
  | 'pendiente_inicio'
  | 'teoria'
  | 'pendiente_examen_teoria'
  | 'examen_teoria_aprobado'
  | 'practicas'
  | 'pendiente_examen_practico'
  | 'aprobado'
  | 'abandonado'

// ────────────────────────────────────────────────────────────
// Entidades
// ────────────────────────────────────────────────────────────

export interface Ciudad {
  id: string
  nombre: string
  slug: string
  provincia: string
  comunidad_autonoma: string
  poblacion: number
  precio_medio_carnet: number
  lat?: number
  lng?: number
  activa: boolean
  created_at: string
}

export interface Autoescuela {
  id: string
  ciudad_id: string
  nombre: string
  slug: string
  direccion?: string
  codigo_postal?: string
  telefono?: string
  email?: string
  web?: string
  descripcion?: string
  precio_minimo?: number
  precio_maximo?: number
  precio_practicas?: number
  rating_promedio: number
  total_reviews: number
  logo_url?: string
  imagen_url?: string
  horario?: Record<string, string>
  servicios?: string[]
  activa: boolean
  destacada: boolean
  verificada: boolean
  plan: PlanAutoescuela
  plan_expires_at?: string
  created_at: string
  updated_at: string
  // joins
  ciudad?: Ciudad
  reviews?: Review[]
}

export interface Usuario {
  id: string
  role: RolUsuario
  autoescuela_id?: string
  nombre?: string
  email: string
  telefono?: string
  created_at: string
}

export interface Lead {
  id: string
  ciudad_id?: string
  nombre: string
  telefono: string
  email: string
  edad?: number
  tiene_experiencia: boolean
  urgencia: UrgenciaLead
  estado: EstadoLead
  fuente_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  notas?: string
  created_at: string
  updated_at: string
  // joins
  ciudad?: Ciudad
  asignaciones?: LeadAssignment[]
}

export interface LeadAssignment {
  id: string
  lead_id: string
  autoescuela_id: string
  precio_lead: number
  estado: EstadoAsignacion
  visto_at?: string
  contactado_at?: string
  notas?: string
  created_at: string
  // joins
  lead?: Lead
  autoescuela?: Autoescuela
}

export interface Review {
  id: string
  autoescuela_id: string
  usuario_id?: string
  nombre_usuario: string
  rating: number
  titulo?: string
  texto?: string
  carnet?: string
  verificada: boolean
  publicada: boolean
  created_at: string
}

export interface Alumno {
  id: string
  autoescuela_id: string
  lead_id?: string
  nombre: string
  apellidos?: string
  dni?: string
  telefono?: string
  email?: string
  fecha_nacimiento?: string
  fase: FaseAlumno
  clases_practicas_realizadas: number
  clases_practicas_pagadas: number
  precio_matricula?: number
  precio_clase_practica?: number
  fecha_alta: string
  fecha_examen_teoria?: string
  fecha_examen_practico?: string
  notas?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Clase {
  id: string
  autoescuela_id: string
  alumno_id: string
  fecha_inicio: string
  fecha_fin: string
  estado: 'programada' | 'realizada' | 'cancelada' | 'no_presentado'
  profesor?: string
  vehiculo?: string
  notas?: string
  created_at: string
  // joins
  alumno?: Alumno
}

// ────────────────────────────────────────────────────────────
// DTOs / Formularios
// ────────────────────────────────────────────────────────────

export interface LeadFormData {
  nombre: string
  telefono: string
  email: string
  ciudad: string   // slug
  edad: number
  tiene_experiencia: boolean
  urgencia: UrgenciaLead
}

export interface FiltrosAutoescuelas {
  ciudad?: string
  precioMax?: number
  ratingMin?: number
  servicios?: string[]
  ordenarPor?: 'rating' | 'precio' | 'reviews'
}

// ────────────────────────────────────────────────────────────
// SEO
// ────────────────────────────────────────────────────────────

export interface FAQItem {
  pregunta: string
  respuesta: string
}

export interface PageSEO {
  title: string
  description: string
  canonical: string
  ogImage?: string
}
