/**
 * Utilidad de exportación CSV para el dashboard.
 * Genera archivos CSV a partir de datos tabulares y dispara la descarga.
 * Compatible con Excel (BOM UTF-8 + separador punto y coma para locale ES).
 */

interface ColumnaCsv<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

/**
 * Genera un string CSV a partir de datos y definición de columnas.
 * Usa punto y coma como separador (estándar para Excel en español).
 * Incluye BOM UTF-8 para que Excel detecte la codificación correctamente.
 */
export function generarCsv<T>(datos: T[], columnas: ColumnaCsv<T>[]): string {
  const SEP = ";";
  const headers = columnas.map((c) => escaparCelda(c.header)).join(SEP);
  const filas = datos.map((row) =>
    columnas.map((c) => {
      const v = c.value(row);
      if (v == null) return "";
      // Evitar "[object Object]" para valores no primitivos
      const str = typeof v === "object" ? JSON.stringify(v) : String(v);
      return escaparCelda(str);
    }).join(SEP)
  );
  return [headers, ...filas].join("\n");
}

/**
 * Dispara la descarga de un archivo CSV en el navegador.
 */
export function descargarCsv(csv: string, nombreArchivo: string): void {
  // BOM UTF-8 para que Excel abra correctamente caracteres especiales
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo.endsWith(".csv") ? nombreArchivo : `${nombreArchivo}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera y descarga CSV en un solo paso.
 */
export function exportarCsv<T>(
  datos: T[],
  columnas: ColumnaCsv<T>[],
  nombreArchivo: string
): void {
  const csv = generarCsv(datos, columnas);
  descargarCsv(csv, nombreArchivo);
}

function escaparCelda(valor: string): string {
  if (valor.includes(";") || valor.includes('"') || valor.includes("\n") || valor.includes("\r")) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}
