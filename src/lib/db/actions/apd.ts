"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { parsearCsvApd } from "@/lib/domain/apd-parser";
import type { ActionResult } from "./equipos";

interface SubirApdInput {
  periodoId: number;
  fechaAnalisis: string;       // ISO date "2025-04-15"
  archivoOrigen: string;       // nombre del CSV
  csvContent: string;          // contenido del CSV en texto
  creadoPor?: string;
}

/**
 * Parsea un CSV APD y persiste el análisis + sus muestras.
 * Devuelve el id del análisis creado y el conteo de muestras procesadas.
 */
export async function subirAnalisisApd(
  input: SubirApdInput
): Promise<ActionResult<{ analisisId: number; muestras: number; estados: { rojo: number; ambar: number; verde: number } }>> {
  if (!input.csvContent.trim()) return { ok: false, error: "CSV vacío" };

  let parametros;
  try {
    parametros = parsearCsvApd(input.csvContent);
  } catch (e) {
    return { ok: false, error: `Error parseando CSV: ${(e as Error).message}` };
  }

  if (parametros.length === 0) return { ok: false, error: "No se detectaron filas válidas en el CSV" };

  // Validar que todos los equipo_id existan
  const equipoIds = Array.from(new Set(parametros.map((p) => p.equipo)));
  const equiposExistentes = await db.select({ id: t.equipo.id }).from(t.equipo);
  const idsValidos = new Set(equiposExistentes.map((e) => e.id));
  const idsFaltantes = equipoIds.filter((id) => !idsValidos.has(id));
  if (idsFaltantes.length > 0) {
    return { ok: false, error: `Equipos no registrados en BD: ${idsFaltantes.slice(0, 5).join(", ")}${idsFaltantes.length > 5 ? "..." : ""}` };
  }

  try {
    // Insertar análisis (cabecera)
    const [created] = await db.insert(t.analisisApd).values({
      periodoId:     input.periodoId,
      fechaAnalisis: input.fechaAnalisis,
      archivoOrigen: input.archivoOrigen,
      creadoPor:     input.creadoPor ?? "admin",
    }).returning({ id: t.analisisApd.id });

    const analisisId = created.id;

    // Insertar muestras (chunked)
    const muestras = parametros.map((p) => ({
      analisisId,
      equipoId:      p.equipo,
      compartimento: p.compartimento,
      parametro:     p.parametro,
      valor:         String(p.valor),
      unidad:        p.unidad,
      limiteMinimo:  p.limiteMinimo == null ? null : String(p.limiteMinimo),
      limiteMaximo:  p.limiteMaximo == null ? null : String(p.limiteMaximo),
      estado:        p.estado,
    }));

    for (let i = 0; i < muestras.length; i += 200) {
      await db.insert(t.muestraApd).values(muestras.slice(i, i + 200));
    }

    const estados = { rojo: 0, ambar: 0, verde: 0 };
    for (const m of muestras) {
      if (m.estado === "rojo") estados.rojo++;
      else if (m.estado === "ambar") estados.ambar++;
      else if (m.estado === "verde") estados.verde++;
    }

    revalidatePath("/apd");
    return { ok: true, data: { analisisId, muestras: muestras.length, estados } };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function eliminarAnalisisApd(analisisId: number): Promise<ActionResult> {
  try {
    // muestraApd cascade delete via FK
    const r = await db.delete(t.analisisApd).where(eq(t.analisisApd.id, analisisId)).returning({ id: t.analisisApd.id });
    if (r.length === 0) return { ok: false, error: "Análisis no existe" };
    revalidatePath("/apd");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
