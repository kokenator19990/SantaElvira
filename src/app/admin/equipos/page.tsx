export const revalidate = 300;

import { getFlota, getEquiposInactivos } from "@/lib/db/queries/flota";
import { EquiposAdminClient } from "./EquiposAdminClient";

export default async function AdminEquiposPage() {
  const [flota, inactivos] = await Promise.all([getFlota(), getEquiposInactivos()]);
  return <EquiposAdminClient flota={flota} inactivos={inactivos} />;
}
