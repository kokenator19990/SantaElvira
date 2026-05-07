import { eq, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import type { AsarcoFlota, TipoFlota } from "../../domain/tipos";
import { safeFloat } from "../../utils/safe-parse";
import { getPeriodoActualId } from "./flota";

/**
 * Promedios ASARCO por tipo de flota para el periodo indicado (o el más reciente).
 * Devuelve [] si no hay períodos con datos ASARCO.
 */
export const getAsarcoPorFlota = cache(async (periodoIdParam?: number): Promise<AsarcoFlota[]> => {
  const periodoId = periodoIdParam ?? await getPeriodoActualId();
  if (periodoId === null) return [];

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
        operativo:             round1(safeFloat(f.pctOperativo)),
        reserva:               round1(safeFloat(f.pctReserva)),
        detencionProgramada:   round1(safeFloat(f.pctDetProgramada)),
        detencionNoProgramada: round1(safeFloat(f.pctDetNoProg)),
        perdidaOperacional:    round1(safeFloat(f.pctPerdidaOp)),
      },
    }))
    .sort((a, b) => ordenTipo.indexOf(a.tipoFlota) - ordenTipo.indexOf(b.tipoFlota));
});

function cleanModelo(m: string): string {
  // "Komatsu PC-2000" → "PC-2000" para que coincida con los charts existentes
  return m.replace(/^Komatsu\s+/, "");
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
