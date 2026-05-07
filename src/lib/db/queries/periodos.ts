import { desc, asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import type { Periodo } from "../schema";

export const getPeriodos = cache(async (): Promise<Periodo[]> => {
  return db.select().from(t.periodo).orderBy(desc(t.periodo.anio), desc(t.periodo.mes));
});

export const getPeriodosAsc = cache(async (): Promise<Periodo[]> => {
  return db.select().from(t.periodo).orderBy(asc(t.periodo.anio), asc(t.periodo.mes));
});

export const getPeriodoActual = cache(async (): Promise<Periodo | undefined> => {
  const [p] = await db
    .select()
    .from(t.periodo)
    .innerJoin(t.kpiEquipo, eq(t.kpiEquipo.periodoId, t.periodo.id))
    .orderBy(desc(t.periodo.anio), desc(t.periodo.mes))
    .limit(1);
  return p?.periodo;
});
