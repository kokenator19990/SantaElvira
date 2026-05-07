"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { verificarSesion } from "./session";
import { errorSeguro } from "@/lib/utils/safe-parse";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const ID_REGEX = /^[A-Z]{2}-\d{2,3}$/;
const TIPOS_VALIDOS = ["785D", "777F", "992", "PC2000"] as const;

interface EquipoInput {
  id: string;
  tipoFlotaId: string;
  modelo: string;
  anioFabricacion: number;
  enServicio?: boolean;
}

export async function crearEquipo(input: EquipoInput): Promise<ActionResult> {
  await verificarSesion();
  const id = input.id.trim().toUpperCase();
  if (!ID_REGEX.test(id)) return { ok: false, error: "ID inválido (formato: CH-01, CE-04, CG-01, EX-01)" };
  if (!(TIPOS_VALIDOS as readonly string[]).includes(input.tipoFlotaId)) {
    return { ok: false, error: "Tipo de flota inválido" };
  }
  if (!input.modelo.trim()) return { ok: false, error: "Modelo requerido" };
  if (input.anioFabricacion < 1990 || input.anioFabricacion > new Date().getFullYear() + 1) {
    return { ok: false, error: "Año de fabricación fuera de rango" };
  }

  try {
    const existente = await db.select({ id: t.equipo.id }).from(t.equipo).where(eq(t.equipo.id, id)).limit(1);
    if (existente.length > 0) return { ok: false, error: `Ya existe un equipo con ID ${id}` };

    await db.insert(t.equipo).values({
      id,
      tipoFlotaId: input.tipoFlotaId,
      modelo: input.modelo.trim(),
      anioFabricacion: input.anioFabricacion,
      enServicio: input.enServicio ?? true,
    });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "equipos") };
  }
}

export async function actualizarEquipo(id: string, input: Partial<Omit<EquipoInput, "id">>): Promise<ActionResult> {
  await verificarSesion();
  const cleanId = id.trim().toUpperCase();
  if (!ID_REGEX.test(cleanId)) return { ok: false, error: "ID inválido" };

  const updates: Record<string, unknown> = {};
  if (input.tipoFlotaId !== undefined) {
    if (!(TIPOS_VALIDOS as readonly string[]).includes(input.tipoFlotaId)) {
      return { ok: false, error: "Tipo de flota inválido" };
    }
    updates.tipoFlotaId = input.tipoFlotaId;
  }
  if (input.modelo !== undefined) {
    if (!input.modelo.trim()) return { ok: false, error: "Modelo requerido" };
    updates.modelo = input.modelo.trim();
  }
  if (input.anioFabricacion !== undefined) {
    if (input.anioFabricacion < 1990 || input.anioFabricacion > new Date().getFullYear() + 1) {
      return { ok: false, error: "Año fuera de rango" };
    }
    updates.anioFabricacion = input.anioFabricacion;
  }
  if (input.enServicio !== undefined) updates.enServicio = input.enServicio;

  if (Object.keys(updates).length === 0) return { ok: false, error: "Sin cambios" };

  try {
    const r = await db.update(t.equipo).set(updates).where(eq(t.equipo.id, cleanId)).returning({ id: t.equipo.id });
    if (r.length === 0) return { ok: false, error: `Equipo ${cleanId} no existe` };

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "equipos") };
  }
}

export async function darDeBajaEquipo(id: string): Promise<ActionResult> {
  return actualizarEquipo(id, { enServicio: false });
}

export async function reactivarEquipo(id: string): Promise<ActionResult> {
  return actualizarEquipo(id, { enServicio: true });
}
