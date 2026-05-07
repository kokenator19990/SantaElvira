export const revalidate = 0;

import { getPeriodos } from "@/lib/db/queries/periodos";
import { getFlota } from "@/lib/db/queries/flota";
import { KpisImportarClient } from "./KpisImportarClient";

export default async function KpisImportarPage() {
  const [periodos, flota] = await Promise.all([getPeriodos(), getFlota()]);
  const equipoIds = flota.map((e) => e.id);
  return <KpisImportarClient periodos={periodos} equipoIdsValidos={equipoIds} />;
}
