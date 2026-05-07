"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { calcularSemaforos } from "@/lib/domain/semaforo";
import { UMBRALES } from "@/lib/constants/umbrales";
import { safeFloat } from "@/lib/utils/safe-parse";
import { verificarSesion } from "./session";
import { errorSeguro } from "@/lib/utils/safe-parse";
import { registrarAuditoria } from "./audit";
import type { ActionResult } from "./equipos";

interface KpiEquipoInput {
  equipoId: string;
  periodoId: number;
  dfm: number;
  tmef: number;
  tmpr: number;
  tiempoOperativo: number;
  reserva: number;
  horasAcumuladas: number;
  paroTotal?: boolean;
  motivoParo?: string | null;
  creadoPor?: string;
}

interface AsarcoEquipoInput {
  equipoId: string;
  periodoId: number;
  pctOperativo: number;
  pctReserva: number;
  pctDetProgramada: number;
  pctDetNoProg: number;
  pctPerdidaOp: number;
}

const KPI_LABELS: Record<string, string> = {
  dfm: "Dfm", tmef: "TMEF", tmpr: "TMPR", tiempoOperativo: "Tiempo Op.", reserva: "Reserva",
};

function validarKpis(k: KpiEquipoInput): string | null {
  const nums = [k.dfm, k.tmef, k.tmpr, k.tiempoOperativo, k.reserva, k.horasAcumuladas];
  if (nums.some(Number.isNaN)) return "Uno o más valores KPI no son números válidos";
  if (k.dfm < 0 || k.dfm > 100) return "DFM debe estar entre 0 y 100";
  if (k.tmef < 0) return "TMEF no puede ser negativo";
  if (k.tmpr < 0) return "TMPR no puede ser negativo";
  if (k.tiempoOperativo < 0 || k.tiempoOperativo > 100) return "Tiempo Operativo debe estar entre 0 y 100";
  if (k.reserva < 0 || k.reserva > 100) return "Reserva debe estar entre 0 y 100";
  if (k.horasAcumuladas < 0) return "Horas acumuladas no pueden ser negativas";
  if (k.paroTotal && (!k.motivoParo || !k.motivoParo.trim())) return "Si paroTotal, motivoParo es requerido";
  return null;
}

function validarAsarco(a: AsarcoEquipoInput): string | null {
  const fields = [a.pctOperativo, a.pctReserva, a.pctDetProgramada, a.pctDetNoProg, a.pctPerdidaOp];
  if (fields.some((f) => Number.isNaN(f) || f < 0 || f > 100)) return "Cada porcentaje ASARCO debe ser un número válido entre 0 y 100";
  const total = fields.reduce((s, f) => s + f, 0);
  if (Math.abs(total - 100) > 0.1) return `Los 5 segmentos ASARCO deben sumar ~100% (suman ${total.toFixed(1)}%)`;
  return null;
}

export async function upsertKpiEquipo(input: KpiEquipoInput): Promise<ActionResult> {
  await verificarSesion();
  const error = validarKpis(input);
  if (error) return { ok: false, error };

  // Verificar que el período no esté cerrado
  const [per] = await db.select({ cerrado: t.periodo.cerrado }).from(t.periodo).where(eq(t.periodo.id, input.periodoId)).limit(1);
  if (per?.cerrado) return { ok: false, error: "No se pueden modificar KPIs de un período cerrado" };

  try {
    await db.insert(t.kpiEquipo).values({
      equipoId:        input.equipoId,
      periodoId:       input.periodoId,
      dfm:             String(input.dfm),
      tmef:            String(input.tmef),
      tmpr:            String(input.tmpr),
      tiempoOperativo: String(input.tiempoOperativo),
      reserva:         String(input.reserva),
      horasAcumuladas: input.horasAcumuladas,
      paroTotal:       input.paroTotal ?? false,
      motivoParo:      input.motivoParo ?? null,
      creadoPor:       input.creadoPor ?? "admin",
    }).onConflictDoUpdate({
      target: [t.kpiEquipo.equipoId, t.kpiEquipo.periodoId],
      set: {
        dfm:             String(input.dfm),
        tmef:            String(input.tmef),
        tmpr:            String(input.tmpr),
        tiempoOperativo: String(input.tiempoOperativo),
        reserva:         String(input.reserva),
        horasAcumuladas: input.horasAcumuladas,
        paroTotal:       input.paroTotal ?? false,
        motivoParo:      input.motivoParo ?? null,
        creadoPor:       input.creadoPor ?? "admin",
      },
    });

    await registrarAuditoria("kpi_equipo", `${input.equipoId}:${input.periodoId}`, "UPDATE", input.creadoPor ?? "admin", `KPI DFM=${input.dfm} TMEF=${input.tmef}`);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "kpis") };
  }
}

export async function upsertAsarcoEquipo(input: AsarcoEquipoInput): Promise<ActionResult> {
  await verificarSesion();
  const error = validarAsarco(input);
  if (error) return { ok: false, error };

  // Verificar que el período no esté cerrado
  const [per] = await db.select({ cerrado: t.periodo.cerrado }).from(t.periodo).where(eq(t.periodo.id, input.periodoId)).limit(1);
  if (per?.cerrado) return { ok: false, error: "No se pueden modificar datos ASARCO de un período cerrado" };

  try {
    await db.insert(t.asarcoEquipo).values({
      equipoId:         input.equipoId,
      periodoId:        input.periodoId,
      pctOperativo:     String(input.pctOperativo),
      pctReserva:       String(input.pctReserva),
      pctDetProgramada: String(input.pctDetProgramada),
      pctDetNoProg:     String(input.pctDetNoProg),
      pctPerdidaOp:     String(input.pctPerdidaOp),
    }).onConflictDoUpdate({
      target: [t.asarcoEquipo.equipoId, t.asarcoEquipo.periodoId],
      set: {
        pctOperativo:     String(input.pctOperativo),
        pctReserva:       String(input.pctReserva),
        pctDetProgramada: String(input.pctDetProgramada),
        pctDetNoProg:     String(input.pctDetNoProg),
        pctPerdidaOp:     String(input.pctPerdidaOp),
      },
    });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "kpis") };
  }
}

/**
 * Recalcula las alertas para un período según los KPIs vigentes y los umbrales.
 * Borra las alertas anteriores del período y reinserta las nuevas.
 */
export async function regenerarAlertasPeriodo(periodoId: number, creadoPor = "admin"): Promise<ActionResult<{ creadas: number }>> {
  await verificarSesion();
  // Verificar que el período exista y no esté cerrado
  const [per] = await db.select({ cerrado: t.periodo.cerrado }).from(t.periodo).where(eq(t.periodo.id, periodoId)).limit(1);
  if (!per) return { ok: false, error: "El período no existe" };
  if (per.cerrado) return { ok: false, error: "No se pueden regenerar alertas de un período cerrado" };

  try {
    const kpis = await db.select().from(t.kpiEquipo).where(eq(t.kpiEquipo.periodoId, periodoId));
    const equipos = await db.select().from(t.equipo);
    const modeloById = new Map(equipos.map((e) => [e.id, e.modelo]));

    const nuevas: typeof t.alerta.$inferInsert[] = [];

    for (const k of kpis) {
      const kpisN = {
        dfm:             safeFloat(k.dfm),
        tmef:            safeFloat(k.tmef),
        tmpr:            safeFloat(k.tmpr),
        tiempoOperativo: safeFloat(k.tiempoOperativo),
        reserva:         safeFloat(k.reserva),
      };
      const sem = calcularSemaforos(kpisN);

      if (k.paroTotal) {
        nuevas.push({
          equipoId:      k.equipoId,
          periodoId,
          kpi:           "dfm",
          valorActual:   "0",
          umbralCritico: String(UMBRALES.dfm.ambar),
          estado:        "paro",
          mensaje:       `PARO TOTAL — ${k.motivoParo ?? "Sin motivo registrado"}`,
          resuelta:      false,
        });
        continue;
      }

      const checks: Array<[keyof typeof sem, keyof typeof kpisN]> = [
        ["dfm", "dfm"], ["tmef", "tmef"], ["tmpr", "tmpr"],
        ["tiempoOperativo", "tiempoOperativo"], ["reserva", "reserva"],
      ];

      for (const [semKey, kpiKey] of checks) {
        if (sem[semKey] === "verde") continue;
        const valor = kpisN[kpiKey];
        const config = UMBRALES[kpiKey === "tiempoOperativo" ? "tiempoOperativo" : kpiKey];
        const umbral = sem[semKey] === "rojo" ? config.ambar : config.verde;

        nuevas.push({
          equipoId:      k.equipoId,
          periodoId,
          kpi:           kpiKey === "tiempoOperativo" ? "tiempoOperativo" : kpiKey,
          valorActual:   String(valor),
          umbralCritico: String(umbral),
          estado:        sem[semKey],
          mensaje:       `${KPI_LABELS[kpiKey] ?? kpiKey} fuera de umbral en ${modeloById.get(k.equipoId) ?? k.equipoId}`,
          resuelta:      false,
        });
      }
    }

    // Transacción atómica: borrar alertas KPI no resueltas + insertar nuevas
    await db.transaction(async (tx) => {
      await tx.delete(t.alerta).where(
        and(
          eq(t.alerta.periodoId, periodoId),
          eq(t.alerta.resuelta, false),
          sql`${t.alerta.kpi} IN ('dfm', 'tmef', 'tmpr', 'tiempoOperativo', 'reserva')`
        )
      );
      if (nuevas.length > 0) {
        for (let i = 0; i < nuevas.length; i += 200) {
          await tx.insert(t.alerta).values(nuevas.slice(i, i + 200));
        }
      }
    });
    void creadoPor; // marca de auditoría futura

    revalidatePath("/", "layout");
    return { ok: true, data: { creadas: nuevas.length } };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "kpis") };
  }
}

interface CrearPeriodoInput { anio: number; mes: number; label?: string; }

export async function crearPeriodo({ anio, mes, label }: CrearPeriodoInput): Promise<ActionResult<{ id: number }>> {
  await verificarSesion();
  if (anio < 2020 || anio > 2100) return { ok: false, error: "Año fuera de rango" };
  if (mes < 1 || mes > 12) return { ok: false, error: "Mes inválido" };

  const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const labelFinal = label?.trim() || `${MESES[mes - 1]} ${anio}`;

  try {
    const existente = await db.select({ id: t.periodo.id }).from(t.periodo)
      .where(and(eq(t.periodo.anio, anio), eq(t.periodo.mes, mes))).limit(1);
    if (existente.length > 0) {
      return { ok: false, error: `Ya existe un período para ${MESES[mes - 1]} ${anio}` };
    }

    const [created] = await db.insert(t.periodo).values({
      anio, mes, label: labelFinal, cerrado: false,
    }).returning({ id: t.periodo.id });

    revalidatePath("/", "layout");
    return { ok: true, data: { id: created.id } };
  } catch (e: unknown) {
    // Unique constraint violation (código PG 23505) — race condition con inserción concurrente
    if (e && typeof e === "object" && "code" in e && e.code === "23505") {
      return { ok: false, error: `Ya existe un período para ${MESES[mes - 1]} ${anio}` };
    }
    return { ok: false, error: errorSeguro(e, "kpis") };
  }
}

export async function cerrarPeriodo(periodoId: number, cerrado = true): Promise<ActionResult> {
  await verificarSesion();
  try {
    const r = await db.update(t.periodo).set({ cerrado }).where(eq(t.periodo.id, periodoId)).returning({ id: t.periodo.id });
    if (r.length === 0) return { ok: false, error: "Período no existe" };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "kpis") };
  }
}

