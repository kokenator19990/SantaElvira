export const revalidate = 300;

import { getFlota } from "@/lib/db/queries/flota";
import { getPeriodos } from "@/lib/db/queries/periodos";
import { KpisAdminClient } from "./KpisAdminClient";

export default async function AdminKpisPage() {
  const [flota, periodos] = await Promise.all([getFlota(), getPeriodos()]);
  return <KpisAdminClient flota={flota} periodos={periodos} />;
}
