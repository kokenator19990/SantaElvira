import { desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "../index";
import * as t from "../schema";
import type { ParametroApd } from "@/lib/domain/tipos";

export interface AnalisisApdResumen {
  id: number;
  periodoLabel: string;
  fechaAnalisis: string;
  archivoOrigen: string;
  creadoPor: string | null;
  totalMuestras: number;
  enRojo: number;
  enAmbar: number;
}

export const listarAnalisis = cache(async (): Promise<AnalisisApdResumen[]> => {
  const filas = await db
    .select({
      id:            t.analisisApd.id,
      periodoLabel:  t.periodo.label,
      fechaAnalisis: t.analisisApd.fechaAnalisis,
      archivoOrigen: t.analisisApd.archivoOrigen,
      creadoPor:     t.analisisApd.creadoPor,
      muestraId:     t.muestraApd.id,
      muestraEstado: t.muestraApd.estado,
    })
    .from(t.analisisApd)
    .innerJoin(t.periodo, eq(t.periodo.id, t.analisisApd.periodoId))
    .leftJoin(t.muestraApd, eq(t.muestraApd.analisisId, t.analisisApd.id))
    .orderBy(desc(t.analisisApd.fechaAnalisis));

  // Agrupar por análisis
  const map = new Map<number, AnalisisApdResumen>();
  for (const f of filas) {
    let r = map.get(f.id);
    if (!r) {
      r = {
        id:            f.id,
        periodoLabel:  f.periodoLabel,
        fechaAnalisis: f.fechaAnalisis,
        archivoOrigen: f.archivoOrigen,
        creadoPor:     f.creadoPor,
        totalMuestras: 0,
        enRojo:        0,
        enAmbar:       0,
      };
      map.set(f.id, r);
    }
    if (f.muestraId !== null) {
      r.totalMuestras++;
      if (f.muestraEstado === "rojo")  r.enRojo++;
      if (f.muestraEstado === "ambar") r.enAmbar++;
    }
  }
  return Array.from(map.values());
});

export const getMuestrasDeAnalisis = cache(async (analisisId: number): Promise<ParametroApd[]> => {
  const rows = await db.select().from(t.muestraApd).where(eq(t.muestraApd.analisisId, analisisId));
  return rows.map((r): ParametroApd => ({
    equipo:        r.equipoId,
    compartimento: r.compartimento,
    parametro:     r.parametro,
    valor:         parseFloat(r.valor),
    unidad:        r.unidad,
    limiteMinimo:  r.limiteMinimo  ? parseFloat(r.limiteMinimo)  : null,
    limiteMaximo:  r.limiteMaximo  ? parseFloat(r.limiteMaximo)  : null,
    estado:        r.estado as ParametroApd["estado"],
  }));
});
