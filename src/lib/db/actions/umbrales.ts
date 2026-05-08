"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { verificarSesion } from "./session";
import { errorSeguro } from "@/lib/utils/safe-parse";
import type { ActionResult } from "./equipos";

const KPI_VALIDOS = ["dfm", "tmef", "tmpr", "tiempoOperativo", "reserva"] as const;

interface ActualizarUmbralInput {
  kpi:         string;
  nivelVerde:  number;
  nivelAmbar:  number;
  invertido:   boolean;
}

/**
 * Actualiza un umbral de KPI usando versionado:
 * 1. Cierra el umbral vigente (vigenteHasta = hoy)
 * 2. Inserta uno nuevo con vigenteDesde = hoy
 */
export async function actualizarUmbral(input: ActualizarUmbralInput): Promise<ActionResult> {
  await verificarSesion();
  const { kpi, nivelVerde, nivelAmbar, invertido } = input;

  if (!kpi || !(KPI_VALIDOS as readonly string[]).includes(kpi)) {
    return { ok: false, error: "KPI inválido" };
  }
  if (nivelVerde < 0 || nivelAmbar < 0) return { ok: false, error: "Los umbrales no pueden ser negativos" };

  try {
    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    await db.transaction(async (tx) => {
      // Cerrar el umbral vigente si existe
      await tx
        .update(t.umbralKpi)
        .set({ vigenteHasta: hoy })
        .where(and(eq(t.umbralKpi.kpi, kpi), isNull(t.umbralKpi.vigenteHasta)));

      // Insertar el nuevo umbral
      await tx.insert(t.umbralKpi).values({
        kpi,
        nivelVerde:   String(nivelVerde),
        nivelAmbar:   String(nivelAmbar),
        invertido,
        vigenteDesde: hoy,
        vigenteHasta: null,
      });
    });

    revalidatePath("/admin/umbrales");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "umbrales") };
  }
}
