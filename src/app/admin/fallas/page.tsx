export const revalidate = 300;

import { db } from "@/lib/db/index";
import * as t from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { FallasClient } from "./FallasClient";

export default async function FallasPage() {
  const equipos = await db
    .select({ id: t.equipo.id, modelo: t.equipo.modelo, tipoFlotaId: t.equipo.tipoFlotaId })
    .from(t.equipo)
    .where(eq(t.equipo.enServicio, true))
    .orderBy(asc(t.equipo.id));

  const fallas = await db
    .select({
      id: t.eventoFalla.id,
      equipoId: t.eventoFalla.equipoId,
      fecha: t.eventoFalla.fecha,
      descripcion: t.eventoFalla.descripcion,
      componente: t.eventoFalla.componente,
      hrsReparacion: t.eventoFalla.hrsReparacion,
      resuelta: t.eventoFalla.resuelta,
    })
    .from(t.eventoFalla)
    .orderBy(desc(t.eventoFalla.fecha))
    .limit(200);

  const fallasSerializadas = fallas.map((f) => ({
    ...f,
    fecha: f.fecha.toISOString(),
    hrsReparacion: parseFloat(f.hrsReparacion),
  }));

  return <FallasClient equipos={equipos} fallasIniciales={fallasSerializadas} />;
}
