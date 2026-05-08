import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Cliente Drizzle para queries en runtime.
 *
 * Usa el connection string POOLED de Supabase (Transaction mode, puerto 6543)
 * para no agotar el límite de conexiones cuando Vercel ejecuta múltiples
 * funciones serverless en paralelo.
 *
 * Para migraciones (drizzle-kit) se usa DATABASE_URL también, pero conviene
 * apuntar a DIRECT_URL si las migraciones lo requieren (p. ej. transactions).
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está definida. Copia el connection string POOLED de Supabase a .env.local"
  );
}

// `prepare: false` es obligatorio cuando se usa el pooler en Transaction mode.
// Singleton: en desarrollo con HMR, Next.js recarga módulos en cada cambio.
// Sin el singleton, cada recarga crea un cliente nuevo agotando el pool de Supabase.
const globalForDb = globalThis as unknown as { _pgClient?: ReturnType<typeof postgres> };
if (!globalForDb._pgClient) {
  globalForDb._pgClient = postgres(connectionString, { prepare: false });
}
const client = globalForDb._pgClient;

export const db = drizzle(client, { schema, casing: "snake_case" });

export { schema };
