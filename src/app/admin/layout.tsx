import { verificarSesion } from "@/lib/db/actions/session";

/**
 * Defensa en profundidad: todas las rutas /admin/* verifican sesión
 * incluso si el middleware falla o es eludido.
 * force-dynamic evita pre-rendering en build (las páginas admin requieren auth).
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await verificarSesion();
  return <>{children}</>;
}
