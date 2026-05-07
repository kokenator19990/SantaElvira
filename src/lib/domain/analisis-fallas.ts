/**
 * Análisis de fallas: agrupa por componente y tipo de flota
 * para identificar patrones de falla recurrente.
 */

interface FallaInput {
  equipoId: string;
  componente: string | null;
  hrsReparacion: number;
  tipoFlota: string;
}

export interface ResumenComponente {
  componente: string;
  totalFallas: number;
  hrsReparacionTotal: number;
  hrsReparacionPromedio: number;
  equiposAfectados: number;
  porTipoFlota: { tipo: string; fallas: number }[];
}

export function analizarFallasPorComponente(fallas: FallaInput[]): ResumenComponente[] {
  const mapa = new Map<string, {
    fallas: number;
    hrsTotal: number;
    equipos: Set<string>;
    porTipo: Map<string, number>;
  }>();

  for (const f of fallas) {
    const comp = f.componente || "Sin especificar";
    let entry = mapa.get(comp);
    if (!entry) {
      entry = { fallas: 0, hrsTotal: 0, equipos: new Set(), porTipo: new Map() };
      mapa.set(comp, entry);
    }
    entry.fallas++;
    entry.hrsTotal += f.hrsReparacion;
    entry.equipos.add(f.equipoId);
    entry.porTipo.set(f.tipoFlota, (entry.porTipo.get(f.tipoFlota) ?? 0) + 1);
  }

  return Array.from(mapa.entries())
    .map(([comp, data]) => ({
      componente: comp,
      totalFallas: data.fallas,
      hrsReparacionTotal: Math.round(data.hrsTotal * 10) / 10,
      hrsReparacionPromedio: Math.round((data.hrsTotal / data.fallas) * 10) / 10,
      equiposAfectados: data.equipos.size,
      porTipoFlota: Array.from(data.porTipo.entries())
        .map(([tipo, count]) => ({ tipo, fallas: count }))
        .sort((a, b) => b.fallas - a.fallas),
    }))
    .sort((a, b) => b.totalFallas - a.totalFallas);
}
