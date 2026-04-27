import { eq, sql, asc } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import type { SerieTemporalFlota, TipoFlota } from "../../domain/tipos";

/**
 * Series temporales de KPIs por tipo de flota, agrupadas por mes.
 * Devuelve los 6 últimos periodos.
 */
export const getTendencias = cache(async (): Promise<SerieTemporalFlota[]> => {
  const filas = await db
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
      .map((f) => ({
        mes:             mesCorto(f.anio, f.mes),
        dfm:             round1(parseFloat(f.dfm)),
        tmef:            round1(parseFloat(f.tmef)),
        tmpr:            round1(parseFloat(f.tmpr)),
        tiempoOperativo: round1(parseFloat(f.tiempoOperativo)),
        reserva:         round1(parseFloat(f.reserva)),
      }));
    return { tipoFlota: tipo, modelo: modelos[tipo], datos };
  });
});

export const getTendenciaPorTipo = cache(async (tipo: TipoFlota) => {
  const tendencias = await getTendencias();
  return tendencias.find((t) => t.tipoFlota === tipo);
});

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] as const;
function mesCorto(anio: number, mes: number): string {
  return `${MESES[mes - 1]} ${String(anio).slice(-2)}`;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
