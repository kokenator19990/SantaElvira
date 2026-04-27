export const revalidate = 300;

import { getFlota } from "@/lib/db/queries/flota";
import { EquiposAdminClient } from "./EquiposAdminClient";

export default async function AdminEquiposPage() {
  const flota = await getFlota();
  return <EquiposAdminClient flota={flota} />;
}
