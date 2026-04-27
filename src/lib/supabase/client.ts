import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para el browser (componentes "use client").
 * Usa las claves NEXT_PUBLIC_ que viajan al cliente — NUNCA poner aquí
 * la service_role key.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
