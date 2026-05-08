import type { RegistroDiario, EventoFalla } from "@/lib/db/schema";
import { safeFloat, round1, round2 } from "@/lib/utils/safe-parse";

export interface KpiCalculado {
  equipoId: string;
  dfm: number;
  tmef: number;
  tmpr: number;
  tiempoOperativo: number;
  reserva: number;
  horasAcumuladas: number;
  paroTotal: boolean;
  motivoParo: string | null;
  // ASARCO
  pctOperativo: number;
  pctReserva: number;
  pctDetProgramada: number;
  pctDetNoProg: number;
  pctPerdidaOp: number;
  // Metadatos
  diasConRegistro: number;
  totalFallas: number;
}


/**
 * Umbral para detectar paro total: si la detención no programada supera
 * este porcentaje del tiempo total Y las horas operativas son 0,
 * el equipo se marca en paro total.
 */
const UMBRAL_PARO_DET_NO_PROG = 0.8;

/**
 * Calcula KPIs y distribución ASARCO de un equipo a partir de sus registros
 * diarios y eventos de falla en un período.
 *
 * Fórmulas:
 *   DFM            = (hrsOperacion + hrsReserva) / totalHrs × 100
 *   TMEF           = hrsOperacion / max(numFallas, 1)
 *   TMPR           = numFallas > 0 ? hrsReparacion / numFallas : 0
 *   TiempoOperativo = hrsOperacion / totalHrs × 100
 *   Reserva        = hrsReserva / totalHrs × 100
 *   ASARCO         = cada categoría / totalHrs × 100
 */
export function calcularKpiEquipo(
  equipoId: string,
  registros: RegistroDiario[],
  fallas: EventoFalla[],
  horasAcumuladasPrevias: number,
): KpiCalculado {
  const regs = registros.filter((r) => r.equipoId === equipoId);
  const falls = fallas.filter((f) => f.equipoId === equipoId);

  // Sin registros → equipo en paro total
  if (regs.length === 0) {
    return {
      equipoId,
      dfm: 0, tmef: 0, tmpr: 0, tiempoOperativo: 0, reserva: 0,
      horasAcumuladas: horasAcumuladasPrevias,
      paroTotal: true,
      motivoParo: "Sin registros de operación en el período",
      pctOperativo: 0, pctReserva: 0, pctDetProgramada: 0, pctDetNoProg: 0, pctPerdidaOp: 0,
      diasConRegistro: 0,
      totalFallas: 0,
    };
  }

  // Sumar horas por categoría
  let hrsOp = 0, hrsRes = 0, hrsDetProg = 0, hrsDetNoProg = 0, hrsPerd = 0;
  for (const r of regs) {
    hrsOp       += safeFloat(r.hrsOperacion);
    hrsRes      += safeFloat(r.hrsReserva);
    hrsDetProg  += safeFloat(r.hrsDetProgramada);
    hrsDetNoProg += safeFloat(r.hrsDetNoProgramada);
    hrsPerd     += safeFloat(r.hrsPerdidaOp);
  }

  const totalHrs = hrsOp + hrsRes + hrsDetProg + hrsDetNoProg + hrsPerd;

  // Si total de horas = 0, el equipo estuvo en paro
  if (totalHrs <= 0) {
    return {
      equipoId,
      dfm: 0, tmef: 0, tmpr: 0, tiempoOperativo: 0, reserva: 0,
      horasAcumuladas: horasAcumuladasPrevias,
      paroTotal: true,
      motivoParo: "Total de horas registradas es 0",
      pctOperativo: 0, pctReserva: 0, pctDetProgramada: 0, pctDetNoProg: 0, pctPerdidaOp: 0,
      diasConRegistro: new Set(regs.map((r) => r.fecha)).size,
      totalFallas: falls.length,
    };
  }

  const hrsDisponible = hrsOp + hrsRes;
  const numFallas = falls.length;
  const hrsReparacion = falls.reduce((s, f) => s + safeFloat(f.hrsReparacion), 0);

  // Detectar paro total:
  //   - Equipo sin operación con detención no programada dominante (>80% del tiempo), O
  //   - Equipo sin operación cuyo tiempo disponible (reserva) es también 0
  //     (descarta equipos legítimamente en reserva/mantenimiento programado)
  const esParo = hrsOp < 0.01 && (
    hrsDetNoProg / totalHrs > UMBRAL_PARO_DET_NO_PROG ||
    (hrsRes < 0.01 && hrsDetProg < 0.01 && hrsDetNoProg > 0)
  );

  const dfm            = round2((hrsDisponible / totalHrs) * 100);
  // TMEF: cuando numFallas=0 se usa hrsOp como estimador MLE (cota inferior).
  // El equipo operó hrsOp horas sin fallar — es el mejor dato disponible.
  // El dashboard puede usar totalFallas=0 para mostrar "sin fallas" si lo requiere.
  const tmef           = round1(numFallas > 0 ? hrsOp / numFallas : hrsOp);
  const tmpr           = round1(numFallas > 0 ? hrsReparacion / numFallas : 0);
  const tiempoOperativo = round2((hrsOp / totalHrs) * 100);
  const reserva        = round2((hrsRes / totalHrs) * 100);

  // ASARCO: calcular porcentajes y normalizar para que sumen exactamente 100%
  const rawPcts = [
    (hrsOp / totalHrs) * 100,
    (hrsRes / totalHrs) * 100,
    (hrsDetProg / totalHrs) * 100,
    (hrsDetNoProg / totalHrs) * 100,
    (hrsPerd / totalHrs) * 100,
  ];
  const sumaRaw = rawPcts.reduce((a, b) => a + b, 0);
  const factor = sumaRaw > 0 ? 100 / sumaRaw : 0;
  const normalizado = rawPcts.map((p) => round2(p * factor));
  // Redistribuir residuo al componente mayor para que sume exactamente 100%
  const sumaRedondeada = normalizado.reduce((a, b) => a + b, 0);
  const residuo = round2(100 - sumaRedondeada);
  if (residuo !== 0) {
    const maxIdx = normalizado.indexOf(Math.max(...normalizado));
    normalizado[maxIdx] = round2(Math.min(100, Math.max(0, normalizado[maxIdx] + residuo)));
  }
  const [pctOperativo, pctReserva, pctDetProgramada, pctDetNoProg, pctPerdidaOp] = normalizado;

  return {
    equipoId,
    dfm,
    tmef,
    tmpr,
    tiempoOperativo,
    reserva,
    // Math.round: el campo horas_acumuladas es integer en BD (schema.ts)
    horasAcumuladas: horasAcumuladasPrevias + Math.round(hrsOp),
    paroTotal: esParo,
    motivoParo: esParo ? "Equipo sin operación en el período — 80%+ en detención no programada" : null,
    pctOperativo,
    pctReserva,
    pctDetProgramada,
    pctDetNoProg,
    pctPerdidaOp,
    diasConRegistro: new Set(regs.map((r) => r.fecha)).size,
    totalFallas: numFallas,
  };
}

/**
 * Calcula KPIs de todos los equipos a partir de registros diarios y fallas.
 */
export function calcularKpisTodos(
  equipoIds: string[],
  registros: RegistroDiario[],
  fallas: EventoFalla[],
  horasAcumuladasMap: Map<string, number>,
): KpiCalculado[] {
  return equipoIds.map((id) =>
    calcularKpiEquipo(id, registros, fallas, horasAcumuladasMap.get(id) ?? 0)
  );
}
