"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "../index";
import * as t from "../schema";
import { safeFloat, esFechaValida } from "@/lib/utils/safe-parse";
import { verificarSesion } from "./session";
import { errorSeguro } from "@/lib/utils/safe-parse";
import { registrarAuditoria } from "./audit";
import type { ActionResult } from "./equipos";

export interface RegistroDiarioInput {
  equipoId: string;
  fecha: string;           // "YYYY-MM-DD"
  turno?: string;          // "dia" | "noche" | "completo"
  hrsOperacion: number;
  hrsReserva: number;
  hrsDetProgramada: number;
  hrsDetNoProgramada: number;
  hrsPerdidaOp: number;
  observaciones?: string | null;
  creadoPor?: string;
}

function validar(r: RegistroDiarioInput): string | null {
  const campos = [r.hrsOperacion, r.hrsReserva, r.hrsDetProgramada, r.hrsDetNoProgramada, r.hrsPerdidaOp];
  if (campos.some((v) => Number.isNaN(v) || v < 0)) return "Las horas deben ser números válidos ≥ 0";
  const total = campos.reduce((s, v) => s + v, 0);
  const maxHoras = (r.turno === "dia" || r.turno === "noche") ? 12 : 24;
  if (total > maxHoras) return `Las horas del ${r.turno === "completo" || !r.turno ? "día" : "turno"} no pueden superar ${maxHoras} (suman ${total.toFixed(1)})`;
  if (!r.fecha || !esFechaValida(r.fecha)) return "Fecha inválida (formato YYYY-MM-DD, día real del calendario)";
  if (!r.equipoId?.trim()) return "ID de equipo requerido";
  return null;
}

/**
 * Lógica core de upsert sin revalidación de caché.
 * Usada tanto por upsertRegistroDiario (individual) como por el batch.
 */
async function upsertRegistroCore(input: RegistroDiarioInput): Promise<ActionResult> {
  const error = validar(input);
  if (error) return { ok: false, error };

  const turno = input.turno || "completo";

  try {
    await db.insert(t.registroDiario).values({
      equipoId:           input.equipoId,
      fecha:              input.fecha,
      turno,
      hrsOperacion:       String(input.hrsOperacion),
      hrsReserva:         String(input.hrsReserva),
      hrsDetProgramada:   String(input.hrsDetProgramada),
      hrsDetNoProgramada: String(input.hrsDetNoProgramada),
      hrsPerdidaOp:       String(input.hrsPerdidaOp),
      observaciones:      input.observaciones ?? null,
      creadoPor:          input.creadoPor ?? "admin",
    }).onConflictDoUpdate({
      target: [t.registroDiario.equipoId, t.registroDiario.fecha, t.registroDiario.turno],
      set: {
        hrsOperacion:       String(input.hrsOperacion),
        hrsReserva:         String(input.hrsReserva),
        hrsDetProgramada:   String(input.hrsDetProgramada),
        hrsDetNoProgramada: String(input.hrsDetNoProgramada),
        hrsPerdidaOp:       String(input.hrsPerdidaOp),
        observaciones:      input.observaciones ?? null,
        creadoPor:          input.creadoPor ?? "admin",
      },
    });

    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "registro-diario") };
  }
}

/**
 * Carga los registros existentes de una fecha para pre-llenar el formulario.
 * Filtra por turno "completo" porque la UI no soporta selección de turno.
 */
export async function cargarRegistrosPorFecha(fecha: string) {
  await verificarSesion();
  if (!esFechaValida(fecha)) return [];
  const registros = await db.select().from(t.registroDiario)
    .where(and(
      eq(t.registroDiario.fecha, fecha),
      eq(t.registroDiario.turno, "completo")
    ));

  return registros.map((r) => ({
    equipoId: r.equipoId,
    hrsOperacion: safeFloat(r.hrsOperacion),
    hrsReserva: safeFloat(r.hrsReserva),
    hrsDetProgramada: safeFloat(r.hrsDetProgramada),
    hrsDetNoProgramada: safeFloat(r.hrsDetNoProgramada),
    hrsPerdidaOp: safeFloat(r.hrsPerdidaOp),
    observaciones: r.observaciones ?? "",
  }));
}

export async function upsertRegistroDiario(input: RegistroDiarioInput): Promise<ActionResult> {
  await verificarSesion();
  const result = await upsertRegistroCore(input);
  if (result.ok) {
    await registrarAuditoria("registro_diario", `${input.equipoId}:${input.fecha}`, "UPDATE", input.creadoPor ?? "admin", `Turno=${input.turno ?? "completo"}`);
    revalidatePath("/", "layout");
  }
  return result;
}

export async function eliminarRegistroDiario(id: number): Promise<ActionResult> {
  await verificarSesion();
  try {
    const r = await db.delete(t.registroDiario)
      .where(eq(t.registroDiario.id, id))
      .returning({ id: t.registroDiario.id });
    if (r.length === 0) return { ok: false, error: "Registro no encontrado" };
    await registrarAuditoria("registro_diario", String(id), "DELETE", "admin", "Registro eliminado");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "registro-diario") };
  }
}

/**
 * Guarda múltiples registros diarios de una sola vez (batch para un día completo).
 * Revalida la caché una sola vez al final, no por cada registro individual.
 */
export async function upsertRegistrosDiarioBatch(
  registros: RegistroDiarioInput[]
): Promise<ActionResult<{ guardados: number; errores: string[] }>> {
  await verificarSesion();
  // Validar todos primero para fallar temprano
  const erroresValidacion: string[] = [];
  for (const r of registros) {
    const error = validar(r);
    if (error) erroresValidacion.push(`${r.equipoId}: ${error}`);
  }
  if (erroresValidacion.length > 0) {
    return { ok: false, error: `${erroresValidacion.length} registro(s) inválido(s): ${erroresValidacion[0]}` };
  }

  const errores: string[] = [...erroresValidacion];
  let guardados = 0;

  // Los registros válidos se guardan en una transacción
  const validos = registros.filter((r) => !validar(r));
  try {
    await db.transaction(async (tx) => {
      for (const r of validos) {
        const turno = r.turno || "completo";
        await tx.insert(t.registroDiario).values({
          equipoId:           r.equipoId,
          fecha:              r.fecha,
          turno,
          hrsOperacion:       String(r.hrsOperacion),
          hrsReserva:         String(r.hrsReserva),
          hrsDetProgramada:   String(r.hrsDetProgramada),
          hrsDetNoProgramada: String(r.hrsDetNoProgramada),
          hrsPerdidaOp:       String(r.hrsPerdidaOp),
          observaciones:      r.observaciones ?? null,
          creadoPor:          r.creadoPor ?? "admin",
        }).onConflictDoUpdate({
          target: [t.registroDiario.equipoId, t.registroDiario.fecha, t.registroDiario.turno],
          set: {
            hrsOperacion:       String(r.hrsOperacion),
            hrsReserva:         String(r.hrsReserva),
            hrsDetProgramada:   String(r.hrsDetProgramada),
            hrsDetNoProgramada: String(r.hrsDetNoProgramada),
            hrsPerdidaOp:       String(r.hrsPerdidaOp),
            observaciones:      r.observaciones ?? null,
            creadoPor:          r.creadoPor ?? "admin",
          },
        });
        guardados++;
      }
    });
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "registro-diario") };
  }

  if (guardados > 0) {
    const fecha = validos[0]?.fecha ?? "?";
    await registrarAuditoria("registro_diario", fecha, "UPDATE", "admin", `Batch: ${guardados} registros guardados`);
  }
  revalidatePath("/", "layout");
  return { ok: true, data: { guardados, errores } };
}
