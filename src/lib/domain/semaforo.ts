import type { EstadoSemaforo, KpiEquipo, SemaforoEquipo } from "./tipos";
import { UMBRALES } from "../constants/umbrales";

export function clasificarDfm(valor: number): EstadoSemaforo {
  if (valor === 0) return "paro";
  if (valor >= UMBRALES.dfm.verde) return "verde";
  if (valor >= UMBRALES.dfm.ambar) return "ambar";
  return "rojo";
}

export function clasificarTmef(valor: number): EstadoSemaforo {
  if (valor >= UMBRALES.tmef.verde) return "verde";
  if (valor >= UMBRALES.tmef.ambar) return "ambar";
  return "rojo";
}

export function clasificarTmpr(valor: number): EstadoSemaforo {
  if (valor <= UMBRALES.tmpr.verde) return "verde";
  if (valor <= UMBRALES.tmpr.ambar) return "ambar";
  return "rojo";
}

export function clasificarTiempoOperativo(valor: number): EstadoSemaforo {
  if (valor >= UMBRALES.tiempoOperativo.verde) return "verde";
  if (valor >= UMBRALES.tiempoOperativo.ambar) return "ambar";
  return "rojo";
}

export function clasificarReserva(valor: number): EstadoSemaforo {
  if (valor <= UMBRALES.reserva.verde) return "verde";
  if (valor <= UMBRALES.reserva.ambar) return "ambar";
  return "rojo";
}

export function calcularSemaforoGeneral(kpis: KpiEquipo): EstadoSemaforo {
  if (kpis.dfm === 0) return "paro";
  const estados = [
    clasificarDfm(kpis.dfm),
    clasificarTmef(kpis.tmef),
    clasificarTmpr(kpis.tmpr),
    clasificarTiempoOperativo(kpis.tiempoOperativo),
    clasificarReserva(kpis.reserva),
  ];
  if (estados.includes("rojo")) return "rojo";
  if (estados.includes("ambar")) return "ambar";
  return "verde";
}

export function calcularSemaforos(kpis: KpiEquipo): SemaforoEquipo {
  return {
    dfm:             clasificarDfm(kpis.dfm),
    tmef:            clasificarTmef(kpis.tmef),
    tmpr:            clasificarTmpr(kpis.tmpr),
    tiempoOperativo: clasificarTiempoOperativo(kpis.tiempoOperativo),
    reserva:         clasificarReserva(kpis.reserva),
    general:         calcularSemaforoGeneral(kpis),
  };
}

export function prioridadAlerta(estado: EstadoSemaforo): number {
  return { paro: 0, rojo: 1, ambar: 2, verde: 3 }[estado];
}
