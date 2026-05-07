import { eq, and, desc } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import { calcularSemaforos } from "../../domain/semaforo";
import { safeFloat } from "../../utils/safe-parse";
import type { Equipo, TipoFlota } from "../../domain/tipos";

/**
 * Trae los equipos con sus KPIs y ASARCO para un período dado.
 * Si no se especifica periodoId, usa el período más reciente con datos.
 * Devuelve [] si no hay períodos cargados.
 */
export const getFlota = cache(async (periodoId?: number): Promise<Equipo[]> => {
  const periodoActual = periodoId ?? await getPeriodoActualId();
  if (periodoActual === null) return [];

  const filas = await db
    .select({
      id:               t.equipo.id,
      modelo:           t.equipo.modelo,
      tipoFlota:        t.equipo.tipoFlotaId,
      anio:             t.equipo.anioFabricacion,
      // KPIs del periodo actual
      dfm:              t.kpiEquipo.dfm,
      tmef:             t.kpiEquipo.tmef,
      tmpr:             t.kpiEquipo.tmpr,
      tiempoOperativo:  t.kpiEquipo.tiempoOperativo,
      reserva:          t.kpiEquipo.reserva,
      horasAcumuladas:  t.kpiEquipo.horasAcumuladas,
      paroTotal:        t.kpiEquipo.paroTotal,
      motivoParo:       t.kpiEquipo.motivoParo,
      kpiCreatedAt:     t.kpiEquipo.createdAt,
      // ASARCO del periodo actual
      pctOperativo:     t.asarcoEquipo.pctOperativo,
      pctReserva:       t.asarcoEquipo.pctReserva,
      pctDetProgramada: t.asarcoEquipo.pctDetProgramada,
      pctDetNoProg:     t.asarcoEquipo.pctDetNoProg,
      pctPerdidaOp:     t.asarcoEquipo.pctPerdidaOp,
    })
    .from(t.equipo)
    .leftJoin(t.kpiEquipo,    and(eq(t.kpiEquipo.equipoId,    t.equipo.id), eq(t.kpiEquipo.periodoId,    periodoActual as number)))
    .leftJoin(t.asarcoEquipo, and(eq(t.asarcoEquipo.equipoId, t.equipo.id), eq(t.asarcoEquipo.periodoId, periodoActual as number)))
    .orderBy(t.equipo.tipoFlotaId, desc(t.kpiEquipo.paroTotal), t.equipo.id);

  return filas.map((f): Equipo => {
    // Si no hay fila KPI para este período, el equipo no tiene datos cargados.
    // Marcarlo como paroTotal evita que aparezca con DFM=0 (semáforo rojo falso).
    const sinDatosKpi = f.kpiCreatedAt === null;

    const kpis = {
      dfm:             safeFloat(f.dfm),
      tmef:            safeFloat(f.tmef),
      tmpr:            safeFloat(f.tmpr),
      tiempoOperativo: safeFloat(f.tiempoOperativo),
      reserva:         safeFloat(f.reserva),
    };
    return {
      id:                f.id,
      modelo:            f.modelo,
      tipoFlota:         f.tipoFlota as TipoFlota,
      anio:              f.anio,
      horasAcumuladas:   f.horasAcumuladas ?? 0,
      paroTotal:         sinDatosKpi ? true : (f.paroTotal ?? false),
      motivoParo:        sinDatosKpi ? "Sin datos KPI para este período" : (f.motivoParo ?? undefined),
      kpis,
      semaforo:          calcularSemaforos(kpis),
      asarco: {
        operativo:             safeFloat(f.pctOperativo),
        reserva:               safeFloat(f.pctReserva),
        detencionProgramada:   safeFloat(f.pctDetProgramada),
        detencionNoProgramada: safeFloat(f.pctDetNoProg),
        perdidaOperacional:    safeFloat(f.pctPerdidaOp),
      },
      ultimaActualizacion: f.kpiCreatedAt?.toISOString() ?? "",
    };
  });
});

export const getEquipoPorId = cache(async (id: string, periodoId?: number): Promise<Equipo | undefined> => {
  // Query directa por ID para evitar cargar toda la flota (N+1)
  const periodoActual = periodoId ?? await getPeriodoActualId();
  if (periodoActual === null) return undefined;

  const [f] = await db
    .select({
      id:               t.equipo.id,
      modelo:           t.equipo.modelo,
      tipoFlota:        t.equipo.tipoFlotaId,
      anio:             t.equipo.anioFabricacion,
      dfm:              t.kpiEquipo.dfm,
      tmef:             t.kpiEquipo.tmef,
      tmpr:             t.kpiEquipo.tmpr,
      tiempoOperativo:  t.kpiEquipo.tiempoOperativo,
      reserva:          t.kpiEquipo.reserva,
      horasAcumuladas:  t.kpiEquipo.horasAcumuladas,
      paroTotal:        t.kpiEquipo.paroTotal,
      motivoParo:       t.kpiEquipo.motivoParo,
      kpiCreatedAt:     t.kpiEquipo.createdAt,
      pctOperativo:     t.asarcoEquipo.pctOperativo,
      pctReserva:       t.asarcoEquipo.pctReserva,
      pctDetProgramada: t.asarcoEquipo.pctDetProgramada,
      pctDetNoProg:     t.asarcoEquipo.pctDetNoProg,
      pctPerdidaOp:     t.asarcoEquipo.pctPerdidaOp,
    })
    .from(t.equipo)
    .leftJoin(t.kpiEquipo,    and(eq(t.kpiEquipo.equipoId, t.equipo.id), eq(t.kpiEquipo.periodoId, periodoActual)))
    .leftJoin(t.asarcoEquipo, and(eq(t.asarcoEquipo.equipoId, t.equipo.id), eq(t.asarcoEquipo.periodoId, periodoActual)))
    .where(eq(t.equipo.id, id))
    .limit(1);

  if (!f) return undefined;

  const sinDatosKpi = f.kpiCreatedAt === null;
  const kpis = {
    dfm:             safeFloat(f.dfm),
    tmef:            safeFloat(f.tmef),
    tmpr:            safeFloat(f.tmpr),
    tiempoOperativo: safeFloat(f.tiempoOperativo),
    reserva:         safeFloat(f.reserva),
  };
  return {
    id:                f.id,
    modelo:            f.modelo,
    tipoFlota:         f.tipoFlota as TipoFlota,
    anio:              f.anio,
    horasAcumuladas:   f.horasAcumuladas ?? 0,
    paroTotal:         sinDatosKpi ? true : (f.paroTotal ?? false),
    motivoParo:        sinDatosKpi ? "Sin datos KPI para este período" : (f.motivoParo ?? undefined),
    kpis,
    semaforo:          calcularSemaforos(kpis),
    asarco: {
      operativo:             safeFloat(f.pctOperativo),
      reserva:               safeFloat(f.pctReserva),
      detencionProgramada:   safeFloat(f.pctDetProgramada),
      detencionNoProgramada: safeFloat(f.pctDetNoProg),
      perdidaOperacional:    safeFloat(f.pctPerdidaOp),
    },
    ultimaActualizacion: f.kpiCreatedAt?.toISOString() ?? "",
  };
});

export const getFlotaPorTipo = cache(async (tipo: TipoFlota): Promise<Equipo[]> => {
  const flota = await getFlota();
  return flota.filter((e) => e.tipoFlota === tipo);
});

/* ─── Helpers internos ─────────────────────────────────────────────────────── */

/**
 * Devuelve el id del periodo más reciente con datos cargados.
 * Retorna null si no hay ningún periodo con KPIs (en lugar de lanzar error).
 */
export const getPeriodoActualId = cache(async (): Promise<number | null> => {
  const [row] = await db
    .select({ id: t.periodo.id })
    .from(t.periodo)
    .innerJoin(t.kpiEquipo, eq(t.kpiEquipo.periodoId, t.periodo.id))
    .orderBy(desc(t.periodo.anio), desc(t.periodo.mes))
    .limit(1);
  return row?.id ?? null;
});

/**
 * Trae los equipos dados de baja (enServicio = false).
 */
export const getEquiposInactivos = cache(async () => {
  return db
    .select({
      id:              t.equipo.id,
      modelo:          t.equipo.modelo,
      tipoFlota:       t.equipo.tipoFlotaId,
      anio:            t.equipo.anioFabricacion,
    })
    .from(t.equipo)
    .where(eq(t.equipo.enServicio, false))
    .orderBy(t.equipo.tipoFlotaId, t.equipo.id);
});

// Alias local eliminado — ahora usa safeFloat de @/lib/utils/safe-parse
