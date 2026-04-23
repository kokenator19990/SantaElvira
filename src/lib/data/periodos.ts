import type { EstadoSemaforo, TipoFlota } from "../domain/tipos";
import { TENDENCIAS } from "./tendencias";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface FlotaPeriodo {
  tipo: TipoFlota;
  modelo: string;
  dfm: number;
  tmef: number;
  tmpr: number;
  estado: EstadoSemaforo;
}

export interface PeriodoSnapshot {
  label: string;          // "Abril 2025"
  mes: string;            // "Abr 25" (clave en TENDENCIAS)
  flotas: FlotaPeriodo[];
  parosTotal: number;
  criticos: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcularEstado(tipo: TipoFlota, dfm: number): EstadoSemaforo {
  if (tipo === "777F" && dfm === 0) return "paro";
  if (dfm >= 85) return "verde";
  if (dfm >= 75) return "ambar";
  return "rojo";
}

function buildSnapshot(label: string, mes: string): PeriodoSnapshot {
  const flotas: FlotaPeriodo[] = TENDENCIAS.map((serie) => {
    const punto = serie.datos.find((d) => d.mes === mes);
    const dfm   = punto?.dfm  ?? 0;
    const tmef  = punto?.tmef ?? 0;
    const tmpr  = punto?.tmpr ?? 0;
    return {
      tipo:   serie.tipoFlota,
      modelo: serie.modelo,
      dfm,
      tmef,
      tmpr,
      estado: calcularEstado(serie.tipoFlota, dfm),
    };
  });

  const criticos   = flotas.filter((f) => f.estado === "rojo").length;
  const parosTotal = flotas.filter((f) => f.estado === "paro").length;

  return { label, mes, flotas, parosTotal, criticos };
}

// ─── 6 meses disponibles (Nov 24 → Abr 25) ───────────────────────────────────
export const PERIODOS_DISPONIBLES: PeriodoSnapshot[] = [
  buildSnapshot("Abril 2025",    "Abr 25"),
  buildSnapshot("Marzo 2025",    "Mar 25"),
  buildSnapshot("Febrero 2025",  "Feb 25"),
  buildSnapshot("Enero 2025",    "Ene 25"),
  buildSnapshot("Diciembre 2024","Dic 24"),
  buildSnapshot("Noviembre 2024","Nov 24"),
];

export function getPeriodo(label: string): PeriodoSnapshot | undefined {
  return PERIODOS_DISPONIBLES.find((p) => p.label === label);
}
