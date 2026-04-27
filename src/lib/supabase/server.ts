import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para Server Components / Route Handlers.
 * Maneja cookies de sesión vía Next.js cookies() API.
 * Pendiente uso real cuando se active Supabase Auth (Fase 4).
 */
export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Llamado desde un Server Component — Next.js no permite mutar cookies aquí.
            // Es seguro ignorar si hay un middleware que refresca la sesión.
          }
        },
      },
    }
  );
}
