import { desc, eq, and } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import type { Alerta, EstadoSemaforo, KpiEquipo, TipoFlota } from "../../domain/tipos";
import { getPeriodoActualId } from "./flota";

import { safeFloat } from "../../utils/safe-parse";

const safeNum = safeFloat;

/**
 * Trae las alertas activas (no resueltas) del periodo indicado (o el más reciente).
 * Ordena por criticidad: paro → rojo → ámbar → verde.
 */
export const getAlertas = cache(async (periodoIdParam?: number): Promise<Alerta[]> => {
  const periodoId = periodoIdParam ?? await getPeriodoActualId();

  const conditions = [eq(t.alerta.resuelta, false)];
  if (periodoId !== null) conditions.push(eq(t.alerta.periodoId, periodoId));

  const filas = await db
    .select({
      id:            t.alerta.id,
      equipoId:      t.alerta.equipoId,
      modelo:        t.equipo.modelo,
      tipoFlota:     t.equipo.tipoFlotaId,
      kpi:           t.alerta.kpi,
      valorActual:   t.alerta.valorActual,
      umbralCritico: t.alerta.umbralCritico,
      estado:        t.alerta.estado,
      mensaje:       t.alerta.mensaje,
      timestamp:     t.alerta.timestamp,
    })
    .from(t.alerta)
    .innerJoin(t.equipo, eq(t.equipo.id, t.alerta.equipoId))
    .where(and(...conditions))
    .orderBy(desc(t.alerta.timestamp));

  const orden: Record<EstadoSemaforo, number> = { paro: 0, rojo: 1, ambar: 2, verde: 3 };

  return filas
    .map((f): Alerta => ({
      id:            String(f.id),
      equipoId:      f.equipoId,
      modelo:        f.modelo,
      tipoFlota:     f.tipoFlota as TipoFlota,
      kpi:           f.kpi as keyof KpiEquipo | "apd",
      valorActual:   safeNum(f.valorActual),
      umbralCritico: safeNum(f.umbralCritico),
      estado:        f.estado as EstadoSemaforo,
      mensaje:       f.mensaje,
      timestamp:     f.timestamp.toISOString(),
    }))
    .sort((a, b) => orden[a.estado] - orden[b.estado]);
});

/**
 * Trae alertas resueltas con su acción tomada (historial auditable).
 * Últimas 50 para no sobrecargar.
 */
export const getAlertasResueltas = cache(async (): Promise<Alerta[]> => {
  const filas = await db
    .select({
      id:            t.alerta.id,
      equipoId:      t.alerta.equipoId,
      modelo:        t.equipo.modelo,
      tipoFlota:     t.equipo.tipoFlotaId,
      kpi:           t.alerta.kpi,
      valorActual:   t.alerta.valorActual,
      umbralCritico: t.alerta.umbralCritico,
      estado:        t.alerta.estado,
      mensaje:       t.alerta.mensaje,
      timestamp:     t.alerta.timestamp,
      accionTomada:  t.alerta.accionTomada,
      resueltaPor:   t.alerta.resueltaPor,
      resueltaEn:    t.alerta.resueltaEn,
    })
    .from(t.alerta)
    .innerJoin(t.equipo, eq(t.equipo.id, t.alerta.equipoId))
    .where(eq(t.alerta.resuelta, true))
    .orderBy(desc(t.alerta.resueltaEn))
    .limit(50);

  return filas.map((f): Alerta => ({
    id:            String(f.id),
    equipoId:      f.equipoId,
    modelo:        f.modelo,
    tipoFlota:     f.tipoFlota as TipoFlota,
    kpi:           f.kpi as keyof KpiEquipo | "apd",
    valorActual:   safeNum(f.valorActual),
    umbralCritico: safeNum(f.umbralCritico),
    estado:        f.estado as EstadoSemaforo,
    mensaje:       f.mensaje,
    timestamp:     f.timestamp.toISOString(),
    accionTomada:  f.accionTomada ?? undefined,
    resueltaPor:   f.resueltaPor ?? undefined,
    resueltaEn:    f.resueltaEn?.toISOString() ?? undefined,
  }));
});
