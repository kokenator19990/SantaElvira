-- Migración: Tabla de auditoría para trazabilidad de cambios
-- Fecha: 2026-05-07

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" serial PRIMARY KEY,
  "tabla" text NOT NULL,
  "registro_id" text NOT NULL,
  "operacion" text NOT NULL,
  "usuario" text NOT NULL DEFAULT 'admin',
  "detalles" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Índices para consultas de auditoría
CREATE INDEX IF NOT EXISTS "idx_audit_log_tabla" ON "audit_log" ("tabla", "created_at");
CREATE INDEX IF NOT EXISTS "idx_audit_log_usuario" ON "audit_log" ("usuario", "created_at");
CREATE INDEX IF NOT EXISTS "idx_audit_log_fecha" ON "audit_log" ("created_at");
