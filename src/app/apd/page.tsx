import type { Metadata } from "next";
export const metadata: Metadata = { title: "APD Aceites" };
export const revalidate = 300;

import { getPeriodos } from "@/lib/db/queries/periodos";
import { listarAnalisis } from "@/lib/db/queries/apd";
import { ApdClient } from "./ApdClient";

export default async function ApdPage() {
  const [periodos, analisis] = await Promise.all([getPeriodos(), listarAnalisis()]);
  return <ApdClient periodos={periodos} analisis={analisis} />;
}
