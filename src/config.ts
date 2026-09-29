/**
 * Configuración general del sitio.
 * Esto es lo único que cambias si algún día mueves el proyecto a otra localidad.
 */
export const SITIO = {
  nombre: 'Precio de la Nuez',
  localidad: 'Villa Coronado',
  estado: 'Chihuahua',
  get localidadCompleta() {
    return `${this.localidad}, ${this.estado}`;
  },
  descripcion:
    'Precios de compra de nuez pecanera en Villa Coronado, Chihuahua. ' +
    'Recopilados en persona con los recolectores de la región y actualizados cada semana.',
  // Centro del mapa. Ajusta si quieres que abra más cerca de la plaza.
  mapa: {
    lat: 26.7447,
    lon: -105.1719,
    zoom: 13,
  },
  // Para el pie de página. Deja vacío lo que no quieras publicar.
  contacto: {
    whatsapp: '', // ej. '5216391234567' (sin +, sin espacios)
    correo: '',
  },
} as const;

/** Formatea un número como pesos mexicanos. */
export function pesos(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

/** Convierte '2026-09-20' en '20 de septiembre de 2026'. */
export function fechaLarga(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(aFecha(iso));
}

/**
 * 'hace 3 días' a partir de una fecha ISO.
 * Compara días de calendario, no horas: algo capturado esta mañana es "hoy",
 * no "ayer".
 */
export function haceCuanto(iso: string, hoy = new Date()): string {
  const referencia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const dias = Math.round((referencia.getTime() - aFecha(iso).getTime()) / 86_400_000);

  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  if (dias < 14) return 'hace una semana';
  if (dias < 31) return `hace ${Math.floor(dias / 7)} semanas`;
  return 'hace más de un mes';
}

/** Lee un 'AAAA-MM-DD' como fecha local, sin que la zona horaria la recorra un día. */
function aFecha(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a!, m! - 1, d!);
}
