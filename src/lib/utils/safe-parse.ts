/**
 * Utilidades de parseo seguro para valores que vienen de la base de datos.
 * Drizzle devuelve columnas decimal/numeric como strings — parseFloat puede
 * producir NaN si el valor es vacío, nulo o corrupto. Estas funciones
 * normalizan a 0 en cualquier caso de error.
 */

/**
 * Parsea un valor string/number/null a un número finito.
 * Retorna 0 si el valor es nulo, vacío, NaN o Infinity.
 */
export function safeFloat(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? (n === 0 ? 0 : n) : 0;
}

/** Redondea a 1 decimal. */
export const round1 = (n: number): number => Math.round(n * 10) / 10;

/** Redondea a 2 decimales. */
export const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Sanitiza errores de BD para no exponer detalles internos al cliente.
 * Registra el error completo en el servidor y retorna un mensaje genérico.
 */
export function errorSeguro(e: unknown, contexto: string): string {
  console.error(`[${contexto}]`, e);
  if (e instanceof Error && e.message === "No autorizado") {
    return "No autorizado";
  }
  return "Error interno del servidor";
}

/**
 * Valida que una fecha en formato "YYYY-MM-DD" sea un día real del calendario.
 * Retorna true si la fecha es válida, false si no.
 */
export function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const d = new Date(anio, mes - 1, dia);
  return d.getFullYear() === anio && d.getMonth() === mes - 1 && d.getDate() === dia;
}
