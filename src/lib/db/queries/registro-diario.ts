import { and, eq, gte, lte, desc, asc } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";

/**
 * Registros diarios de un equipo en un rango de fechas.
 */
export const getRegistrosPorEquipo = cache(
  async (equipoId: string, fechaDesde: string, fechaHasta: string) => {
    return db
      .select()
      .from(t.registroDiario)
      .where(
        and(
          eq(t.registroDiario.equipoId, equipoId),
          gte(t.registroDiario.fecha, fechaDesde),
          lte(t.registroDiario.fecha, fechaHasta),
        )
      )
      .orderBy(asc(t.registroDiario.fecha));
  }
);

/**
 * Todos los registros diarios de una fecha específica (todos los equipos).
 */
export const getRegistrosPorFecha = cache(async (fecha: string) => {
  return db
    .select({
      registro: t.registroDiario,
      modelo: t.equipo.modelo,
      tipoFlotaId: t.equipo.tipoFlotaId,
    })
    .from(t.registroDiario)
    .innerJoin(t.equipo, eq(t.equipo.id, t.registroDiario.equipoId))
    .where(eq(t.registroDiario.fecha, fecha))
    .orderBy(asc(t.registroDiario.equipoId));
});

/**
 * Registros diarios de un rango de fechas (para cálculo de KPIs de un período).
 */
export const getRegistrosPorRango = cache(
  async (fechaDesde: string, fechaHasta: string) => {
    return db
      .select()
      .from(t.registroDiario)
      .where(
        and(
          gte(t.registroDiario.fecha, fechaDesde),
          lte(t.registroDiario.fecha, fechaHasta),
        )
      )
      .orderBy(asc(t.registroDiario.equipoId), asc(t.registroDiario.fecha));
  }
);

/**
 * Fallas de un equipo en un rango de fechas.
 */
export const getFallasPorEquipo = cache(
  async (equipoId: string, fechaDesde: string, fechaHasta: string) => {
    return db
      .select()
      .from(t.eventoFalla)
      .where(
        and(
          eq(t.eventoFalla.equipoId, equipoId),
          gte(t.eventoFalla.fecha, new Date(fechaDesde)),
          lte(t.eventoFalla.fecha, new Date(fechaHasta + "T23:59:59Z")),
        )
      )
      .orderBy(desc(t.eventoFalla.fecha));
  }
);

/**
 * Todas las fallas en un rango de fechas.
 */
export const getFallasPorRango = cache(
  async (fechaDesde: string, fechaHasta: string) => {
    return db
      .select({
        falla: t.eventoFalla,
        modelo: t.equipo.modelo,
        tipoFlotaId: t.equipo.tipoFlotaId,
      })
      .from(t.eventoFalla)
      .innerJoin(t.equipo, eq(t.equipo.id, t.eventoFalla.equipoId))
      .where(
        and(
          gte(t.eventoFalla.fecha, new Date(fechaDesde)),
          lte(t.eventoFalla.fecha, new Date(fechaHasta + "T23:59:59Z")),
        )
      )
      .orderBy(desc(t.eventoFalla.fecha));
  }
);

/**
 * Todas las fallas registradas (para la lista general), más recientes primero.
 */
export const getFallas = cache(async (limit = 200) => {
  return db
    .select({
      falla: t.eventoFalla,
      modelo: t.equipo.modelo,
      tipoFlotaId: t.equipo.tipoFlotaId,
    })
    .from(t.eventoFalla)
    .innerJoin(t.equipo, eq(t.equipo.id, t.eventoFalla.equipoId))
    .orderBy(desc(t.eventoFalla.fecha))
    .limit(limit);
});

/**
 * Fechas con registros cargados (para el calendario / indicador de completitud).
 */
export const getFechasConRegistros = cache(async (mes: number, anio: number) => {
  const fechaDesde = `${anio}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(anio, mes, 0).getDate();
  const fechaHasta = `${anio}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

  const rows = await db
    .selectDistinct({ fecha: t.registroDiario.fecha })
    .from(t.registroDiario)
    .where(
      and(
        gte(t.registroDiario.fecha, fechaDesde),
        lte(t.registroDiario.fecha, fechaHasta),
      )
    )
    .orderBy(asc(t.registroDiario.fecha));

  return rows.map((r) => r.fecha);
});
