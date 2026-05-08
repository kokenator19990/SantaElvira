import type { EstadoSemaforo, KpiEquipo, SemaforoEquipo } from "./tipos";
import type { UmbralKpi } from "../db/schema";
import { UMBRALES } from "../constants/umbrales";
import { safeFloat } from "../utils/safe-parse";

/**
 * Configuración de umbrales para clasificación semáforo.
 * Puede provenir de constantes hardcodeadas o de la BD (umbral_kpi).
 */
export interface UmbralesConfig {
  dfm:             { verde: number; ambar: number };
  tmef:            { verde: number; ambar: number };
  tmpr:            { verde: number; ambar: number };
  tiempoOperativo: { verde: number; ambar: number };
  reserva:         { verde: number; ambar: number };
}

const UMBRALES_DEFAULT: UmbralesConfig = {
  dfm:             { verde: UMBRALES.dfm.verde,             ambar: UMBRALES.dfm.ambar },
  tmef:            { verde: UMBRALES.tmef.verde,            ambar: UMBRALES.tmef.ambar },
  tmpr:            { verde: UMBRALES.tmpr.verde,            ambar: UMBRALES.tmpr.ambar },
  tiempoOperativo: { verde: UMBRALES.tiempoOperativo.verde, ambar: UMBRALES.tiempoOperativo.ambar },
  reserva:         { verde: UMBRALES.reserva.verde,         ambar: UMBRALES.reserva.ambar },
};

/**
 * Convierte filas de la tabla umbral_kpi a UmbralesConfig.
 * Para KPIs sin fila activa en BD, usa los valores hardcodeados como respaldo.
 */
export function umbralesDesdeDB(filas: UmbralKpi[]): UmbralesConfig {
  const config: UmbralesConfig = {
    dfm:             { ...UMBRALES_DEFAULT.dfm },
    tmef:            { ...UMBRALES_DEFAULT.tmef },
    tmpr:            { ...UMBRALES_DEFAULT.tmpr },
    tiempoOperativo: { ...UMBRALES_DEFAULT.tiempoOperativo },
    reserva:         { ...UMBRALES_DEFAULT.reserva },
  };
  for (const f of filas) {
    // Normalizar snake_case legacy ("tiempo_operativo") a camelCase del tipo UmbralesConfig
    const kpiKey = f.kpi === "tiempo_operativo" ? "tiempoOperativo" : f.kpi;
    if (kpiKey in config) {
      config[kpiKey as keyof UmbralesConfig] = {
        verde: safeFloat(f.nivelVerde),
        ambar: safeFloat(f.nivelAmbar),
      };
    }
  }
  return config;
}

export function clasificarDfm(valor: number, umbrales?: UmbralesConfig): EstadoSemaforo {
  const u = umbrales ?? UMBRALES_DEFAULT;
  if (valor === 0) return "paro";
  if (valor >= u.dfm.verde) return "verde";
  if (valor >= u.dfm.ambar) return "ambar";
  return "rojo";
}

export function clasificarTmef(valor: number, umbrales?: UmbralesConfig): EstadoSemaforo {
  const u = umbrales ?? UMBRALES_DEFAULT;
  if (valor >= u.tmef.verde) return "verde";
  if (valor >= u.tmef.ambar) return "ambar";
  return "rojo";
}

export function clasificarTmpr(valor: number, umbrales?: UmbralesConfig): EstadoSemaforo {
  const u = umbrales ?? UMBRALES_DEFAULT;
  if (valor <= u.tmpr.verde) return "verde";
  if (valor <= u.tmpr.ambar) return "ambar";
  return "rojo";
}

export function clasificarTiempoOperativo(valor: number, umbrales?: UmbralesConfig): EstadoSemaforo {
  const u = umbrales ?? UMBRALES_DEFAULT;
  if (valor >= u.tiempoOperativo.verde) return "verde";
  if (valor >= u.tiempoOperativo.ambar) return "ambar";
  return "rojo";
}

export function clasificarReserva(valor: number, umbrales?: UmbralesConfig): EstadoSemaforo {
  const u = umbrales ?? UMBRALES_DEFAULT;
  if (valor <= u.reserva.verde) return "verde";
  if (valor <= u.reserva.ambar) return "ambar";
  return "rojo";
}

export function calcularSemaforoGeneral(kpis: KpiEquipo, umbrales?: UmbralesConfig): EstadoSemaforo {
  if (kpis.dfm === 0) return "paro";
  const u = umbrales ?? UMBRALES_DEFAULT;
  const dfm  = kpis.dfm >= u.dfm.verde  ? "verde" : kpis.dfm >= u.dfm.ambar  ? "ambar" : "rojo";
  const tmef = kpis.tmef >= u.tmef.verde ? "verde" : kpis.tmef >= u.tmef.ambar ? "ambar" : "rojo";
  const tmpr = kpis.tmpr <= u.tmpr.verde ? "verde" : kpis.tmpr <= u.tmpr.ambar ? "ambar" : "rojo";
  const top  = kpis.tiempoOperativo >= u.tiempoOperativo.verde ? "verde" : kpis.tiempoOperativo >= u.tiempoOperativo.ambar ? "ambar" : "rojo";
  const res  = kpis.reserva <= u.reserva.verde ? "verde" : kpis.reserva <= u.reserva.ambar ? "ambar" : "rojo";
  const estados: EstadoSemaforo[] = [dfm, tmef, tmpr, top, res];
  if (estados.includes("rojo")) return "rojo";
  if (estados.includes("ambar")) return "ambar";
  return "verde";
}

/**
 * Calcula el semáforo de todos los KPIs de un equipo.
 * Acepta umbrales opcionales desde la BD; sin ellos usa los valores hardcodeados.
 */
export function calcularSemaforos(kpis: KpiEquipo, umbrales?: UmbralesConfig): SemaforoEquipo {
  const u = umbrales ?? UMBRALES_DEFAULT;

  const dfm: EstadoSemaforo  = kpis.dfm === 0 ? "paro"
    : kpis.dfm >= u.dfm.verde  ? "verde" : kpis.dfm >= u.dfm.ambar  ? "ambar" : "rojo";
  const tmef: EstadoSemaforo = kpis.tmef >= u.tmef.verde ? "verde"
    : kpis.tmef >= u.tmef.ambar ? "ambar" : "rojo";
  const tmpr: EstadoSemaforo = kpis.tmpr <= u.tmpr.verde ? "verde"
    : kpis.tmpr <= u.tmpr.ambar ? "ambar" : "rojo";
  const tiempoOperativo: EstadoSemaforo = kpis.tiempoOperativo >= u.tiempoOperativo.verde ? "verde"
    : kpis.tiempoOperativo >= u.tiempoOperativo.ambar ? "ambar" : "rojo";
  const reserva: EstadoSemaforo = kpis.reserva <= u.reserva.verde ? "verde"
    : kpis.reserva <= u.reserva.ambar ? "ambar" : "rojo";

  const estados: EstadoSemaforo[] = [dfm, tmef, tmpr, tiempoOperativo, reserva];
  const general: EstadoSemaforo = dfm === "paro" ? "paro"
    : estados.includes("rojo") ? "rojo"
    : estados.includes("ambar") ? "ambar"
    : "verde";

  return { dfm, tmef, tmpr, tiempoOperativo, reserva, general };
}

export function prioridadAlerta(estado: EstadoSemaforo): number {
  return { paro: 0, rojo: 1, ambar: 2, verde: 3 }[estado];
}
