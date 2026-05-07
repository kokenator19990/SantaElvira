export const revalidate = 300;

import { getFlota } from "@/lib/db/queries/flota";
import { getPeriodos } from "@/lib/db/queries/periodos";
import { getKpisDeltaFlota } from "@/lib/db/queries/tendencias";
import { ReporteClient } from "./ReporteClient";

export default async function ReportePage() {
  const [flota, periodos, delta] = await Promise.all([
    getFlota(),
    getPeriodos(),
    getKpisDeltaFlota(),
  ]);
  return <ReporteClient flota={flota} periodos={periodos} delta={delta} />;
}
