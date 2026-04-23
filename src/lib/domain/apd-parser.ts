import type { ParametroApd } from "./tipos";

// CSV esperado: Equipo,Compartimento,Parámetro,Valor,Unidad,LimMin,LimMax
export function parsearCsvApd(contenido: string): ParametroApd[] {
  const lineas = contenido.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lineas.length < 2) return [];

  return lineas.slice(1).map((linea): ParametroApd => {
    const cols = linea.split(",").map((c) => c.trim());
    const valor    = parseFloat(cols[3] ?? "0");
    const limMin   = cols[5] !== "" && cols[5] != null ? parseFloat(cols[5]) : null;
    const limMax   = cols[6] !== "" && cols[6] != null ? parseFloat(cols[6]) : null;

    let estado: ParametroApd["estado"] = "verde";
    if (limMin !== null && valor < limMin) estado = "rojo";
    else if (limMax !== null && valor > limMax) estado = "rojo";
    else if (limMin !== null && valor < limMin * 1.1) estado = "ambar";
    else if (limMax !== null && valor > limMax * 0.9) estado = "ambar";

    return {
      equipo:        cols[0] ?? "",
      compartimento: cols[1] ?? "",
      parametro:     cols[2] ?? "",
      valor,
      unidad:        cols[4] ?? "",
      limiteMinimo:  limMin,
      limiteMaximo:  limMax,
      estado,
    };
  });
}
