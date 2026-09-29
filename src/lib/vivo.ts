/**
 * Estado compartido del navegador: que tipo de nuez y cuantos kilos.
 *
 * El servidor ya pinta la pagina completa para el primer tipo y 100 kg,
 * asi que esto solo repinta cuando alguien mueve algo. Sin JavaScript el
 * sitio sigue sirviendo, nada mas deja de ser interactivo.
 */

export interface RecolectorVivo {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  lat: number;
  lon: number;
  fecha: string;
  notas: string;
  precios: Record<string, number | null>;
}

export interface Carga {
  unidad: string;
  actualizado: string;
  tipos: Array<{ id: string; nombre: string; descripcion: string }>;
  recolectores: RecolectorVivo[];
  historial: Array<Record<string, string | number>>;
}

const nodo = document.getElementById('datos-sitio');
export const carga = JSON.parse(nodo?.textContent ?? 'null') as Carga | null;

export const KILOS_INICIALES = 100;

export const pesos = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);

export const numero = (n: number) =>
  new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(n);

export const fechaCorta = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(
    new Date(a!, m! - 1, d!),
  );
};

export const escapar = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export interface Estado {
  grado: string;
  kilos: number;
}

const estadoActual: Estado = {
  grado: carga?.tipos[0]?.id ?? '',
  kilos: KILOS_INICIALES,
};

type Oyente = (e: Estado, cambio: 'grado' | 'kilos') => void;
const oyentes: Oyente[] = [];

/** Se suscribe a los cambios. No dispara al suscribirse: el HTML ya viene pintado. */
export function alCambiar(fn: Oyente) {
  oyentes.push(fn);
}

export const estado = (): Estado => ({ ...estadoActual });

export function fijarGrado(id: string) {
  if (id === estadoActual.grado) return;
  estadoActual.grado = id;
  avisar('grado');
}

export function fijarKilos(kg: number) {
  if (kg === estadoActual.kilos) return;
  estadoActual.kilos = kg;
  avisar('kilos');
}

function avisar(cambio: 'grado' | 'kilos') {
  for (const fn of oyentes) fn(estado(), cambio);
}

/** Quien compra ese tipo, del que mas paga al que menos. */
export function ordenados(grado: string) {
  if (!carga) return [];
  return carga.recolectores
    .map((r) => ({ recolector: r, precio: r.precios[grado] }))
    .filter((f): f is { recolector: RecolectorVivo; precio: number } => typeof f.precio === 'number')
    .sort((a, b) => b.precio - a.precio);
}

export const nombreGrado = (grado: string) =>
  carga?.tipos.find((t) => t.id === grado)?.nombre ?? 'nuez';
