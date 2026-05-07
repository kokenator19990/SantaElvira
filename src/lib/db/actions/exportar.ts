"use server";

import { eq, and, asc, gte, lte } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { safeFloat } from "@/lib/utils/safe-parse";
import { verificarSesion } from "./session";

interface KpiExportRow {
  periodo: string;
  equipoId: string;
  modelo: string;
  tipoFlota: string;
  dfm: number;
  tmef: number;
  tmpr: number;
  tiempoOperativo: number;
  reserva: number;
  horasAcumuladas: number;
  paroTotal: boolean;
  motivoParo: string;
  pctOperativo: number;
  pctReserva: number;
  pctDetProgramada: number;
  pctDetNoProg: number;
  pctPerdidaOp: number;
}

/**
 * Obtiene KPIs de múltiples períodos para exportación histórica.
 */
export async function getKpisMultiPeriodo(periodoIds: number[]): Promise<KpiExportRow[]> {
  await verificarSesion();
  if (periodoIds.length === 0) return [];

  const rows: KpiExportRow[] = [];

  for (const pid of periodoIds) {
    const [per] = await db.select().from(t.periodo).where(eq(t.periodo.id, pid));
    if (!per) continue;

    const kpis = await db
      .select({
        equipoId:        t.kpiEquipo.equipoId,
        modelo:          t.equipo.modelo,
        tipoFlota:       t.equipo.tipoFlotaId,
        dfm:             t.kpiEquipo.dfm,
        tmef:            t.kpiEquipo.tmef,
        tmpr:            t.kpiEquipo.tmpr,
        tiempoOperativo: t.kpiEquipo.tiempoOperativo,
        reserva:         t.kpiEquipo.reserva,
        horasAcumuladas: t.kpiEquipo.horasAcumuladas,
        paroTotal:       t.kpiEquipo.paroTotal,
        motivoParo:      t.kpiEquipo.motivoParo,
        pctOperativo:    t.asarcoEquipo.pctOperativo,
        pctReserva:      t.asarcoEquipo.pctReserva,
        pctDetProgramada: t.asarcoEquipo.pctDetProgramada,
        pctDetNoProg:    t.asarcoEquipo.pctDetNoProg,
        pctPerdidaOp:    t.asarcoEquipo.pctPerdidaOp,
      })
      .from(t.kpiEquipo)
      .innerJoin(t.equipo, eq(t.equipo.id, t.kpiEquipo.equipoId))
      .leftJoin(t.asarcoEquipo, and(
        eq(t.asarcoEquipo.equipoId, t.kpiEquipo.equipoId),
        eq(t.asarcoEquipo.periodoId, t.kpiEquipo.periodoId)
      ))
      .where(eq(t.kpiEquipo.periodoId, pid))
      .orderBy(asc(t.kpiEquipo.equipoId));

    for (const k of kpis) {
      rows.push({
        periodo:         per.label,
        equipoId:        k.equipoId,
        modelo:          k.modelo,
        tipoFlota:       k.tipoFlota,
        dfm:             safeFloat(k.dfm),
        tmef:            safeFloat(k.tmef),
        tmpr:            safeFloat(k.tmpr),
        tiempoOperativo: safeFloat(k.tiempoOperativo),
        reserva:         safeFloat(k.reserva),
        horasAcumuladas: k.horasAcumuladas,
        paroTotal:       k.paroTotal,
        motivoParo:      k.motivoParo ?? "",
        pctOperativo:    safeFloat(k.pctOperativo),
        pctReserva:      safeFloat(k.pctReserva),
        pctDetProgramada: safeFloat(k.pctDetProgramada),
        pctDetNoProg:    safeFloat(k.pctDetNoProg),
        pctPerdidaOp:    safeFloat(k.pctPerdidaOp),
      });
    }
  }

  return rows;
}

interface RegistroExportRow {
  fecha: string;
  equipoId: string;
  modelo: string;
  tipoFlota: string;
  turno: string;
  hrsOperacion: number;
  hrsReserva: number;
  hrsDetProgramada: number;
  hrsDetNoProgramada: number;
  hrsPerdidaOp: number;
  observaciones: string;
}

/**
 * Obtiene registros diarios de un rango de fechas para exportación.
 */
export async function getRegistrosExport(
  fechaDesde: string,
  fechaHasta: string
): Promise<RegistroExportRow[]> {
  await verificarSesion();
  const rows = await db
    .select({
      fecha:              t.registroDiario.fecha,
      equipoId:           t.registroDiario.equipoId,
      modelo:             t.equipo.modelo,
      tipoFlota:          t.equipo.tipoFlotaId,
      turno:              t.registroDiario.turno,
      hrsOperacion:       t.registroDiario.hrsOperacion,
      hrsReserva:         t.registroDiario.hrsReserva,
      hrsDetProgramada:   t.registroDiario.hrsDetProgramada,
      hrsDetNoProgramada: t.registroDiario.hrsDetNoProgramada,
      hrsPerdidaOp:       t.registroDiario.hrsPerdidaOp,
      observaciones:      t.registroDiario.observaciones,
    })
    .from(t.registroDiario)
    .innerJoin(t.equipo, eq(t.equipo.id, t.registroDiario.equipoId))
    .where(and(
      gte(t.registroDiario.fecha, fechaDesde),
      lte(t.registroDiario.fecha, fechaHasta)
    ))
    .orderBy(asc(t.registroDiario.fecha), asc(t.registroDiario.equipoId));

  return rows.map((r) => ({
    fecha:              r.fecha,
    equipoId:           r.equipoId,
    modelo:             r.modelo,
    tipoFlota:          r.tipoFlota,
    turno:              r.turno,
    hrsOperacion:       safeFloat(r.hrsOperacion),
    hrsReserva:         safeFloat(r.hrsReserva),
    hrsDetProgramada:   safeFloat(r.hrsDetProgramada),
    hrsDetNoProgramada: safeFloat(r.hrsDetNoProgramada),
    hrsPerdidaOp:       safeFloat(r.hrsPerdidaOp),
    observaciones:      r.observaciones ?? "",
  }));
}
