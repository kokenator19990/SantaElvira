import { desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import type { Alerta, EstadoSemaforo, KpiEquipo, TipoFlota } from "../../domain/tipos";

/**
 * Trae las alertas activas (no resueltas) del periodo más reciente.
 * Ordena por criticidad: paro → rojo → ámbar → verde.
 */
export const getAlertas = cache(async (): Promise<Alerta[]> => {
  const filas = await db
    .select({
      id:            t.alerta.id,
      equipoId:      t.alerta.equipoId,
      modelo:        t.equipo.modelo,
      tipoFlota:     t.equipo.tipoFlotaId,
      kpi:           t.alerta.kpi,
      valorActual:   t.alerta.valorActual,
      umbralCritico: t.alerta.umbralCritico,
      estado:        t.alerta.estado,
      mensaje:       t.alerta.mensaje,
      timestamp:     t.alerta.timestamp,
    })
    .from(t.alerta)
    .innerJoin(t.equipo, eq(t.equipo.id, t.alerta.equipoId))
    .where(eq(t.alerta.resuelta, false))
    .orderBy(desc(t.alerta.timestamp));

  const orden: Record<EstadoSemaforo, number> = { paro: 0, rojo: 1, ambar: 2, verde: 3 };

  return filas
    .map((f): Alerta => ({
      id:            String(f.id),
      equipoId:      f.equipoId,
      modelo:        f.modelo,
      tipoFlota:     f.tipoFlota as TipoFlota,
      kpi:           f.kpi as keyof KpiEquipo,
      valorActual:   parseFloat(f.valorActual),
      umbralCritico: parseFloat(f.umbralCritico),
      estado:        f.estado as EstadoSemaforo,
      mensaje:       f.mensaje,
      timestamp:     f.timestamp.toISOString(),
    }))
    .sort((a, b) => orden[a.estado] - orden[b.estado]);
});
