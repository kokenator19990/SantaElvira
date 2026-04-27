import { eq, and, desc } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import { calcularSemaforos } from "../../domain/semaforo";
import type { Equipo, TipoFlota } from "../../domain/tipos";

/**
 * Trae los 28 equipos con sus KPIs y ASARCO del período más reciente cerrado/disponible.
 * Devuelve el shape `Equipo[]` que ya usan las páginas existentes — drop-in para
 * reemplazar el import de `FLOTA` desde `@/lib/data/flota`.
 *
 * Cacheado con React.cache para deduplicar llamadas en el mismo render server.
 */
export const getFlota = cache(async (): Promise<Equipo[]> => {
  const periodoActual = await getPeriodoActualId();

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
    .leftJoin(t.kpiEquipo,    and(eq(t.kpiEquipo.equipoId,    t.equipo.id), eq(t.kpiEquipo.periodoId,    periodoActual)))
    .leftJoin(t.asarcoEquipo, and(eq(t.asarcoEquipo.equipoId, t.equipo.id), eq(t.asarcoEquipo.periodoId, periodoActual)))
    .orderBy(t.equipo.tipoFlotaId, desc(t.kpiEquipo.paroTotal), t.equipo.id);

  return filas.map((f): Equipo => {
    const kpis = {
      dfm:             num(f.dfm),
      tmef:            num(f.tmef),
      tmpr:            num(f.tmpr),
      tiempoOperativo: num(f.tiempoOperativo),
      reserva:         num(f.reserva),
    };
    return {
      id:                f.id,
      modelo:            f.modelo,
      tipoFlota:         f.tipoFlota as TipoFlota,
      anio:              f.anio,
      horasAcumuladas:   f.horasAcumuladas ?? 0,
      paroTotal:         f.paroTotal ?? false,
      motivoParo:        f.motivoParo ?? undefined,
      kpis,
      semaforo:          calcularSemaforos(kpis),
      asarco: {
        operativo:             num(f.pctOperativo),
        reserva:               num(f.pctReserva),
        detencionProgramada:   num(f.pctDetProgramada),
        detencionNoProgramada: num(f.pctDetNoProg),
        perdidaOperacional:    num(f.pctPerdidaOp),
      },
      ultimaActualizacion: (f.kpiCreatedAt ?? new Date()).toISOString(),
    };
  });
});

export const getEquipoPorId = cache(async (id: string): Promise<Equipo | undefined> => {
  const flota = await getFlota();
  return flota.find((e) => e.id === id);
});

export const getFlotaPorTipo = cache(async (tipo: TipoFlota): Promise<Equipo[]> => {
  const flota = await getFlota();
  return flota.filter((e) => e.tipoFlota === tipo);
});

/* ─── Helpers internos ─────────────────────────────────────────────────────── */

/**
 * Devuelve el id del periodo más reciente con datos cargados.
 * Por ahora: el último (mayor id) que tenga al menos un KPI registrado.
 */
const getPeriodoActualId = cache(async (): Promise<number> => {
  const [row] = await db
    .select({ id: t.periodo.id })
    .from(t.periodo)
    .innerJoin(t.kpiEquipo, eq(t.kpiEquipo.periodoId, t.periodo.id))
    .orderBy(desc(t.periodo.id))
    .limit(1);
  if (!row) throw new Error("No hay periodos con KPIs cargados.");
  return row.id;
});

function num(v: string | number | null): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : parseFloat(v);
}
