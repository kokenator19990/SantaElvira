import {
  boolean,
  date,
  decimal,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ─── 1. TIPO_FLOTA ─────────────────────────────────────────────────────────
 * Catálogo de tipos de equipos (CAT 785D, 777F, 992, Komatsu PC-2000)
 */
export const tipoFlota = pgTable("tipo_flota", {
  id:           text("id").primaryKey(),                           // "785D", "777F", "992", "PC2000"
  codigo:       text("codigo").notNull(),                          // "785D"
  descripcion:  text("descripcion").notNull(),                     // "Camion de acarreo 785D"
  fabricante:   text("fabricante").notNull(),                      // "Caterpillar"
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ─── 2. EQUIPO ─────────────────────────────────────────────────────────────
 * Los 28 equipos físicos de la mina
 */
export const equipo = pgTable("equipo", {
  id:               text("id").primaryKey(),                       // "CH-01", "CE-04", ...
  tipoFlotaId:      text("tipo_flota_id").notNull().references(() => tipoFlota.id),
  modelo:           text("modelo").notNull(),                      // "CAT 785D"
  anioFabricacion:  integer("anio_fabricacion").notNull(),
  enServicio:       boolean("en_servicio").notNull().default(true),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ─── 3. PERIODO ────────────────────────────────────────────────────────────
 * Cada mes/año del que se registran datos
 */
export const periodo = pgTable("periodo", {
  id:        serial("id").primaryKey(),
  anio:      integer("anio").notNull(),
  mes:       integer("mes").notNull(),                             // 1-12
  label:     text("label").notNull(),                              // "Abril 2025"
  cerrado:   boolean("cerrado").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueAnioMes: uniqueIndex("periodo_anio_mes_uq").on(t.anio, t.mes),
}));

/* ─── 4. UMBRAL_KPI ─────────────────────────────────────────────────────────
 * Limites verde/ámbar/rojo por KPI (versionables por fecha)
 */
export const umbralKpi = pgTable("umbral_kpi", {
  id:            serial("id").primaryKey(),
  kpi:           text("kpi").notNull(),                            // "dfm", "tmef", "tmpr", "tiempo_operativo", "reserva"
  nivelVerde:    decimal("nivel_verde", { precision: 8, scale: 2 }).notNull(),
  nivelAmbar:    decimal("nivel_ambar", { precision: 8, scale: 2 }).notNull(),
  invertido:     boolean("invertido").notNull().default(false),    // true → menor es mejor (TMPR, reserva)
  vigenteDesde:  date("vigente_desde").notNull(),
  vigenteHasta:  date("vigente_hasta"),                            // null = vigente
  createdAt:     timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ─── 5. KPI_EQUIPO ─────────────────────────────────────────────────────────
 * KPIs mensuales por equipo (DFM, TMEF, TMPR, T.Op, Reserva)
 */
export const kpiEquipo = pgTable("kpi_equipo", {
  id:               serial("id").primaryKey(),
  equipoId:         text("equipo_id").notNull().references(() => equipo.id),
  periodoId:        integer("periodo_id").notNull().references(() => periodo.id),
  dfm:              decimal("dfm",              { precision: 5, scale: 2 }).notNull(),
  tmef:             decimal("tmef",             { precision: 6, scale: 1 }).notNull(),
  tmpr:             decimal("tmpr",             { precision: 5, scale: 1 }).notNull(),
  tiempoOperativo:  decimal("tiempo_operativo", { precision: 5, scale: 2 }).notNull(),
  reserva:          decimal("reserva",          { precision: 5, scale: 2 }).notNull(),
  horasAcumuladas:  integer("horas_acumuladas").notNull(),
  paroTotal:        boolean("paro_total").notNull().default(false),
  motivoParo:       text("motivo_paro"),
  creadoPor:        text("creado_por"),                            // username/email del supervisor
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueEquipoPeriodo: uniqueIndex("kpi_equipo_periodo_uq").on(t.equipoId, t.periodoId),
}));

/* ─── 6. ASARCO_EQUIPO ──────────────────────────────────────────────────────
 * Distribución ASARCO de horas (5 categorías que suman 100%)
 */
export const asarcoEquipo = pgTable("asarco_equipo", {
  id:               serial("id").primaryKey(),
  equipoId:         text("equipo_id").notNull().references(() => equipo.id),
  periodoId:        integer("periodo_id").notNull().references(() => periodo.id),
  pctOperativo:     decimal("pct_operativo",       { precision: 5, scale: 2 }).notNull(),
  pctReserva:       decimal("pct_reserva",         { precision: 5, scale: 2 }).notNull(),
  pctDetProgramada: decimal("pct_det_programada",  { precision: 5, scale: 2 }).notNull(),
  pctDetNoProg:     decimal("pct_det_no_prog",     { precision: 5, scale: 2 }).notNull(),
  pctPerdidaOp:     decimal("pct_perdida_op",      { precision: 5, scale: 2 }).notNull(),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueEquipoPeriodo: uniqueIndex("asarco_equipo_periodo_uq").on(t.equipoId, t.periodoId),
}));

/* ─── 7. REGISTRO_DIARIO ───────────────────────────────────────────────────
 * Horas diarias por equipo en las 5 categorías ASARCO.
 * Este es el dato crudo que permite calcular KPIs automáticamente.
 */
export const registroDiario = pgTable("registro_diario", {
  id:                  serial("id").primaryKey(),
  equipoId:            text("equipo_id").notNull().references(() => equipo.id),
  fecha:               date("fecha").notNull(),
  turno:               text("turno").notNull().default("completo"),         // "dia" | "noche" | "completo"
  hrsOperacion:        decimal("hrs_operacion",         { precision: 5, scale: 2 }).notNull(),
  hrsReserva:          decimal("hrs_reserva",           { precision: 5, scale: 2 }).notNull(),
  hrsDetProgramada:    decimal("hrs_det_programada",    { precision: 5, scale: 2 }).notNull(),
  hrsDetNoProgramada:  decimal("hrs_det_no_programada", { precision: 5, scale: 2 }).notNull(),
  hrsPerdidaOp:        decimal("hrs_perdida_op",        { precision: 5, scale: 2 }).notNull(),
  observaciones:       text("observaciones"),
  creadoPor:           text("creado_por"),
  createdAt:           timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueEquipoFechaTurno: uniqueIndex("registro_diario_eq_fecha_turno_uq").on(t.equipoId, t.fecha, t.turno),
}));

/* ─── 8. EVENTO_FALLA ─────────────────────────────────────────────────────
 * Cada falla registrada en un equipo. Alimenta el cálculo de TMEF y TMPR.
 */
export const eventoFalla = pgTable("evento_falla", {
  id:              serial("id").primaryKey(),
  equipoId:        text("equipo_id").notNull().references(() => equipo.id),
  fecha:           timestamp("fecha", { withTimezone: true }).notNull(),
  descripcion:     text("descripcion").notNull(),
  componente:      text("componente"),                                      // "Motor", "Hidráulico", "Transmisión", etc.
  hrsReparacion:   decimal("hrs_reparacion", { precision: 5, scale: 1 }).notNull(),
  resuelta:        boolean("resuelta").notNull().default(false),
  creadoPor:       text("creado_por"),
  createdAt:       timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ─── 9. ALERTA ────────────────────────────────────────────────────────────
 * Alertas generadas cuando un KPI supera un umbral
 */
export const alerta = pgTable("alerta", {
  id:             serial("id").primaryKey(),
  equipoId:       text("equipo_id").notNull().references(() => equipo.id),
  periodoId:      integer("periodo_id").notNull().references(() => periodo.id),
  kpi:            text("kpi").notNull(),
  valorActual:    decimal("valor_actual",   { precision: 8, scale: 2 }).notNull(),
  umbralCritico:  decimal("umbral_critico", { precision: 8, scale: 2 }).notNull(),
  estado:         text("estado").notNull(),                         // "verde" | "ambar" | "rojo" | "paro"
  mensaje:        text("mensaje").notNull(),
  resuelta:       boolean("resuelta").notNull().default(false),
  accionTomada:   text("accion_tomada"),                            // qué se hizo para resolver
  resueltaPor:    text("resuelta_por"),                             // quién resolvió
  resueltaEn:     timestamp("resuelta_en", { withTimezone: true }), // cuándo se resolvió
  timestamp:      timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

/* ─── 8. ANALISIS_APD ───────────────────────────────────────────────────────
 * Sesión de carga de análisis de aceite (un CSV importado)
 */
export const analisisApd = pgTable("analisis_apd", {
  id:             serial("id").primaryKey(),
  periodoId:      integer("periodo_id").notNull().references(() => periodo.id),
  fechaAnalisis:  date("fecha_analisis").notNull(),
  archivoOrigen:  text("archivo_origen").notNull(),                 // "APD_Abril2025.csv"
  creadoPor:      text("creado_por"),
  createdAt:      timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ─── 9. MUESTRA_APD ────────────────────────────────────────────────────────
 * Cada resultado individual del análisis (una fila del CSV)
 */
export const muestraApd = pgTable("muestra_apd", {
  id:            serial("id").primaryKey(),
  analisisId:    integer("analisis_id").notNull().references(() => analisisApd.id, { onDelete: "cascade" }),
  equipoId:      text("equipo_id").notNull().references(() => equipo.id),
  compartimento: text("compartimento").notNull(),                   // "Motor", "Transmisión", etc
  parametro:     text("parametro").notNull(),                       // "Viscosidad", "Hierro (Fe)", etc
  valor:         decimal("valor", { precision: 12, scale: 4 }).notNull(),
  unidad:        text("unidad").notNull(),                          // "cSt", "ppm", etc
  limiteMinimo:  decimal("limite_minimo", { precision: 12, scale: 4 }),
  limiteMaximo:  decimal("limite_maximo", { precision: 12, scale: 4 }),
  estado:        text("estado").notNull(),                          // "verde" | "ambar" | "rojo"
});

/* ─── Relaciones ────────────────────────────────────────────────────────────
 * Permiten queries con joins tipados: db.query.equipo.findMany({ with: { kpis: true } })
 */
export const tipoFlotaRelations = relations(tipoFlota, ({ many }) => ({
  equipos: many(equipo),
}));

export const equipoRelations = relations(equipo, ({ one, many }) => ({
  tipoFlota:  one(tipoFlota, { fields: [equipo.tipoFlotaId], references: [tipoFlota.id] }),
  kpis:       many(kpiEquipo),
  asarcos:    many(asarcoEquipo),
  alertas:    many(alerta),
  muestras:   many(muestraApd),
  registros:  many(registroDiario),
  fallas:     many(eventoFalla),
}));

export const periodoRelations = relations(periodo, ({ many }) => ({
  kpis:      many(kpiEquipo),
  asarcos:   many(asarcoEquipo),
  alertas:   many(alerta),
  analisis:  many(analisisApd),
}));

export const kpiEquipoRelations = relations(kpiEquipo, ({ one }) => ({
  equipo:   one(equipo,   { fields: [kpiEquipo.equipoId],   references: [equipo.id] }),
  periodo:  one(periodo,  { fields: [kpiEquipo.periodoId],  references: [periodo.id] }),
}));

export const asarcoEquipoRelations = relations(asarcoEquipo, ({ one }) => ({
  equipo:   one(equipo,  { fields: [asarcoEquipo.equipoId],  references: [equipo.id] }),
  periodo:  one(periodo, { fields: [asarcoEquipo.periodoId], references: [periodo.id] }),
}));

export const alertaRelations = relations(alerta, ({ one }) => ({
  equipo:   one(equipo,  { fields: [alerta.equipoId],  references: [equipo.id] }),
  periodo:  one(periodo, { fields: [alerta.periodoId], references: [periodo.id] }),
}));

export const analisisApdRelations = relations(analisisApd, ({ one, many }) => ({
  periodo:   one(periodo, { fields: [analisisApd.periodoId], references: [periodo.id] }),
  muestras:  many(muestraApd),
}));

export const muestraApdRelations = relations(muestraApd, ({ one }) => ({
  analisis: one(analisisApd, { fields: [muestraApd.analisisId], references: [analisisApd.id] }),
  equipo:   one(equipo,      { fields: [muestraApd.equipoId],   references: [equipo.id] }),
}));

export const registroDiarioRelations = relations(registroDiario, ({ one }) => ({
  equipo: one(equipo, { fields: [registroDiario.equipoId], references: [equipo.id] }),
}));

export const eventoFallaRelations = relations(eventoFalla, ({ one }) => ({
  equipo: one(equipo, { fields: [eventoFalla.equipoId], references: [equipo.id] }),
}));

/* ─── 10. AUDIT_LOG ───────────────────────────────────────────────────────
 * Registro de auditoría: quién hizo qué y cuándo. Inmutable (solo INSERT).
 */
export const auditLog = pgTable("audit_log", {
  id:          serial("id").primaryKey(),
  tabla:       text("tabla").notNull(),                            // "kpi_equipo", "alerta", etc.
  registroId:  text("registro_id").notNull(),                      // ID del registro afectado
  operacion:   text("operacion").notNull(),                        // "INSERT" | "UPDATE" | "DELETE"
  usuario:     text("usuario").notNull().default("admin"),         // quién realizó la acción
  detalles:    text("detalles"),                                   // descripción legible del cambio
  createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ─── Tipos derivados (insert / select) ─────────────────────────────────────
 * Drizzle infiere los tipos desde el schema → no hay drift entre BD y TS.
 */
export type TipoFlota       = typeof tipoFlota.$inferSelect;
export type Equipo          = typeof equipo.$inferSelect;
export type Periodo         = typeof periodo.$inferSelect;
export type UmbralKpi       = typeof umbralKpi.$inferSelect;
export type KpiEquipo       = typeof kpiEquipo.$inferSelect;
export type AsarcoEquipo    = typeof asarcoEquipo.$inferSelect;
export type Alerta          = typeof alerta.$inferSelect;
export type AnalisisApd     = typeof analisisApd.$inferSelect;
export type MuestraApd      = typeof muestraApd.$inferSelect;

export type NewTipoFlota    = typeof tipoFlota.$inferInsert;
export type NewEquipo       = typeof equipo.$inferInsert;
export type NewPeriodo      = typeof periodo.$inferInsert;
export type NewUmbralKpi    = typeof umbralKpi.$inferInsert;
export type NewKpiEquipo    = typeof kpiEquipo.$inferInsert;
export type NewAsarcoEquipo = typeof asarcoEquipo.$inferInsert;
export type NewAlerta       = typeof alerta.$inferInsert;
export type NewAnalisisApd    = typeof analisisApd.$inferInsert;
export type NewMuestraApd     = typeof muestraApd.$inferInsert;
export type AuditLog          = typeof auditLog.$inferSelect;
export type NewAuditLog       = typeof auditLog.$inferInsert;
export type RegistroDiario    = typeof registroDiario.$inferSelect;
export type NewRegistroDiario = typeof registroDiario.$inferInsert;
export type EventoFalla       = typeof eventoFalla.$inferSelect;
export type NewEventoFalla    = typeof eventoFalla.$inferInsert;
