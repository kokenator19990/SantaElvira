import type { ParametroApd } from "./tipos";

// CSV esperado: Equipo,Compartimento,Parámetro,Valor,Unidad,LimMin,LimMax
export function parsearCsvApd(contenido: string): ParametroApd[] {
  // Strip UTF-8 BOM
  const limpio = contenido.replace(/^\uFEFF/, "");

  const lineas = limpio.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lineas.length < 2) return [];

  // Auto-detect separator: semicolons (Excel español) vs commas
  const headerLine = lineas[0];
  const sep = (headerLine.split(";").length > headerLine.split(",").length) ? ";" : ",";

  return lineas.slice(1).flatMap((linea): ParametroApd[] => {
    const cols = linea.split(sep).map((c) => c.trim());
    if (cols.length < 5) return []; // skip malformed rows
    const equipo = cols[0]?.trim() ?? "";
    if (!equipo) return []; // skip rows without equipment ID
    const valorRaw = parseFloat(cols[3] ?? "");
    if (Number.isNaN(valorRaw)) return []; // skip rows with non-numeric value
    const valor = valorRaw;
    const limMinRaw = cols[5] !== "" && cols[5] != null ? parseFloat(cols[5]) : NaN;
    const limMaxRaw = cols[6] !== "" && cols[6] != null ? parseFloat(cols[6]) : NaN;
    const limMin   = Number.isNaN(limMinRaw) ? null : limMinRaw;
    const limMax   = Number.isNaN(limMaxRaw) ? null : limMaxRaw;

    let estado: ParametroApd["estado"] = "verde";
    if (limMin !== null && valor < limMin) estado = "rojo";
    else if (limMax !== null && valor > limMax) estado = "rojo";
    else if (limMin !== null && limMin > 0 && valor < limMin * 1.1) estado = "ambar";
    else if (limMax !== null && limMax > 0 && valor > limMax * 0.9 && valor <= limMax) estado = "ambar";

    return [{
      equipo,
      compartimento: cols[1] ?? "",
      parametro:     cols[2] ?? "",
      valor,
      unidad:        cols[4] ?? "",
      limiteMinimo:  limMin,
      limiteMaximo:  limMax,
      estado,
    }];
  });
}
