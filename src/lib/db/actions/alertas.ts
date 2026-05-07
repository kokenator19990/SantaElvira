"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { verificarSesion } from "./session";
import { registrarAuditoria } from "./audit";
import type { ActionResult } from "./equipos";

/**
 * Marca una alerta como resuelta, registrando quién lo hizo y qué acción se tomó.
 * La acción tomada es obligatoria para garantizar trazabilidad.
 */
export async function resolverAlerta(
  alertaId: number,
  params: { accionTomada: string; usuario?: string }
): Promise<ActionResult> {
  await verificarSesion();

  if (!params.accionTomada?.trim()) {
    return { ok: false, error: "La acción tomada es obligatoria" };
  }

  const resultado = await db
    .update(t.alerta)
    .set({
      resuelta: true,
      accionTomada: params.accionTomada.trim(),
      resueltaPor: params.usuario?.trim() || "supervisor",
      resueltaEn: new Date(),
    })
    .where(and(eq(t.alerta.id, alertaId), eq(t.alerta.resuelta, false)))
    .returning({ id: t.alerta.id });

  if (resultado.length === 0) {
    return { ok: false, error: "La alerta no existe o ya fue resuelta" };
  }

  await registrarAuditoria(
    "alerta",
    String(alertaId),
    "UPDATE",
    params.usuario?.trim() || "supervisor",
    `Alerta resuelta: ${params.accionTomada.trim()}`
  );

  revalidatePath("/alertas");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Reabre una alerta previamente resuelta (la devuelve a estado activo).
 * Permite deshacer una resolución accidental.
 */
export async function reabrirAlerta(alertaId: number): Promise<ActionResult> {
  await verificarSesion();

  const resultado = await db
    .update(t.alerta)
    .set({
      resuelta: false,
      accionTomada: null,
      resueltaPor: null,
      resueltaEn: null,
    })
    .where(and(eq(t.alerta.id, alertaId), eq(t.alerta.resuelta, true)))
    .returning({ id: t.alerta.id });

  if (resultado.length === 0) {
    return { ok: false, error: "La alerta no existe o ya está activa" };
  }

  await registrarAuditoria(
    "alerta",
    String(alertaId),
    "UPDATE",
    "supervisor",
    "Alerta reabierta (deshacer resolución)"
  );

  revalidatePath("/alertas");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Marca todas las alertas no resueltas de un estado como resueltas.
 * Requiere acción tomada obligatoria para trazabilidad.
 */
export async function resolverTodasPorEstado(
  estado: "paro" | "rojo" | "ambar",
  params: { accionTomada: string }
): Promise<ActionResult> {
  await verificarSesion();

  if (!params.accionTomada?.trim()) {
    return { ok: false, error: "La acción tomada es obligatoria" };
  }

  const resultado = await db
    .update(t.alerta)
    .set({
      resuelta: true,
      accionTomada: params.accionTomada.trim(),
      resueltaPor: "supervisor",
      resueltaEn: new Date(),
    })
    .where(and(eq(t.alerta.estado, estado), eq(t.alerta.resuelta, false)))
    .returning({ id: t.alerta.id });

  await registrarAuditoria(
    "alerta",
    `estado:${estado}`,
    "UPDATE",
    "supervisor",
    `${resultado.length} alertas '${estado}' resueltas en lote: ${params.accionTomada.trim()}`
  );

  revalidatePath("/alertas");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { ok: true };
}
