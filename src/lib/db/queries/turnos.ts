import { sql, ne } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";

export interface ComparativaTurno {
  turno: string;
  equipos: number;
  registros: number;
  hrsOperacion: number;
  hrsReserva: number;
  hrsDetProgramada: number;
  hrsDetNoProgramada: number;
  hrsPerdidaOp: number;
  pctOperativo: number;
  pctReserva: number;
  pctDetNoProg: number;
}

/**
 * Compara rendimiento entre turnos "dia" y "noche".
 * Solo aplica si hay registros con turno != "completo".
 */
export const getComparativaTurnos = cache(async (): Promise<ComparativaTurno[]> => {
  const rows = await db
    .select({
      turno:              t.registroDiario.turno,
      equipos:            sql<number>`COUNT(DISTINCT ${t.registroDiario.equipoId})`,
      registros:          sql<number>`COUNT(*)`,
      hrsOperacion:       sql<number>`COALESCE(SUM(${t.registroDiario.hrsOperacion}::numeric), 0)`,
      hrsReserva:         sql<number>`COALESCE(SUM(${t.registroDiario.hrsReserva}::numeric), 0)`,
      hrsDetProgramada:   sql<number>`COALESCE(SUM(${t.registroDiario.hrsDetProgramada}::numeric), 0)`,
      hrsDetNoProgramada: sql<number>`COALESCE(SUM(${t.registroDiario.hrsDetNoProgramada}::numeric), 0)`,
      hrsPerdidaOp:       sql<number>`COALESCE(SUM(${t.registroDiario.hrsPerdidaOp}::numeric), 0)`,
    })
    .from(t.registroDiario)
    .where(ne(t.registroDiario.turno, "completo"))
    .groupBy(t.registroDiario.turno);

  return rows.map((r) => {
    const total = Number(r.hrsOperacion) + Number(r.hrsReserva) + Number(r.hrsDetProgramada) + Number(r.hrsDetNoProgramada) + Number(r.hrsPerdidaOp);
    const safe = total > 0 ? total : 1;
    return {
      turno:              r.turno,
      equipos:            Number(r.equipos),
      registros:          Number(r.registros),
      hrsOperacion:       round1(Number(r.hrsOperacion)),
      hrsReserva:         round1(Number(r.hrsReserva)),
      hrsDetProgramada:   round1(Number(r.hrsDetProgramada)),
      hrsDetNoProgramada: round1(Number(r.hrsDetNoProgramada)),
      hrsPerdidaOp:       round1(Number(r.hrsPerdidaOp)),
      pctOperativo:       round1(Number(r.hrsOperacion) / safe * 100),
      pctReserva:         round1(Number(r.hrsReserva) / safe * 100),
      pctDetNoProg:       round1(Number(r.hrsDetNoProgramada) / safe * 100),
    };
  });
});

/**
 * Verifica si hay registros por turno (dia/noche) en la BD.
 */
export const hayDatosPorTurno = cache(async (): Promise<boolean> => {
  const [row] = await db
    .select({ n: sql<number>`COUNT(*)` })
    .from(t.registroDiario)
    .where(ne(t.registroDiario.turno, "completo"))
    .limit(1);
  return Number(row?.n ?? 0) > 0;
});

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
