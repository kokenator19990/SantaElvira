// ─── Umbrales KPI ASARCO/MSG ─────────────────────────────────────────────────

export const UMBRALES = {
  dfm: {
    verde: 85,   // >= 85% → verde
    ambar: 75,   // >= 75% → ámbar; < 75% → rojo
  },
  tmef: {
    verde: 80,   // >= 80h → verde
    ambar: 50,   // >= 50h → ámbar; < 50h → rojo
  },
  tmpr: {
    verde: 5,    // <= 5h → verde
    ambar: 15,   // <= 15h → ámbar; > 15h → rojo
  },
  tiempoOperativo: {
    verde: 80,   // >= 80% → verde
    ambar: 65,   // >= 65% → ámbar; < 65% → rojo
  },
  reserva: {
    verde: 8,    // <= 8% → verde
    ambar: 20,   // <= 20% → ámbar; > 20% → rojo
  },
} as const;

export const COLORES_SEMAFORO = {
  verde: "#16A34A",
  ambar: "#D97706",
  rojo:  "#DC2626",
  paro:  "#DC2626",
} as const;

export const COLORES_ASARCO = {
  operativo:             "#16A34A",
  reserva:               "#3A6AB0",
  detencionProgramada:   "#D97706",
  detencionNoProgramada: "#DC2626",
  perdidaOperacional:    "#7F1D1D",
} as const;

export const LABELS_ASARCO = {
  operativo:             "Operativo",
  reserva:               "Reserva",
  detencionProgramada:   "Det. Programada",
  detencionNoProgramada: "Det. No Programada",
  perdidaOperacional:    "Pérdida Oper.",
} as const;

export const OBJETIVO_DFM    = 85;
export const OBJETIVO_TMEF   = 80;
export const OBJETIVO_TMPR   = 5;
export const OBJETIVO_OP     = 80;
export const OBJETIVO_RESERVA = 8;

/**
 * Costo estimado por hora de paro por tipo de flota (USD/hora).
 * Incluye: producción perdida + costo de mantención ociosa + impacto logístico.
 * Estos valores son configurables — ajustar según contrato y condiciones de faena.
 */
export const COSTO_HORA_PARO: Record<string, number> = {
  "785D":   1250,   // Camión de acarreo grande — alto tonelaje
  "777F":    950,   // Camión de acarreo mediano
  "992":    1100,   // Cargador frontal — impacto en cadena de carguío
  "PC2000": 1400,   // Excavadora hidráulica — equipo crítico de producción
};
