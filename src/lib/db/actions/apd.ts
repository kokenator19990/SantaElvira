"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { parsearCsvApd } from "@/lib/domain/apd-parser";
import { verificarSesion } from "./session";
import { errorSeguro } from "@/lib/utils/safe-parse";
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
): Promise<ActionResult<{ analisisId: number; muestras: number; estados: { rojo: number; ambar: number; verde: number }; alertasGeneradas: number }>> {
  await verificarSesion();
  if (!input.csvContent.trim()) return { ok: false, error: "CSV vacío" };
  if (input.csvContent.length > 5 * 1024 * 1024) return { ok: false, error: "CSV excede el límite de 5 MB" };

  let parametros;
  try {
    parametros = parsearCsvApd(input.csvContent);
  } catch {
    return { ok: false, error: `Error parseando CSV: formato inválido` };
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
    // Transacción atómica: cabecera + muestras (evita análisis huérfanos si falla la inserción de muestras)
    const { analisisId, muestras } = await db.transaction(async (tx) => {
      const [created] = await tx.insert(t.analisisApd).values({
        periodoId:     input.periodoId,
        fechaAnalisis: input.fechaAnalisis,
        archivoOrigen: input.archivoOrigen,
        creadoPor:     input.creadoPor ?? "admin",
      }).returning({ id: t.analisisApd.id });

      const aid = created.id;

      const rows = parametros.map((p) => ({
        analisisId: aid,
        equipoId:      p.equipo,
        compartimento: p.compartimento,
        parametro:     p.parametro,
        valor:         String(p.valor),
        unidad:        p.unidad,
        limiteMinimo:  p.limiteMinimo == null ? null : String(p.limiteMinimo),
        limiteMaximo:  p.limiteMaximo == null ? null : String(p.limiteMaximo),
        estado:        p.estado,
      }));

      for (let i = 0; i < rows.length; i += 200) {
        await tx.insert(t.muestraApd).values(rows.slice(i, i + 200));
      }

      return { analisisId: aid, muestras: rows };
    });

    const estados = { rojo: 0, ambar: 0, verde: 0 };
    for (const m of muestras) {
      if (m.estado === "rojo") estados.rojo++;
      else if (m.estado === "ambar") estados.ambar++;
      else if (m.estado === "verde") estados.verde++;
    }

    // ── Generar alertas predictivas por parámetros fuera de rango ──
    if (estados.rojo > 0 || estados.ambar > 0) {
      const alertasApd: (typeof t.alerta.$inferInsert)[] = [];

      // Agrupar por equipo: contar parámetros críticos
      const porEquipo = new Map<string, { rojos: number; ambares: number; detalles: string[] }>();
      for (const m of muestras) {
        if (m.estado === "verde") continue;
        let entry = porEquipo.get(m.equipoId);
        if (!entry) {
          entry = { rojos: 0, ambares: 0, detalles: [] };
          porEquipo.set(m.equipoId, entry);
        }
        if (m.estado === "rojo") entry.rojos++;
        if (m.estado === "ambar") entry.ambares++;
        if (entry.detalles.length < 3) {
          entry.detalles.push(`${m.compartimento}/${m.parametro}`);
        }
      }

      for (const [equipoId, info] of Array.from(porEquipo)) {
        const esRojo = info.rojos > 0;
        const totalFuera = info.rojos + info.ambares;
        const detalle = info.detalles.join(", ");

        alertasApd.push({
          equipoId,
          periodoId: input.periodoId,
          kpi:           "apd",
          valorActual:   String(totalFuera),
          umbralCritico: "0",
          estado:        esRojo ? "rojo" : "ambar",
          mensaje:       `APD: ${totalFuera} parámetro${totalFuera > 1 ? "s" : ""} fuera de rango (${detalle})`,
          resuelta:      false,
        });
      }

      if (alertasApd.length > 0) {
        // Dedup atómico: eliminar alertas APD previas + insertar nuevas en una transacción
        const equiposConAlerta = alertasApd.map((a) => a.equipoId).filter((id): id is string => id != null);
        await db.transaction(async (tx) => {
          for (const eqId of equiposConAlerta) {
            await tx.delete(t.alerta).where(
              and(
                eq(t.alerta.equipoId, eqId),
                eq(t.alerta.periodoId, input.periodoId),
                eq(t.alerta.kpi, "apd"),
                eq(t.alerta.resuelta, false)
              )
            );
          }
          await tx.insert(t.alerta).values(alertasApd);
        });
      }
    }

    // Contar alertas generadas
    const alertasGeneradas = (estados.rojo > 0 || estados.ambar > 0)
      ? new Set(muestras.filter((m) => m.estado !== "verde").map((m) => m.equipoId)).size
      : 0;

    revalidatePath("/apd");
    revalidatePath("/alertas");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { ok: true, data: { analisisId, muestras: muestras.length, estados, alertasGeneradas } };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "apd") };
  }
}

export async function eliminarAnalisisApd(analisisId: number): Promise<ActionResult> {
  await verificarSesion();
  try {
    // Obtener equipos afectados y periodoId antes de borrar
    const muestrasDelAnalisis = await db
      .select({ equipoId: t.muestraApd.equipoId })
      .from(t.muestraApd)
      .where(eq(t.muestraApd.analisisId, analisisId));

    const analisisRow = await db
      .select({ periodoId: t.analisisApd.periodoId })
      .from(t.analisisApd)
      .where(eq(t.analisisApd.id, analisisId))
      .limit(1);

    // muestraApd cascade delete via FK
    const r = await db.delete(t.analisisApd).where(eq(t.analisisApd.id, analisisId)).returning({ id: t.analisisApd.id });
    if (r.length === 0) return { ok: false, error: "Análisis no existe" };

    // Limpiar alertas APD huérfanas no resueltas para estos equipos
    if (analisisRow.length > 0 && muestrasDelAnalisis.length > 0) {
      const periodoId = analisisRow[0].periodoId;
      const equiposUnicos = Array.from(new Set(muestrasDelAnalisis.map((m) => m.equipoId)));
      for (const eqId of equiposUnicos) {
        await db.delete(t.alerta).where(
          and(
            eq(t.alerta.equipoId, eqId),
            eq(t.alerta.periodoId, periodoId),
            eq(t.alerta.kpi, "apd"),
            eq(t.alerta.resuelta, false)
          )
        );
      }
    }

    revalidatePath("/apd");
    revalidatePath("/alertas");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "apd") };
  }
}
