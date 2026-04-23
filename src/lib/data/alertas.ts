import type { Alerta, Equipo } from "../domain/tipos";
import { FLOTA } from "./flota";
import { UMBRALES } from "../constants/umbrales";

const KPI_LABELS: Record<string, string> = {
  dfm:             "Dfm",
  tmef:            "TMEF",
  tmpr:            "TMPR",
  tiempoOperativo: "Tiempo Op.",
  reserva:         "Reserva",
};

function generarAlertasEquipo(equipo: Equipo): Alerta[] {
  const alertas: Alerta[] = [];
  const { id, modelo, tipoFlota, kpis, semaforo } = equipo;

  if (equipo.paroTotal) {
    alertas.push({
      id:          `${id}-PARO`,
      equipoId:    id,
      modelo,
      tipoFlota,
      kpi:         "dfm",
      valorActual: 0,
      umbralCritico: UMBRALES.dfm.ambar,
      estado:      "paro",
      mensaje:     `PARO TOTAL — ${equipo.motivoParo}`,
      timestamp:   equipo.ultimaActualizacion,
    });
    return alertas;
  }

  type KpiKey = keyof typeof kpis;
  const checks: { kpi: KpiKey; estado: typeof semaforo[KpiKey] }[] = [
    { kpi: "dfm",             estado: semaforo.dfm },
    { kpi: "tmef",            estado: semaforo.tmef },
    { kpi: "tmpr",            estado: semaforo.tmpr },
    { kpi: "tiempoOperativo", estado: semaforo.tiempoOperativo },
    { kpi: "reserva",         estado: semaforo.reserva },
  ];

  for (const { kpi, estado } of checks) {
    if (estado === "verde") continue;

    const valor = kpis[kpi];
    let umbral: number;

    if (kpi === "tmpr") {
      umbral = estado === "rojo" ? UMBRALES.tmpr.ambar : UMBRALES.tmpr.verde;
    } else if (kpi === "reserva") {
      umbral = estado === "rojo" ? UMBRALES.reserva.ambar : UMBRALES.reserva.verde;
    } else if (kpi === "dfm") {
      umbral = estado === "rojo" ? UMBRALES.dfm.ambar : UMBRALES.dfm.verde;
    } else if (kpi === "tmef") {
      umbral = estado === "rojo" ? UMBRALES.tmef.ambar : UMBRALES.tmef.verde;
    } else {
      umbral = estado === "rojo" ? UMBRALES.tiempoOperativo.ambar : UMBRALES.tiempoOperativo.verde;
    }

    alertas.push({
      id:           `${id}-${kpi.toUpperCase()}`,
      equipoId:     id,
      modelo,
      tipoFlota,
      kpi,
      valorActual:  valor,
      umbralCritico: umbral,
      estado,
      mensaje:      `${KPI_LABELS[kpi]} fuera de umbral`,
      timestamp:    equipo.ultimaActualizacion,
    });
  }

  return alertas;
}

export function generarAlertas(equipos: Equipo[] = FLOTA): Alerta[] {
  return equipos
    .flatMap(generarAlertasEquipo)
    .sort((a, b) => {
      const orden = { paro: 0, rojo: 1, ambar: 2, verde: 3 };
      return orden[a.estado] - orden[b.estado];
    });
}

export const ALERTAS = generarAlertas();
