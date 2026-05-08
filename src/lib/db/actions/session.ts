"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/token";

const SESSION_COOKIE = "admin_session";

/**
 * Verifica que la petición proviene de un usuario autenticado.
 * Comprueba la firma HMAC del token y su expiración.
 * Lanza error si no hay sesión válida, para abortar la acción del servidor.
 */
export async function verificarSesion(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  const secret = process.env.ADMIN_JWT_SECRET ?? "";
  const valida = await verifyToken(session?.value, secret);
  if (!valida) {
    redirect("/login");
  }
}

/**
 * Cierra la sesión del administrador eliminando la cookie de sesión.
 * Redirige a /login tras el cierre.
 */
export async function cerrarSesion(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
