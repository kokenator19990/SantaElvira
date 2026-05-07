-- Migración: Agregar índices faltantes en foreign keys y búsquedas frecuentes
-- Fecha: 2026-05-07
-- Motivo: Auditoría de rendimiento detectó full table scans en queries críticas

-- 1. Índices en foreign keys (prevenir full table scans en JOINs)
CREATE INDEX IF NOT EXISTS "idx_alerta_equipo_id" ON "alerta" ("equipo_id");
CREATE INDEX IF NOT EXISTS "idx_alerta_periodo_id" ON "alerta" ("periodo_id");
CREATE INDEX IF NOT EXISTS "idx_evento_falla_equipo_id" ON "evento_falla" ("equipo_id");
CREATE INDEX IF NOT EXISTS "idx_muestra_apd_equipo_id" ON "muestra_apd" ("equipo_id");
CREATE INDEX IF NOT EXISTS "idx_muestra_apd_analisis_id" ON "muestra_apd" ("analisis_id");
CREATE INDEX IF NOT EXISTS "idx_analisis_apd_periodo_id" ON "analisis_apd" ("periodo_id");

-- 2. Índices de búsqueda por fecha (queries de registro diario y fallas)
CREATE INDEX IF NOT EXISTS "idx_registro_diario_fecha" ON "registro_diario" ("equipo_id", "fecha");
CREATE INDEX IF NOT EXISTS "idx_evento_falla_fecha" ON "evento_falla" ("equipo_id", "fecha");

-- 3. Índice de umbrales activos (evitar scan de tabla completa)
CREATE INDEX IF NOT EXISTS "idx_umbral_kpi_kpi" ON "umbral_kpi" ("kpi", "vigente_hasta");

-- 4. Índice de alertas no resueltas (consulta más frecuente del dashboard)
CREATE INDEX IF NOT EXISTS "idx_alerta_no_resuelta" ON "alerta" ("resuelta", "periodo_id", "estado")
  WHERE "resuelta" = false;

-- 5. Índice de equipos en servicio
CREATE INDEX IF NOT EXISTS "idx_equipo_en_servicio" ON "equipo" ("en_servicio")
  WHERE "en_servicio" = true;
