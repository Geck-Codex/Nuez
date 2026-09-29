import crudo from '../data/precios.json';

export interface Tipo {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Recolector {
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

export interface Datos {
  datosDeEjemplo: boolean;
  actualizado: string;
  moneda: string;
  unidad: string;
  tipos: Tipo[];
  recolectores: Recolector[];
  historial: Array<Record<string, string | number>>;
}

export const datos = crudo as unknown as Datos;

/** El precio mas alto que alguien paga por un tipo de nuez, y quien lo paga. */
export function mejorPorTipo(tipoId: string) {
  let mejor: { recolector: Recolector; precio: number } | null = null;
  for (const r of datos.recolectores) {
    const p = r.precios[tipoId];
    if (typeof p !== 'number') continue;
    if (!mejor || p > mejor.precio) mejor = { recolector: r, precio: p };
  }
  return mejor;
}

/** Rango pagado por un tipo: el mas bajo y el mas alto. */
export function rangoPorTipo(tipoId: string) {
  const valores = datos.recolectores
    .map((r) => r.precios[tipoId])
    .filter((p): p is number => typeof p === 'number');
  if (valores.length === 0) return null;
  return { min: Math.min(...valores), max: Math.max(...valores) };
}

/** Quien compra ese tipo, del que mas paga al que menos. */
export function ordenadosPorTipo(tipoId: string) {
  return datos.recolectores
    .map((r) => ({ recolector: r, precio: r.precios[tipoId] }))
    .filter((f): f is { recolector: Recolector; precio: number } => typeof f.precio === 'number')
    .sort((a, b) => b.precio - a.precio);
}

/** La serie del historial para un tipo, lista para graficar. */
export function seriePorTipo(tipoId: string) {
  return datos.historial
    .map((fila) => ({ fecha: String(fila.fecha), valor: fila[tipoId] }))
    .filter((f): f is { fecha: string; valor: number } => typeof f.valor === 'number');
}

/**
 * Cuanto cambio el precio de un tipo entre el primer y el ultimo
 * registro del historial. Devuelve null si no hay con que comparar.
 */
export function tendencia(tipoId: string) {
  const serie = seriePorTipo(tipoId);
  if (serie.length < 2) return null;
  const primero = serie[0]!;
  const ultimo = serie[serie.length - 1]!;
  const diferencia = ultimo.valor - primero.valor;
  return {
    desde: primero.fecha,
    hasta: ultimo.fecha,
    base: primero.valor,
    diferencia,
    porcentaje: primero.valor === 0 ? 0 : (diferencia / primero.valor) * 100,
  };
}

/** La fecha mas reciente en que se pregunto un precio. */
export function ultimaVisita(): string {
  return datos.recolectores.map((r) => r.fecha).sort().at(-1) ?? datos.actualizado;
}

/**
 * Todo lo que el navegador necesita para recalcular la pagina cuando
 * cambias de tipo de nuez o de kilos. Viaja una sola vez, en index.
 */
export function cargaCliente() {
  return {
    unidad: datos.unidad,
    actualizado: datos.actualizado,
    tipos: datos.tipos,
    recolectores: datos.recolectores.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      direccion: r.direccion,
      telefono: r.telefono,
      horario: r.horario,
      lat: r.lat,
      lon: r.lon,
      fecha: r.fecha,
      notas: r.notas,
      precios: r.precios,
    })),
    historial: datos.historial,
  };
}
