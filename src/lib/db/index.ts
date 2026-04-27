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
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema, casing: "snake_case" });

export { schema };
