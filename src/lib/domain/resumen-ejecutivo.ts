// ─── Generador de resumen ejecutivo automático ──────────────────────────────
// Produce 3-5 bullets interpretando el estado de la flota para un gerente.

import type { Equipo, FlotaResumen } from "./tipos";
import type { KpisDelta } from "../db/queries/tendencias";
import { COSTO_HORA_PARO } from "../constants/umbrales";

export interface ResumenEjecutivo {
  estado: "critico" | "advertencia" | "estable";
  bullets: string[];
  perdidaEstimadaUsd: number;
}

export function generarResumenEjecutivo(
  flota: Equipo[],
  flotas: FlotaResumen[],
  delta: KpisDelta | null,
  _periodoLabel: string,
  periodo?: { anio: number; mes: number },
): ResumenEjecutivo {
  const bullets: string[] = [];

  const enParo = flota.filter((e) => e.paroTotal);
  const criticos = flota.filter((e) => !e.paroTotal && e.semaforo.general === "rojo");
  const activos = flota.filter((e) => !e.paroTotal);

  // ── KPIs promedio ──
  const avg = (fn: (e: Equipo) => number) => {
    if (activos.length === 0) return 0;
    const vals = activos.map(fn).filter(Number.isFinite);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, v) => a + v, 0) / vals.length * 10) / 10;
  };

  const dfmProm = avg((e) => e.kpis.dfm);
  const tmefProm = avg((e) => e.kpis.tmef);
  const tmprProm = avg((e) => e.kpis.tmpr);

  // ── 1. Paros ──
  if (enParo.length > 0) {
    const equiposList = enParo.slice(0, 3).map((e) => e.id).join(", ");
    const extra = enParo.length > 3 ? ` y ${enParo.length - 3} más` : "";
    bullets.push(
      `${enParo.length} equipo${enParo.length > 1 ? "s" : ""} en paro total (${equiposList}${extra}) — requiere atención inmediata.`
    );
  }

  // ── 2. Disponibilidad (DFM) ──
  if (dfmProm < 75) {
    bullets.push(
      `Solo el ${dfmProm}% de la flota está disponible para operar (meta: 85%). Se pierden ~${((100 - dfmProm) / 100 * 12).toFixed(0)}h por turno en reparaciones.`
    );
  } else if (dfmProm < 85) {
    bullets.push(
      `Disponibilidad de flota en ${dfmProm}% — faltan ${(85 - dfmProm).toFixed(1)} puntos para alcanzar la meta de 85%.`
    );
  } else {
    bullets.push(`La flota tiene buena disponibilidad: ${dfmProm}% (meta: 85%).`);
  }

  // ── 3. Cambios vs período anterior ──
  if (delta) {
    const cambios: string[] = [];
    if (delta.dfm < -2) cambios.push(`la disponibilidad bajó ${Math.abs(delta.dfm).toFixed(1)} pts`);
    if (delta.dfm > 2)  cambios.push(`la disponibilidad mejoró ${delta.dfm.toFixed(1)} pts`);
    if (delta.tmef < -5) cambios.push(`los equipos fallan más seguido (−${Math.abs(delta.tmef).toFixed(0)}h entre fallas)`);
    if (delta.tmpr > 1) cambios.push(`las reparaciones tardan más (+${delta.tmpr.toFixed(1)}h)`);
    if (delta.tmpr < -1) cambios.push(`las reparaciones son más rápidas (−${Math.abs(delta.tmpr).toFixed(1)}h)`);

    if (cambios.length > 0) {
      bullets.push(`Vs mes anterior: ${cambios.join("; ")}.`);
    } else {
      bullets.push("Indicadores estables respecto al mes anterior.");
    }
  }

  // ── 4. Flotas que necesitan atención ──
  const flotasRojas = flotas.filter((f) => f.semaforoGeneral === "rojo" || f.semaforoGeneral === "paro");
  if (flotasRojas.length > 0) {
    const nombres = flotasRojas.map((f) => f.modelo).join(", ");
    bullets.push(`Las flotas ${nombres} necesitan atención prioritaria de mantenimiento.`);
  }

  // ── 5. Reparaciones lentas ──
  if (tmprProm > 5) {
    bullets.push(
      `Las reparaciones tardan ${tmprProm}h en promedio (deberían tomar máximo 5h). Verificar disponibilidad de repuestos y capacidad del taller.`
    );
  }

  // ── 6. Fallas frecuentes ──
  if (tmefProm < 50) {
    bullets.push(
      `Los equipos fallan cada ${tmefProm.toFixed(0)} horas en promedio. Se necesita reforzar el mantenimiento preventivo.`
    );
  }

  // ── Pérdida estimada ──
  const horasMesPeriodo = periodo
    ? new Date(periodo.anio, periodo.mes, 0).getDate() * 24
    : undefined;
  const perdidaEstimadaUsd = calcularPerdidaEstimada(flota, horasMesPeriodo);

  // ── Estado general ──
  const estado: ResumenEjecutivo["estado"] =
    enParo.length > 0 || criticos.length > 2 ? "critico" :
    criticos.length > 0 || dfmProm < 85 ? "advertencia" : "estable";

  return { estado, bullets: bullets.slice(0, 5), perdidaEstimadaUsd };
}

/**
 * Calcula la pérdida estimada en USD del período,
 * basado en horas de detención no programada × costo/hora por tipo de flota.
 * @param horasMes Total de horas del mes (ej: 28×24=672, 30×24=720, 31×24=744).
 *                 Si no se especifica, usa los días del mes actual × 24.
 */
export function calcularPerdidaEstimada(flota: Equipo[], horasMes?: number): number {
  const hrsDelMes = horasMes ?? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() * 24;
  let total = 0;
  for (const e of flota) {
    const costoHora = COSTO_HORA_PARO[e.tipoFlota] ?? 1000;
    if (e.paroTotal) {
      total += hrsDelMes * costoHora;
      continue;
    }
    const pctDetencion = e.asarco.detencionNoProgramada + e.asarco.perdidaOperacional;
    const horasDetMes = (pctDetencion / 100) * hrsDelMes;
    total += horasDetMes * costoHora;
  }
  return Math.round(total);
}

/**
 * Formatea un monto USD de forma legible para gerencia.
 */
export function formatUsd(monto: number): string {
  if (!Number.isFinite(monto) || monto < 0) return "$0";
  if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(1)}M`;
  if (monto >= 1_000) return `$${(monto / 1_000).toFixed(0)}K`;
  return `$${monto.toLocaleString("en-US")}`;
}
