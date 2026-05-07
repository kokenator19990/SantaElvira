export const revalidate = 300;

import { getKpisExplorador, getRegistrosExplorador, getFallasExplorador } from "@/lib/db/queries/explorador";
import { getComparativaTurnos, hayDatosPorTurno } from "@/lib/db/queries/turnos";
import { ExploradorClient } from "./ExploradorClient";
import type { ComparativaTurno } from "@/lib/db/queries/turnos";

export default async function ExploradorPage() {
  const [kpis, registros, fallas, tieneTurnos] = await Promise.all([
    getKpisExplorador(),
    getRegistrosExplorador(),
    getFallasExplorador(),
    hayDatosPorTurno(),
  ]);

  let turnos: ComparativaTurno[] = [];
  if (tieneTurnos) {
    turnos = await getComparativaTurnos();
  }

  return <ExploradorClient kpis={kpis} registros={registros} fallas={fallas} turnos={turnos} />;
}
