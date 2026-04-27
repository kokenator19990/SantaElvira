import { eq, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import type { AsarcoFlota, TipoFlota } from "../../domain/tipos";

/**
 * Promedios ASARCO por tipo de flota para el periodo actual.
 * Usado en el chart "Distribución ASARCO" del dashboard.
 */
export const getAsarcoPorFlota = cache(async (): Promise<AsarcoFlota[]> => {
  const periodoId = await getPeriodoActualId();

  const filas = await db
    .select({
      tipoFlota:        t.equipo.tipoFlotaId,
      modelo:           sql<string>`MIN(${t.equipo.modelo})`.as("modelo"),
      pctOperativo:     sql<string>`AVG(${t.asarcoEquipo.pctOperativo})`.as("pct_operativo"),
      pctReserva:       sql<string>`AVG(${t.asarcoEquipo.pctReserva})`.as("pct_reserva"),
      pctDetProgramada: sql<string>`AVG(${t.asarcoEquipo.pctDetProgramada})`.as("pct_det_programada"),
      pctDetNoProg:     sql<string>`AVG(${t.asarcoEquipo.pctDetNoProg})`.as("pct_det_no_prog"),
      pctPerdidaOp:     sql<string>`AVG(${t.asarcoEquipo.pctPerdidaOp})`.as("pct_perdida_op"),
    })
    .from(t.equipo)
    .innerJoin(t.asarcoEquipo, eq(t.asarcoEquipo.equipoId, t.equipo.id))
    .where(eq(t.asarcoEquipo.periodoId, periodoId))
    .groupBy(t.equipo.tipoFlotaId);

  // Mantener el orden visual: 785D, 777F, 992, PC2000
  const ordenTipo: TipoFlota[] = ["785D", "777F", "992", "PC2000"];
  return filas
    .map((f): AsarcoFlota => ({
      tipoFlota: f.tipoFlota as TipoFlota,
      modelo:    cleanModelo(f.modelo),
      distribucion: {
        operativo:             round1(parseFloat(f.pctOperativo)),
        reserva:               round1(parseFloat(f.pctReserva)),
        detencionProgramada:   round1(parseFloat(f.pctDetProgramada)),
        detencionNoProgramada: round1(parseFloat(f.pctDetNoProg)),
        perdidaOperacional:    round1(parseFloat(f.pctPerdidaOp)),
      },
    }))
    .sort((a, b) => ordenTipo.indexOf(a.tipoFlota) - ordenTipo.indexOf(b.tipoFlota));
});

const getPeriodoActualId = cache(async (): Promise<number> => {
  const [row] = await db
    .select({ id: t.periodo.id })
    .from(t.periodo)
    .innerJoin(t.asarcoEquipo, eq(t.asarcoEquipo.periodoId, t.periodo.id))
    .orderBy(sql`${t.periodo.id} DESC`)
    .limit(1);
  if (!row) throw new Error("No hay periodos con ASARCO cargado.");
  return row.id;
});

function cleanModelo(m: string): string {
  // "Komatsu PC-2000" → "PC-2000" para que coincida con los charts existentes
  return m.replace(/^Komatsu\s+/, "");
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
