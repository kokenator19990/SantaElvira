/**
 * Seeder inicial — toma los datos mock actuales (FLOTA, ALERTAS, ASARCO_FLOTA,
 * TENDENCIAS) y los inserta en la base de datos Supabase.
 *
 * Idempotente: usa onConflictDoNothing en catalogos y borra+recrea en datos
 * mensuales para que se pueda re-ejecutar sin duplicar.
 *
 * Uso:  npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

import * as schema from "./schema";
import { FLOTA } from "../data/flota";
import { ALERTAS } from "../data/alertas";
import { ASARCO_FLOTA } from "../data/asarco";
import { TENDENCIAS } from "../data/tendencias";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✗ DATABASE_URL no definida en .env.local");
  process.exit(1);
}

// Salvaguarda destructiva: el seed hace TRUNCATE CASCADE de TODAS las tablas.
// Para evitar destruir producción por accidente, requiere SEED_ALLOW_DESTRUCTIVE=1 explícito.
if (process.env.SEED_ALLOW_DESTRUCTIVE !== "1") {
  console.error("");
  console.error("✗ Este script BORRA todas las tablas (TRUNCATE CASCADE).");
  console.error("  Si estás seguro, ejecuta:");
  console.error("    SEED_ALLOW_DESTRUCTIVE=1 npm run db:seed       (Linux/Mac)");
  console.error("    $env:SEED_ALLOW_DESTRUCTIVE=\"1\"; npm run db:seed   (PowerShell)");
  console.error("");
  console.error("  Verifica primero a qué BD apunta DATABASE_URL en .env.local.");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema, casing: "snake_case" });

// ─── Catálogos ────────────────────────────────────────────────────────────────
const TIPOS_FLOTA: schema.NewTipoFlota[] = [
  { id: "785D",   codigo: "785D",   descripcion: "Camion de acarreo CAT 785D",   fabricante: "Caterpillar" },
  { id: "777F",   codigo: "777F",   descripcion: "Camion de acarreo CAT 777F",   fabricante: "Caterpillar" },
  { id: "992",    codigo: "992",    descripcion: "Cargadora frontal CAT 992",    fabricante: "Caterpillar" },
  { id: "PC2000", codigo: "PC2000", descripcion: "Excavadora Komatsu PC-2000",   fabricante: "Komatsu" },
];

const UMBRALES_KPI: schema.NewUmbralKpi[] = [
  { kpi: "dfm",              nivelVerde: "85",  nivelAmbar: "75",  invertido: false, vigenteDesde: "2024-01-01" },
  { kpi: "tmef",             nivelVerde: "80",  nivelAmbar: "50",  invertido: false, vigenteDesde: "2024-01-01" },
  { kpi: "tmpr",             nivelVerde: "5",   nivelAmbar: "15",  invertido: true,  vigenteDesde: "2024-01-01" },
  { kpi: "tiempo_operativo", nivelVerde: "80",  nivelAmbar: "65",  invertido: false, vigenteDesde: "2024-01-01" },
  { kpi: "reserva",          nivelVerde: "8",   nivelAmbar: "20",  invertido: true,  vigenteDesde: "2024-01-01" },
];

// ─── Períodos: 6 meses Nov 2024 → Abr 2025 (matching TENDENCIAS) ─────────────
const PERIODOS_DEF = [
  { mesKey: "Nov 24", anio: 2024, mes: 11, label: "Noviembre 2024" },
  { mesKey: "Dic 24", anio: 2024, mes: 12, label: "Diciembre 2024" },
  { mesKey: "Ene 25", anio: 2025, mes:  1, label: "Enero 2025" },
  { mesKey: "Feb 25", anio: 2025, mes:  2, label: "Febrero 2025" },
  { mesKey: "Mar 25", anio: 2025, mes:  3, label: "Marzo 2025" },
  { mesKey: "Abr 25", anio: 2025, mes:  4, label: "Abril 2025" },
];

async function seed() {
  console.log("→ Limpiando tablas (orden inverso de FKs)...");
  await db.execute(sql`TRUNCATE TABLE muestra_apd, analisis_apd, alerta, asarco_equipo, kpi_equipo, periodo, umbral_kpi, equipo, tipo_flota RESTART IDENTITY CASCADE`);

  console.log("→ Insertando tipos de flota (4)...");
  await db.insert(schema.tipoFlota).values(TIPOS_FLOTA);

  console.log("→ Insertando umbrales KPI (5)...");
  await db.insert(schema.umbralKpi).values(UMBRALES_KPI);

  console.log(`→ Insertando equipos (${FLOTA.length})...`);
  await db.insert(schema.equipo).values(
    FLOTA.map((e) => ({
      id: e.id,
      tipoFlotaId: e.tipoFlota,
      modelo: e.modelo,
      anioFabricacion: e.anio,
      enServicio: true,
    }))
  );

  console.log(`→ Insertando periodos (${PERIODOS_DEF.length})...`);
  const periodosInsertados = await db
    .insert(schema.periodo)
    .values(PERIODOS_DEF.map(({ anio, mes, label }) => ({ anio, mes, label, cerrado: mes !== 4 || anio !== 2025 })))
    .returning();

  const periodoIdByKey = new Map<string, number>();
  PERIODOS_DEF.forEach((p, i) => periodoIdByKey.set(p.mesKey, periodosInsertados[i].id));

  // ─── KPIs por equipo: Abril 2025 con datos actuales (FLOTA), meses anteriores
  //     derivados de TENDENCIAS (promedio del tipo aplicado a cada equipo, con
  //     pequeña jitter para que no se vea idéntico). En Fase 3 esto lo carga
  //     un supervisor desde el formulario web.
  // ─────────────────────────────────────────────────────────────────────────
  const periodoAbrId = periodoIdByKey.get("Abr 25")!;
  const kpisAbril: schema.NewKpiEquipo[] = FLOTA.map((e) => ({
    equipoId:        e.id,
    periodoId:       periodoAbrId,
    dfm:              String(e.kpis.dfm),
    tmef:             String(e.kpis.tmef),
    tmpr:             String(e.kpis.tmpr),
    tiempoOperativo:  String(e.kpis.tiempoOperativo),
    reserva:          String(e.kpis.reserva),
    horasAcumuladas:  e.horasAcumuladas,
    paroTotal:        e.paroTotal,
    motivoParo:       e.motivoParo ?? null,
    creadoPor:        "seed",
  }));

  console.log(`→ Insertando KPIs Abril 2025 (${kpisAbril.length})...`);
  await db.insert(schema.kpiEquipo).values(kpisAbril);

  // ASARCO Abril por equipo
  const asarcoAbril: schema.NewAsarcoEquipo[] = FLOTA.map((e) => ({
    equipoId:          e.id,
    periodoId:         periodoAbrId,
    pctOperativo:      String(e.asarco.operativo),
    pctReserva:        String(e.asarco.reserva),
    pctDetProgramada:  String(e.asarco.detencionProgramada),
    pctDetNoProg:      String(e.asarco.detencionNoProgramada),
    pctPerdidaOp:      String(e.asarco.perdidaOperacional),
  }));
  console.log(`→ Insertando ASARCO Abril 2025 (${asarcoAbril.length})...`);
  await db.insert(schema.asarcoEquipo).values(asarcoAbril);

  // KPIs históricos: meses anteriores generados desde TENDENCIAS
  const tendByTipo = new Map(TENDENCIAS.map((t) => [t.tipoFlota, t]));
  const kpisHistoricos: schema.NewKpiEquipo[] = [];
  const asarcoHistoricos: schema.NewAsarcoEquipo[] = [];

  for (const { mesKey } of PERIODOS_DEF.slice(0, 5)) { // Nov..Mar
    const periodoId = periodoIdByKey.get(mesKey)!;
    for (const eq of FLOTA) {
      const tend = tendByTipo.get(eq.tipoFlota);
      const punto = tend?.datos.find((d) => d.mes === mesKey);
      if (!punto) continue;
      // Jitter ±2% para que no todos los equipos del mismo tipo sean idénticos
      const jitter = (n: number) => Math.max(0, Math.round((n + (Math.random() - 0.5) * 4) * 10) / 10);
      kpisHistoricos.push({
        equipoId:        eq.id,
        periodoId,
        dfm:             String(eq.paroTotal && mesKey === "Mar 25" ? 0 : jitter(punto.dfm)),
        tmef:            String(eq.paroTotal && mesKey === "Mar 25" ? 0 : jitter(punto.tmef)),
        tmpr:            String(eq.paroTotal && mesKey === "Mar 25" ? 0 : jitter(punto.tmpr)),
        tiempoOperativo: String(jitter(punto.tiempoOperativo)),
        reserva:         String(jitter(punto.reserva)),
        horasAcumuladas: eq.horasAcumuladas - 200 * (5 - PERIODOS_DEF.findIndex((p) => p.mesKey === mesKey)),
        paroTotal:       false,
        motivoParo:      null,
        creadoPor:       "seed",
      });
      // ASARCO histórico: usar la distribución del tipo (ASARCO_FLOTA) levemente jittered
      const distTipo = ASARCO_FLOTA.find((a) => a.tipoFlota === eq.tipoFlota)?.distribucion;
      if (distTipo) {
        asarcoHistoricos.push({
          equipoId: eq.id,
          periodoId,
          pctOperativo:     String(jitter(distTipo.operativo)),
          pctReserva:       String(jitter(distTipo.reserva)),
          pctDetProgramada: String(jitter(distTipo.detencionProgramada)),
          pctDetNoProg:     String(jitter(distTipo.detencionNoProgramada)),
          pctPerdidaOp:     String(jitter(distTipo.perdidaOperacional)),
        });
      }
    }
  }

  console.log(`→ Insertando KPIs históricos (${kpisHistoricos.length})...`);
  // Inserciones en chunks de 200 para no exceder el límite de parámetros
  for (let i = 0; i < kpisHistoricos.length; i += 200) {
    await db.insert(schema.kpiEquipo).values(kpisHistoricos.slice(i, i + 200));
  }

  console.log(`→ Insertando ASARCO históricos (${asarcoHistoricos.length})...`);
  for (let i = 0; i < asarcoHistoricos.length; i += 200) {
    await db.insert(schema.asarcoEquipo).values(asarcoHistoricos.slice(i, i + 200));
  }

  // ─── Alertas activas (Abril 2025, solo equipos con problema) ──────────────
  const alertasAbril: schema.NewAlerta[] = ALERTAS.map((a) => ({
    equipoId:       a.equipoId,
    periodoId:      periodoAbrId,
    kpi:            a.kpi,
    valorActual:    String(a.valorActual),
    umbralCritico:  String(a.umbralCritico),
    estado:         a.estado,
    mensaje:        a.mensaje,
    resuelta:       false,
  }));
  console.log(`→ Insertando alertas (${alertasAbril.length})...`);
  await db.insert(schema.alerta).values(alertasAbril);

  // ─── Análisis APD de ejemplo (vacío para Fase 0; los CSVs se cargan en runtime) ─
  console.log("→ Tablas analisis_apd / muestra_apd: vacías (se llenan al subir CSVs).");

  console.log("\n✓ Seed completado.");
  console.log(`  • ${TIPOS_FLOTA.length} tipos de flota`);
  console.log(`  • ${FLOTA.length} equipos`);
  console.log(`  • ${PERIODOS_DEF.length} periodos`);
  console.log(`  • ${UMBRALES_KPI.length} umbrales`);
  console.log(`  • ${kpisAbril.length + kpisHistoricos.length} registros KPI`);
  console.log(`  • ${asarcoAbril.length + asarcoHistoricos.length} registros ASARCO`);
  console.log(`  • ${alertasAbril.length} alertas`);
}

seed()
  .catch((err) => {
    console.error("\n✗ Seed falló:", err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
