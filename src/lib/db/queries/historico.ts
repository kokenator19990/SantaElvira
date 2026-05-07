import { eq, asc } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import { safeFloat } from "../../utils/safe-parse";
import type { SerieTemporal } from "../../domain/tipos";

/**
 * Devuelve todos los KPIs registrados para un equipo a lo largo del tiempo.
 * Ordenados por período ascendente para graficar la evolución.
 */
export const getHistoricoEquipo = cache(async (equipoId: string): Promise<SerieTemporal[]> => {
  const filas = await db
    .select({
      anio:            t.periodo.anio,
      mes:             t.periodo.mes,
      dfm:             t.kpiEquipo.dfm,
      tmef:            t.kpiEquipo.tmef,
      tmpr:            t.kpiEquipo.tmpr,
      tiempoOperativo: t.kpiEquipo.tiempoOperativo,
      reserva:         t.kpiEquipo.reserva,
      paroTotal:       t.kpiEquipo.paroTotal,
    })
    .from(t.kpiEquipo)
    .innerJoin(t.periodo, eq(t.periodo.id, t.kpiEquipo.periodoId))
    .where(eq(t.kpiEquipo.equipoId, equipoId))
    .orderBy(asc(t.periodo.anio), asc(t.periodo.mes));

  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] as const;

  return filas.map((f) => ({
    mes:             `${MESES[f.mes - 1]} ${String(f.anio).slice(-2)}`,
    dfm:             f.paroTotal ? 0 : safeFloat(f.dfm),
    tmef:            safeFloat(f.tmef),
    tmpr:            safeFloat(f.tmpr),
    tiempoOperativo: safeFloat(f.tiempoOperativo),
    reserva:         safeFloat(f.reserva),
  }));
});
