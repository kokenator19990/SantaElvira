"use client";

import { useState } from "react";
import { Printer, FileDown } from "lucide-react";
import { FLOTA } from "@/lib/data/flota";
import { calcularResumenFlota } from "@/lib/data/flota-resumen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ReportePreview } from "@/components/reporte/ReportePreview";
import type { FlotaResumen } from "@/lib/domain/tipos";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const PERIODOS = ["Abril 2025", "Marzo 2025", "Febrero 2025", "Enero 2025"];

export default function ReportePage() {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);

  const flotas: FlotaResumen[] = [
    calcularResumenFlota("785D",   "CAT 785D"),
    calcularResumenFlota("777F",   "CAT 777F"),
    calcularResumenFlota("992",    "CAT 992"),
    calcularResumenFlota("PC2000", "Komatsu PC-2000"),
  ];
  const equiposEnParo   = FLOTA.filter((e) => e.paroTotal);
  const equiposCriticos = FLOTA.filter((e) => !e.paroTotal && e.semaforo.general === "rojo");

  function imprimir() {
    const prev = document.title;
    document.title = `MSG_Informe_${periodo.replace(" ","_")}.pdf`;
    window.print();
    document.title = prev;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1000px] mx-auto">
      {/* Controles — ocultos al imprimir */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionTitle>Informe Mensual</SectionTitle>
        <div className="flex items-center gap-3">
          <Tooltip short="Selecciona el mes del informe a generar" help={HELP.periodoReporte}>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-3 py-2 rounded-[8px] bg-white border border-[#E4E4E7] text-[13px] text-[#3F3F46] focus:outline-none focus:border-[#B45309] transition-colors"
              aria-label="Seleccionar período del informe"
            >
              {PERIODOS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Tooltip>

          <button
            onClick={imprimir}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#09090B] hover:bg-[#27272A] text-white text-[13px] font-semibold transition-colors duration-150 min-h-[40px] min-w-[44px]"
            aria-label="Imprimir o exportar como PDF"
          >
            <Printer size={15} />
            <span className="hidden sm:block">Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Tip */}
      <div className="no-print flex items-start gap-2.5 px-3.5 py-2.5 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]">
        <FileDown size={14} className="text-[#A1A1AA] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#71717A] leading-relaxed">
          En el diálogo de impresión, selecciona &ldquo;Guardar como PDF&rdquo; para exportar el informe.
          El sidebar y controles se ocultan automáticamente en la impresión.
        </p>
      </div>

      {/* Vista previa */}
      <ReportePreview
        periodo={periodo}
        flotas={flotas}
        equiposCriticos={equiposCriticos}
        equiposEnParo={equiposEnParo}
      />
    </div>
  );
}
