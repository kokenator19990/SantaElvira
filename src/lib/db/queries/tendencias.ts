import { eq, sql, asc, desc, and, inArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import type { SerieTemporalFlota, TipoFlota } from "../../domain/tipos";
import { safeFloat } from "../../utils/safe-parse";

/**
 * Series temporales de KPIs por tipo de flota, agrupadas por mes.
 * Devuelve los 6 últimos periodos.
 */
export const getTendencias = cache(async (): Promise<SerieTemporalFlota[]> => {
  // Limitar a los últimos 12 períodos para evitar crecimiento ilimitado del dataset
  const periodosRecientes = await db
    .select({ id: t.periodo.id })
    .from(t.periodo)
    .orderBy(desc(t.periodo.anio), desc(t.periodo.mes))
    .limit(12);
  const idsRecientes = periodosRecientes.map((p) => p.id);

  const filas = idsRecientes.length === 0 ? [] : await db
    .select({
      tipoFlota:       t.equipo.tipoFlotaId,
      anio:            t.periodo.anio,
      mes:             t.periodo.mes,
      label:           t.periodo.label,
      dfm:             sql<string>`AVG(${t.kpiEquipo.dfm})`.as("dfm"),
      tmef:            sql<string>`AVG(${t.kpiEquipo.tmef})`.as("tmef"),
      tmpr:            sql<string>`AVG(${t.kpiEquipo.tmpr})`.as("tmpr"),
      tiempoOperativo: sql<string>`AVG(${t.kpiEquipo.tiempoOperativo})`.as("tiempo_operativo"),
      reserva:         sql<string>`AVG(${t.kpiEquipo.reserva})`.as("reserva"),
    })
    .from(t.kpiEquipo)
    .innerJoin(t.equipo,  eq(t.equipo.id,  t.kpiEquipo.equipoId))
    .innerJoin(t.periodo, eq(t.periodo.id, t.kpiEquipo.periodoId))
    .where(and(eq(t.kpiEquipo.paroTotal, false), inArray(t.kpiEquipo.periodoId, idsRecientes)))
    .groupBy(t.equipo.tipoFlotaId, t.periodo.anio, t.periodo.mes, t.periodo.label, t.periodo.id)
    .orderBy(t.equipo.tipoFlotaId, asc(t.periodo.anio), asc(t.periodo.mes));

  const tipos: TipoFlota[] = ["785D", "777F", "992", "PC2000"];
  const modelos: Record<TipoFlota, string> = {
    "785D":   "CAT 785D",
    "777F":   "CAT 777F",
    "992":    "CAT 992",
    "PC2000": "Komatsu PC-2000",
  };

  return tipos.map((tipo) => {
    const datos = filas
      .filter((f) => f.tipoFlota === tipo)
      .slice(-6)
      .map((f) => ({
        mes:             mesCorto(f.anio, f.mes),
        dfm:             round1(safeFloat(f.dfm)),
        tmef:            round1(safeFloat(f.tmef)),
        tmpr:            round1(safeFloat(f.tmpr)),
        tiempoOperativo: round1(safeFloat(f.tiempoOperativo)),
        reserva:         round1(safeFloat(f.reserva)),
      }));
    return { tipoFlota: tipo, modelo: modelos[tipo], datos };
  });
});

export const getTendenciaPorTipo = cache(async (tipo: TipoFlota) => {
  const tendencias = await getTendencias();
  return tendencias.find((t) => t.tipoFlota === tipo);
});

export interface KpisDelta {
  dfm: number;
  tmef: number;
  tmpr: number;
  tiempoOperativo: number;
  reserva: number;
}

/**
 * Calcula la variación de KPIs promedio entre dos períodos consecutivos.
 * Si se provee periodoId, compara ese período con el inmediato anterior.
 * Si no, compara los dos períodos globalmente más recientes con datos.
 * Excluye equipos en paro total para un promedio significativo.
 * Retorna null si hay menos de 2 períodos disponibles.
 */
export const getKpisDeltaFlota = cache(async (periodoIdRef?: number): Promise<KpisDelta | null> => {
  const baseQuery = db
    .selectDistinct({ id: t.periodo.id, anio: t.periodo.anio, mes: t.periodo.mes })
    .from(t.kpiEquipo)
    .innerJoin(t.periodo, eq(t.periodo.id, t.kpiEquipo.periodoId));

  const periodos = await (
    periodoIdRef !== undefined
      ? baseQuery.where(sql`${t.periodo.id} <= ${periodoIdRef}`)
      : baseQuery
  ).orderBy(desc(t.periodo.anio), desc(t.periodo.mes)).limit(2);

  if (periodos.length < 2) return null;

  const [idActual, idAnterior] = [periodos[0].id, periodos[1].id];

  const promedioKpis = async (periodoId: number) => {
    const [row] = await db
      .select({
        dfm:             sql<string>`AVG(${t.kpiEquipo.dfm})`,
        tmef:            sql<string>`AVG(${t.kpiEquipo.tmef})`,
        tmpr:            sql<string>`AVG(${t.kpiEquipo.tmpr})`,
        tiempoOperativo: sql<string>`AVG(${t.kpiEquipo.tiempoOperativo})`,
        reserva:         sql<string>`AVG(${t.kpiEquipo.reserva})`,
      })
      .from(t.kpiEquipo)
      .where(and(eq(t.kpiEquipo.periodoId, periodoId), eq(t.kpiEquipo.paroTotal, false)));
    return row;
  };

  const [actual, anterior] = await Promise.all([promedioKpis(idActual), promedioKpis(idAnterior)]);
  if (!actual || !anterior) return null;

  return {
    dfm:             round1(safeFloat(actual.dfm)             - safeFloat(anterior.dfm)),
    tmef:            round1(safeFloat(actual.tmef)            - safeFloat(anterior.tmef)),
    tmpr:            round1(safeFloat(actual.tmpr)            - safeFloat(anterior.tmpr)),
    tiempoOperativo: round1(safeFloat(actual.tiempoOperativo) - safeFloat(anterior.tiempoOperativo)),
    reserva:         round1(safeFloat(actual.reserva)         - safeFloat(anterior.reserva)),
  };
});

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] as const;
function mesCorto(anio: number, mes: number): string {
  return `${MESES[mes - 1]} ${String(anio).slice(-2)}`;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
