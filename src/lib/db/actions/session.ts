"use server";

import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";

/**
 * Verifica que la petición proviene de un usuario autenticado.
 * Lanza error si no hay sesión válida, para abortar la acción del servidor.
 */
export async function verificarSesion(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value || session.value.length < 36) {
    throw new Error("No autorizado");
  }
}

