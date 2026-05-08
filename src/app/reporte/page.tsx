import type { Metadata } from "next";
export const metadata: Metadata = { title: "Reporte" };
export const revalidate = 300;

import { getFlota } from "@/lib/db/queries/flota";
import { getPeriodos, getPeriodoActual } from "@/lib/db/queries/periodos";
import { getKpisDeltaFlota } from "@/lib/db/queries/tendencias";
import { ReporteClient } from "./ReporteClient";

export default async function ReportePage() {
  const [flota, periodos, delta, periodoActual] = await Promise.all([
    getFlota(),
    getPeriodos(),
    getKpisDeltaFlota(),
    getPeriodoActual(),
  ]);
  return <ReporteClient flota={flota} periodos={periodos} delta={delta} periodoActual={periodoActual} />;
}
