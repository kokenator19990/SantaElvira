"use client";

import { Download } from "lucide-react";
import { exportarCsv } from "@/lib/utils/export-csv";
import type { Equipo } from "@/lib/domain/tipos";

export function DashboardExport({ flota, periodoLabel }: { flota: Equipo[]; periodoLabel: string }) {
  function handleExport() {
    const slug = periodoLabel.replace(/\s+/g, "_");
    exportarCsv(flota, [
      { header: "ID",             value: (e) => e.id },
      { header: "Modelo",         value: (e) => e.modelo },
      { header: "Tipo Flota",     value: (e) => e.tipoFlota },
      { header: "Año",            value: (e) => e.anio },
      { header: "Estado",         value: (e) => e.paroTotal ? "PARO" : e.semaforo.general.toUpperCase() },
      { header: "DFM %",          value: (e) => e.kpis.dfm },
      { header: "TMEF h",         value: (e) => e.kpis.tmef },
      { header: "TMPR h",         value: (e) => e.kpis.tmpr },
      { header: "T.Operativo %",  value: (e) => e.kpis.tiempoOperativo },
      { header: "Reserva %",      value: (e) => e.kpis.reserva },
      { header: "Horas Acum.",    value: (e) => e.horasAcumuladas },
      { header: "ASARCO Op %",         value: (e) => e.asarco.operativo },
      { header: "ASARCO Res %",        value: (e) => e.asarco.reserva },
      { header: "ASARCO Det.Prog %",   value: (e) => e.asarco.detencionProgramada },
      { header: "ASARCO Det.NoProg %", value: (e) => e.asarco.detencionNoProgramada },
      { header: "ASARCO Pérdida %",    value: (e) => e.asarco.perdidaOperacional },
      { header: "Motivo Paro",    value: (e) => e.motivoParo ?? "" },
    ], `MSG_Dashboard_${slug}.csv`);
  }

  if (flota.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-semibold text-[#52525B] transition-colors"
      title="Descargar KPIs del período como CSV (compatible con Excel)"
    >
      <Download size={13} />
      Exportar Excel
    </button>
  );
}
