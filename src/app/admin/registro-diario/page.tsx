export const revalidate = 300;

import { db } from "@/lib/db/index";
import * as t from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { RegistroDiarioClient } from "./RegistroDiarioClient";

export default async function RegistroDiarioPage() {
  const equipos = await db
    .select({ id: t.equipo.id, modelo: t.equipo.modelo, tipoFlotaId: t.equipo.tipoFlotaId })
    .from(t.equipo)
    .where(eq(t.equipo.enServicio, true))
    .orderBy(asc(t.equipo.id));

  return <RegistroDiarioClient equipos={equipos} />;
}
