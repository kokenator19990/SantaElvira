import { desc, asc, eq, and } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import { safeFloat } from "../../utils/safe-parse";

/* ─── Tipos de fila para el explorador ─────────────────────────────────────── */

export interface KpiRow {
  periodoLabel: string;
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

export interface RegistroRow {
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

export interface FallaRow {
  fecha: string;
  equipoId: string;
  modelo: string;
  tipoFlota: string;
  descripcion: string;
  componente: string;
  hrsReparacion: number;
  resuelta: boolean;
}

/* ─── Queries ──────────────────────────────────────────────────────────────── */

export const getKpisExplorador = cache(async (): Promise<KpiRow[]> => {
  const rows = await db
    .select({
      periodoLabel:    t.periodo.label,
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
    .innerJoin(t.periodo, eq(t.periodo.id, t.kpiEquipo.periodoId))
    .leftJoin(t.asarcoEquipo, and(
      eq(t.asarcoEquipo.equipoId, t.kpiEquipo.equipoId),
      eq(t.asarcoEquipo.periodoId, t.kpiEquipo.periodoId)
    ))
    .orderBy(desc(t.periodo.anio), desc(t.periodo.mes), asc(t.kpiEquipo.equipoId));

  return rows.map((r) => ({
    periodoLabel:    r.periodoLabel,
    equipoId:        r.equipoId,
    modelo:          r.modelo,
    tipoFlota:       r.tipoFlota,
    dfm:             safeFloat(r.dfm),
    tmef:            safeFloat(r.tmef),
    tmpr:            safeFloat(r.tmpr),
    tiempoOperativo: safeFloat(r.tiempoOperativo),
    reserva:         safeFloat(r.reserva),
    horasAcumuladas: r.horasAcumuladas,
    paroTotal:       r.paroTotal,
    motivoParo:      r.motivoParo ?? "",
    pctOperativo:    safeFloat(r.pctOperativo),
    pctReserva:      safeFloat(r.pctReserva),
    pctDetProgramada: safeFloat(r.pctDetProgramada),
    pctDetNoProg:    safeFloat(r.pctDetNoProg),
    pctPerdidaOp:    safeFloat(r.pctPerdidaOp),
  }));
});

export const getRegistrosExplorador = cache(async (): Promise<RegistroRow[]> => {
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
    .orderBy(desc(t.registroDiario.fecha), asc(t.registroDiario.equipoId));

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
});

export const getFallasExplorador = cache(async (): Promise<FallaRow[]> => {
  const rows = await db
    .select({
      fecha:          t.eventoFalla.fecha,
      equipoId:       t.eventoFalla.equipoId,
      modelo:         t.equipo.modelo,
      tipoFlota:      t.equipo.tipoFlotaId,
      descripcion:    t.eventoFalla.descripcion,
      componente:     t.eventoFalla.componente,
      hrsReparacion:  t.eventoFalla.hrsReparacion,
      resuelta:       t.eventoFalla.resuelta,
    })
    .from(t.eventoFalla)
    .innerJoin(t.equipo, eq(t.equipo.id, t.eventoFalla.equipoId))
    .orderBy(desc(t.eventoFalla.fecha));

  return rows.map((r) => ({
    fecha:          r.fecha.toISOString().slice(0, 16),
    equipoId:       r.equipoId,
    modelo:         r.modelo,
    tipoFlota:      r.tipoFlota,
    descripcion:    r.descripcion,
    componente:     r.componente ?? "Sin especificar",
    hrsReparacion:  safeFloat(r.hrsReparacion),
    resuelta:       r.resuelta,
  }));
});
