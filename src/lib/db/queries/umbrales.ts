import { isNull } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import type { UmbralKpi } from "../schema";

/**
 * Trae todos los umbrales actualmente vigentes (vigenteHasta IS NULL).
 */
export const getUmbralesActivos = cache(async (): Promise<UmbralKpi[]> => {
  return db
    .select()
    .from(t.umbralKpi)
    .where(isNull(t.umbralKpi.vigenteHasta))
    .orderBy(t.umbralKpi.kpi);
});
