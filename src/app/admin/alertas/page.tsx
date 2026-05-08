export const revalidate = 0;

import { getPeriodos } from "@/lib/db/queries/periodos";
import { AlertasAdminClient } from "./AlertasAdminClient";

export default async function AdminAlertasPage() {
  const periodos = await getPeriodos();
  return <AlertasAdminClient periodos={periodos} />;
}
