"use client";

import { useState } from "react";
import { Printer, FileDown, FileText, BarChart2, Database, Download } from "lucide-react";
import { calcularResumenFlota } from "@/lib/data/flota-resumen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import { ReportePreview } from "@/components/reporte/ReportePreview";
import { ComparacionPeriodos } from "@/components/reporte/lazy";
import { IntegracionDatos } from "@/components/reporte/IntegracionDatos";
import { ExportHistorico } from "@/components/reporte/ExportHistorico";
import { exportarCsv } from "@/lib/utils/export-csv";
import type { Equipo, FlotaResumen } from "@/lib/domain/tipos";
import type { Periodo } from "@/lib/db/schema";
import type { KpisDelta } from "@/lib/db/queries/tendencias";
import { clsx } from "clsx";

type Tab = "informe" | "comparar" | "integracion";

export function ReporteClient({ flota, periodos, delta, periodoActual }: { flota: Equipo[]; periodos: Periodo[]; delta: KpisDelta | null; periodoActual?: Periodo }) {
  const [tab, setTab]       = useState<Tab>("informe");
  const periodo = periodoActual?.label ?? periodos[0]?.label ?? "Sin datos";

  const flotas: FlotaResumen[] = [
    calcularResumenFlota("785D",   "CAT 785D",        flota),
    calcularResumenFlota("777F",   "CAT 777F",        flota),
    calcularResumenFlota("992",    "CAT 992",         flota),
    calcularResumenFlota("PC2000", "Komatsu PC-2000", flota),
  ];
  const equiposEnParo   = flota.filter((e) => e.paroTotal);
  const equiposCriticos = flota.filter((e) => !e.paroTotal && e.semaforo.general === "rojo");

  function imprimir() {
    const prev = document.title;
    document.title = `MSG_Informe_${periodo.replace(/\s+/g, "_")}.pdf`;
    window.print();
    document.title = prev;
  }

  function exportarExcel() {
    const periodoSlug = periodo.replace(/\s+/g, "_");
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
    ], `MSG_Reporte_${periodoSlug}.csv`);
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1000px] mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionTitle>
          <Tooltip short="Informe mensual de mantención exportable como PDF" help={HELP.navReporte}>
            Reporte
          </Tooltip>
        </SectionTitle>

        {tab === "informe" && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 rounded-[8px] bg-white border border-[#E4E4E7] text-[15px] text-[#3F3F46] font-mono">
              {periodo}
            </span>
            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[#52525B] text-[15px] font-semibold transition-colors duration-150 min-h-[40px]"
              aria-label="Descargar datos como CSV para Excel"
            >
              <Download size={15} />
              <span className="hidden sm:block">Excel</span>
            </button>
            <button
              onClick={imprimir}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#09090B] hover:bg-[#27272A] text-white text-[15px] font-semibold transition-colors duration-150 min-h-[40px]"
              aria-label="Imprimir o exportar como PDF"
            >
              <Printer size={15} />
              <span className="hidden sm:block">Imprimir / PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="no-print flex gap-1 p-1 rounded-[10px] bg-[#F4F4F5] border border-[#E4E4E7] w-fit">
        {([
          { id: "informe",     label: "Informe del Mes",   icon: FileText,  helpKey: "reporteInforme" },
          { id: "comparar",    label: "Comparar Períodos", icon: BarChart2, helpKey: "reporteComparar" },
          { id: "integracion", label: "Integrar Datos",    icon: Database,  helpKey: "reporteIntegrar" },
        ] as const).map(({ id, label, icon: Icon, helpKey }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-[8px] text-[15px] font-medium transition-all duration-150",
              tab === id
                ? "bg-white text-[#09090B] shadow-sm"
                : "text-[#71717A] hover:text-[#09090B]"
            )}
          >
            <Icon size={14} strokeWidth={tab === id ? 2.2 : 1.7} />
            <Tooltip short={HELP[helpKey]?.titulo ?? label} help={HELP[helpKey]}>
              <span className="cursor-help">{label}</span>
            </Tooltip>
          </button>
        ))}
      </div>

      {/* ── Tip PDF (solo tab informe) ──────────────────────────────────────── */}
      {tab === "informe" && (
        <div className="no-print flex items-start gap-2.5 px-3.5 py-2.5 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]">
          <FileDown size={14} className="text-[#A1A1AA] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#71717A] leading-relaxed">
            En el diálogo de impresión, selecciona{" "}
            <strong className="text-[#52525B]">&ldquo;Guardar como PDF&rdquo;</strong>{" "}
            para exportar. El sidebar y controles se ocultan automáticamente.
          </p>
        </div>
      )}

      {/* ── Contenido por tab ──────────────────────────────────────────────── */}
      {tab === "informe" && (
        <ReportePreview
          periodo={periodo}
          flotas={flotas}
          equiposCriticos={equiposCriticos}
          equiposEnParo={equiposEnParo}
          flota={flota}
          delta={delta}
        />
      )}
      {tab === "comparar" && (
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-[#E4E4E7] p-5">
            <ComparacionPeriodos />
          </div>
          <div className="bg-white rounded-xl border border-[#E4E4E7] p-5">
            <ExportHistorico periodos={periodos} />
          </div>
        </div>
      )}
      {tab === "integracion" && (
        <IntegracionDatos />
      )}
    </div>
  );
}
