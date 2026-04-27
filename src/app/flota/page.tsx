import { getFlota } from "@/lib/db/queries/flota";
import { FlotaClientView } from "./FlotaClientView";

export default async function FlotaPage() {
  const flota = await getFlota();
  return <FlotaClientView flota={flota} />;
}
