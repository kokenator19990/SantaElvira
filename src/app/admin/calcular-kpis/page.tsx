export const revalidate = 300;

import { getPeriodos } from "@/lib/db/queries/periodos";
import { CalcularKpisClient } from "./CalcularKpisClient";

export default async function CalcularKpisPage() {
  const periodos = await getPeriodos();
  return <CalcularKpisClient periodos={periodos} />;
}
