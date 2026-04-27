export const revalidate = 300;

import { getPeriodos } from "@/lib/db/queries/periodos";
import { PeriodosAdminClient } from "./PeriodosAdminClient";

export default async function AdminPeriodosPage() {
  const periodos = await getPeriodos();
  return <PeriodosAdminClient periodos={periodos} />;
}
