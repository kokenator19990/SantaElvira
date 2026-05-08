"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gte, lte, lt, or, desc } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { calcularKpisTodos, type KpiCalculado } from "@/lib/domain/calcular-kpis";
import { regenerarAlertasPeriodo } from "./kpis";
import { verificarSesion } from "./session";
import { errorSeguro } from "@/lib/utils/safe-parse";
import type { ActionResult } from "./equipos";

/**
 * Obtiene el rango de fechas de un período (primer y último día del mes).
 */
function rangoFechasPeriodo(anio: number, mes: number): { desde: string; hasta: string } {
  const desde = `${anio}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(anio, mes, 0).getDate();
  const hasta = `${anio}-${String(mes).padStart(2, "0")}-${ultimoDia}`;
  return { desde, hasta };
}

/**
 * Preview: calcula los KPIs a partir de datos crudos sin guardarlos.
 * Permite al usuario revisar antes de persistir.
 */
export async function previewKpisDesdeRegistros(
  periodoId: number
): Promise<ActionResult<{ kpis: KpiCalculado[]; diasEnMes: number; advertencias: string[] }>> {
  await verificarSesion();
  try {
    // Obtener período y validar que no esté cerrado
    const [per] = await db.select().from(t.periodo).where(eq(t.periodo.id, periodoId));
    if (!per) return { ok: false, error: "Período no encontrado" };
    // A7: el preview es solo lectura — períodos cerrados también son previsualizables

    const { desde, hasta } = rangoFechasPeriodo(per.anio, per.mes);
    const diasEnMes = new Date(per.anio, per.mes, 0).getDate();

    // Equipos activos
    const equipos = await db.select().from(t.equipo).where(eq(t.equipo.enServicio, true));
    const equipoIds = equipos.map((e) => e.id);

    // Registros diarios del rango
    const registros = await db.select().from(t.registroDiario).where(
      and(gte(t.registroDiario.fecha, desde), lte(t.registroDiario.fecha, hasta))
    );

    // Fallas del rango
    const fallas = await db.select().from(t.eventoFalla).where(
      and(
        gte(t.eventoFalla.fecha, new Date(desde + "T00:00:00Z")),
        lte(t.eventoFalla.fecha, new Date(hasta + "T23:59:59Z"))
      )
    );

    // Horas acumuladas previas: buscar el período cronológicamente anterior
    // (no usar periodoId - 1 porque los IDs seriales pueden no ser consecutivos)
    const horasMap = new Map<string, number>();
    const [perAnterior] = await db.select({ id: t.periodo.id })
      .from(t.periodo)
      .where(
        or(
          lt(t.periodo.anio, per.anio),
          and(eq(t.periodo.anio, per.anio), lt(t.periodo.mes, per.mes))
        )
      )
      .orderBy(desc(t.periodo.anio), desc(t.periodo.mes))
      .limit(1);

    if (perAnterior) {
      const kpisPrevios = await db.select({
        equipoId: t.kpiEquipo.equipoId,
        horas: t.kpiEquipo.horasAcumuladas,
      }).from(t.kpiEquipo)
        .where(eq(t.kpiEquipo.periodoId, perAnterior.id));

      for (const kp of kpisPrevios) {
        horasMap.set(kp.equipoId, kp.horas);
      }
    }

    const kpis = calcularKpisTodos(equipoIds, registros, fallas, horasMap);

    // Advertencias
    const advertencias: string[] = [];
    for (const k of kpis) {
      if (k.diasConRegistro === 0) {
        advertencias.push(`${k.equipoId}: sin registros diarios — se marcará como paro total`);
      } else if (k.diasConRegistro < diasEnMes * 0.8) {
        advertencias.push(`${k.equipoId}: solo ${k.diasConRegistro} de ${diasEnMes} días registrados`);
      }
    }

    const equiposSinRegistro = equipoIds.filter(
      (id) => !registros.some((r) => r.equipoId === id)
    );
    if (equiposSinRegistro.length > 0) {
      advertencias.unshift(
        `${equiposSinRegistro.length} equipo(s) sin ningún registro diario`
      );
    }

    return { ok: true, data: { kpis, diasEnMes, advertencias } };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "calcular-kpis") };
  }
}

/**
 * Calcula KPIs desde datos crudos y los persiste en kpi_equipo + asarco_equipo.
 * Luego regenera alertas automáticamente.
 * Toda la operación es atómica: si falla a mitad, no queda con datos parciales.
 */
export async function guardarKpisDesdeRegistros(
  periodoId: number
): Promise<ActionResult<{ equiposGuardados: number; alertasCreadas: number }>> {
  await verificarSesion();
  try {
    // Verificar período no cerrado
    const [per] = await db.select({ cerrado: t.periodo.cerrado })
      .from(t.periodo).where(eq(t.periodo.id, periodoId)).limit(1);
    if (per?.cerrado) return { ok: false, error: "No se pueden guardar KPIs en un período cerrado" };

    const preview = await previewKpisDesdeRegistros(periodoId);
    if (!preview.ok) return { ok: false, error: preview.error };

    const { kpis } = preview.data!;

    // Transacción atómica: upsert todos los KPIs y ASARCO de una vez
    await db.transaction(async (tx) => {
      for (const k of kpis) {
        await tx.insert(t.kpiEquipo).values({
          equipoId:        k.equipoId,
          periodoId,
          dfm:             String(k.dfm),
          tmef:            String(k.tmef),
          tmpr:            String(k.tmpr),
          tiempoOperativo: String(k.tiempoOperativo),
          reserva:         String(k.reserva),
          horasAcumuladas: k.horasAcumuladas,
          paroTotal:       k.paroTotal,
          motivoParo:      k.motivoParo,
          creadoPor:       "calculo-automatico",
        }).onConflictDoUpdate({
          target: [t.kpiEquipo.equipoId, t.kpiEquipo.periodoId],
          set: {
            dfm:             String(k.dfm),
            tmef:            String(k.tmef),
            tmpr:            String(k.tmpr),
            tiempoOperativo: String(k.tiempoOperativo),
            reserva:         String(k.reserva),
            horasAcumuladas: k.horasAcumuladas,
            paroTotal:       k.paroTotal,
            motivoParo:      k.motivoParo,
            creadoPor:       "calculo-automatico",
          },
        });

        await tx.insert(t.asarcoEquipo).values({
          equipoId:         k.equipoId,
          periodoId,
          pctOperativo:     String(k.pctOperativo),
          pctReserva:       String(k.pctReserva),
          pctDetProgramada: String(k.pctDetProgramada),
          pctDetNoProg:     String(k.pctDetNoProg),
          pctPerdidaOp:     String(k.pctPerdidaOp),
        }).onConflictDoUpdate({
          target: [t.asarcoEquipo.equipoId, t.asarcoEquipo.periodoId],
          set: {
            pctOperativo:     String(k.pctOperativo),
            pctReserva:       String(k.pctReserva),
            pctDetProgramada: String(k.pctDetProgramada),
            pctDetNoProg:     String(k.pctDetNoProg),
            pctPerdidaOp:     String(k.pctPerdidaOp),
          },
        });
      }
    });

    // Regenerar alertas (ya es atómica internamente)
    const rAlertas = await regenerarAlertasPeriodo(periodoId, "calculo-automatico");
    if (!rAlertas.ok) {
      return { ok: false, error: `KPIs guardados pero falló la generación de alertas: ${rAlertas.error}` };
    }
    const alertasCreadas = rAlertas.data?.creadas ?? 0;

    revalidatePath("/", "layout");
    return { ok: true, data: { equiposGuardados: kpis.length, alertasCreadas } };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "calcular-kpis") };
  }
}
