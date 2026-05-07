export const revalidate = 0;

import { getUmbralesActivos } from "@/lib/db/queries/umbrales";
import { UmbralesAdminClient } from "./UmbralesAdminClient";
import { UMBRALES } from "@/lib/constants/umbrales";
import type { UmbralKpi } from "@/lib/db/schema";

// Si no hay umbrales en BD, genera filas virtuales desde las constantes del código
function umbralesDefault(): Omit<UmbralKpi, "createdAt">[] {
  return [
    { id: 0, kpi: "dfm",             nivelVerde: "85", nivelAmbar: "75", invertido: false, vigenteDesde: "—", vigenteHasta: null },
    { id: 0, kpi: "tmef",            nivelVerde: "80", nivelAmbar: "50", invertido: false, vigenteDesde: "—", vigenteHasta: null },
    { id: 0, kpi: "tmpr",            nivelVerde: "5",  nivelAmbar: "15", invertido: true,  vigenteDesde: "—", vigenteHasta: null },
    { id: 0, kpi: "tiempoOperativo", nivelVerde: "80", nivelAmbar: "65", invertido: false, vigenteDesde: "—", vigenteHasta: null },
    { id: 0, kpi: "reserva",         nivelVerde: "8",  nivelAmbar: "20", invertido: true,  vigenteDesde: "—", vigenteHasta: null },
  ];
}

void UMBRALES; // usado como referencia; los valores reales vienen de BD

export default async function UmbralesPage() {
  const umbralesDb = await getUmbralesActivos();
  const umbrales = umbralesDb.length > 0 ? umbralesDb : umbralesDefault();
  return <UmbralesAdminClient umbrales={umbrales} hayDatosBd={umbralesDb.length > 0} />;
}
