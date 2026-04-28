// Lista estática de ciudades para generación estática de rutas SEO
export const CIUDADES = [
  { nombre: 'Madrid',     slug: 'madrid',     provincia: 'Madrid',     poblacion: 3223334 },
  { nombre: 'Barcelona',  slug: 'barcelona',  provincia: 'Barcelona',  poblacion: 1620343 },
  { nombre: 'Valencia',   slug: 'valencia',   provincia: 'Valencia',   poblacion: 794288  },
  { nombre: 'Sevilla',    slug: 'sevilla',    provincia: 'Sevilla',    poblacion: 684234  },
  { nombre: 'Zaragoza',   slug: 'zaragoza',   provincia: 'Zaragoza',   poblacion: 675301  },
  { nombre: 'Málaga',     slug: 'malaga',     provincia: 'Málaga',     poblacion: 571026  },
  { nombre: 'Bilbao',     slug: 'bilbao',     provincia: 'Vizcaya',    poblacion: 345821  },
  { nombre: 'Alicante',   slug: 'alicante',   provincia: 'Alicante',   poblacion: 330525  },
  { nombre: 'Córdoba',    slug: 'cordoba',    provincia: 'Córdoba',    poblacion: 325701  },
  { nombre: 'Valladolid', slug: 'valladolid', provincia: 'Valladolid', poblacion: 299715  },
  { nombre: 'Murcia',     slug: 'murcia',     provincia: 'Murcia',     poblacion: 460349  },
  { nombre: 'Palma',      slug: 'palma',      provincia: 'Baleares',   poblacion: 413015  },
  { nombre: 'Granada',    slug: 'granada',    provincia: 'Granada',    poblacion: 232208  },
  { nombre: 'Vitoria',    slug: 'vitoria',    provincia: 'Álava',      poblacion: 252000  },
  { nombre: 'Santander',  slug: 'santander',  provincia: 'Cantabria',  poblacion: 172539  },
  { nombre: 'Burgos',     slug: 'burgos',     provincia: 'Burgos',     poblacion: 177879  },
  { nombre: 'Toledo',     slug: 'toledo',     provincia: 'Toledo',     poblacion: 83334   },
  { nombre: 'Salamanca',  slug: 'salamanca',  provincia: 'Salamanca',  poblacion: 144614  },
] as const

export type CiudadSlug = typeof CIUDADES[number]['slug']

export function getCiudadBySlug(slug: string) {
  return CIUDADES.find((c) => c.slug === slug)
}
