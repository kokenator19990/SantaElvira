"use server";

import { db } from "../index";
import * as t from "../schema";

/**
 * Registra una entrada en la tabla de auditoría.
 * Nunca lanza errores: si falla el log, se imprime en consola pero no bloquea la operación.
 */
export async function registrarAuditoria(
  tabla: string,
  registroId: string,
  operacion: "INSERT" | "UPDATE" | "DELETE",
  usuario: string,
  detalles?: string,
): Promise<void> {
  try {
    await db.insert(t.auditLog).values({
      tabla,
      registroId,
      operacion,
      usuario,
      detalles: detalles ?? null,
    });
  } catch (e) {
    console.error("Error al registrar auditoría:", e);
  }
}
