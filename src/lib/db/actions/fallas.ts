"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { verificarSesion } from "./session";
import { errorSeguro } from "@/lib/utils/safe-parse";
import type { ActionResult } from "./equipos";

export interface EventoFallaInput {
  equipoId: string;
  fecha: string;           // ISO timestamp
  descripcion: string;
  componente?: string | null;
  hrsReparacion: number;
  creadoPor?: string;
}

function validar(f: EventoFallaInput): string | null {
  if (!f.equipoId?.trim()) return "ID de equipo requerido";
  if (!f.fecha) return "Fecha requerida";
  if (!f.descripcion?.trim()) return "Descripción de la falla requerida";
  if (Number.isNaN(f.hrsReparacion) || f.hrsReparacion < 0) return "Las horas de reparación deben ser un número válido ≥ 0";
  return null;
}

export async function crearEventoFalla(input: EventoFallaInput): Promise<ActionResult<{ id: number }>> {
  await verificarSesion();
  const error = validar(input);
  if (error) return { ok: false, error };

  try {
    const [created] = await db.insert(t.eventoFalla).values({
      equipoId:      input.equipoId.trim().toUpperCase(),
      fecha:         new Date(input.fecha),
      descripcion:   input.descripcion.trim(),
      componente:    input.componente?.trim() || null,
      hrsReparacion: String(input.hrsReparacion),
      resuelta:      false,
      creadoPor:     input.creadoPor ?? "admin",
    }).returning({ id: t.eventoFalla.id });

    revalidatePath("/", "layout");
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "fallas") };
  }
}

export async function actualizarEventoFalla(
  id: number,
  input: Partial<EventoFallaInput & { resuelta: boolean }>
): Promise<ActionResult> {
  await verificarSesion();
  const updates: Record<string, unknown> = {};

  if (input.descripcion !== undefined) {
    if (!input.descripcion.trim()) return { ok: false, error: "Descripción requerida" };
    updates.descripcion = input.descripcion.trim();
  }
  if (input.componente !== undefined) updates.componente = input.componente?.trim() || null;
  if (input.hrsReparacion !== undefined) {
    if (Number.isNaN(input.hrsReparacion) || input.hrsReparacion < 0) return { ok: false, error: "Horas no pueden ser negativas" };
    updates.hrsReparacion = String(input.hrsReparacion);
  }
  if (input.fecha !== undefined) updates.fecha = new Date(input.fecha);
  if (input.resuelta !== undefined) updates.resuelta = input.resuelta;

  if (Object.keys(updates).length === 0) return { ok: false, error: "Sin cambios" };

  try {
    const r = await db.update(t.eventoFalla).set(updates)
      .where(eq(t.eventoFalla.id, id))
      .returning({ id: t.eventoFalla.id });
    if (r.length === 0) return { ok: false, error: "Falla no encontrada" };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "fallas") };
  }
}

/**
 * Importa múltiples fallas desde un CSV parseado en el cliente.
 * Máximo 200 fallas por lote para evitar timeouts.
 */
export async function importarFallasLote(
  fallas: EventoFallaInput[]
): Promise<ActionResult<{ insertadas: number; errores: string[] }>> {
  await verificarSesion();

  if (!Array.isArray(fallas) || fallas.length === 0) {
    return { ok: false, error: "Sin fallas para importar" };
  }
  if (fallas.length > 200) {
    return { ok: false, error: "Máximo 200 fallas por lote" };
  }

  const errores: string[] = [];
  const validas: typeof fallas = [];

  for (let i = 0; i < fallas.length; i++) {
    const err = validar(fallas[i]);
    if (err) {
      errores.push(`Fila ${i + 1}: ${err}`);
    } else {
      validas.push(fallas[i]);
    }
  }

  if (validas.length === 0) {
    return { ok: false, error: `Ninguna falla válida. ${errores.slice(0, 5).join("; ")}` };
  }

  try {
    await db.insert(t.eventoFalla).values(
      validas.map((f) => ({
        equipoId:      f.equipoId.trim().toUpperCase(),
        fecha:         new Date(f.fecha),
        descripcion:   f.descripcion.trim(),
        componente:    f.componente?.trim() || null,
        hrsReparacion: String(f.hrsReparacion),
        resuelta:      false,
        creadoPor:     f.creadoPor ?? "csv-import",
      }))
    );

    revalidatePath("/", "layout");
    return { ok: true, data: { insertadas: validas.length, errores } };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "fallas-import") };
  }
}

export async function eliminarEventoFalla(id: number): Promise<ActionResult> {
  await verificarSesion();
  try {
    const r = await db.delete(t.eventoFalla)
      .where(eq(t.eventoFalla.id, id))
      .returning({ id: t.eventoFalla.id });
    if (r.length === 0) return { ok: false, error: "Falla no encontrada" };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "fallas") };
  }
}
