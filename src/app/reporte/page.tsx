"use client";

import { useState } from "react";
import { Printer, FileDown, FileText, BarChart2 } from "lucide-react";
import { FLOTA } from "@/lib/data/flota";
import { calcularResumenFlota } from "@/lib/data/flota-resumen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ReportePreview } from "@/components/reporte/ReportePreview";
import { ComparacionPeriodos } from "@/components/reporte/ComparacionPeriodos";
import type { FlotaResumen } from "@/lib/domain/tipos";
import { PERIODOS_DISPONIBLES } from "@/lib/data/periodos";
import { clsx } from "clsx";

const LABELS_PERIODO = PERIODOS_DISPONIBLES.map((p) => p.label);

type Tab = "informe" | "comparar";

export default function ReportePage() {
  const [tab, setTab]       = useState<Tab>("informe");
  const [periodo, setPeriodo] = useState(LABELS_PERIODO[0]);

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
    document.title = `MSG_Informe_${periodo.replace(" ", "_")}.pdf`;
    window.print();
    document.title = prev;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1000px] mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionTitle>Reporte</SectionTitle>

        {tab === "informe" && (
          <div className="flex items-center gap-2">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-3 py-2 rounded-[8px] bg-white border border-[#E4E4E7] text-[13px] text-[#3F3F46] focus:outline-none focus:border-[#B45309] transition-colors"
              aria-label="Seleccionar período del informe"
            >
              {LABELS_PERIODO.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              onClick={imprimir}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#09090B] hover:bg-[#27272A] text-white text-[13px] font-semibold transition-colors duration-150 min-h-[40px]"
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
          { id: "informe",  label: "Informe del Mes", icon: FileText },
          { id: "comparar", label: "Comparar Períodos", icon: BarChart2 },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all duration-150",
              tab === id
                ? "bg-white text-[#09090B] shadow-sm"
                : "text-[#71717A] hover:text-[#09090B]"
            )}
          >
            <Icon size={14} strokeWidth={tab === id ? 2.2 : 1.7} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tip PDF (solo tab informe) ──────────────────────────────────────── */}
      {tab === "informe" && (
        <div className="no-print flex items-start gap-2.5 px-3.5 py-2.5 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]">
          <FileDown size={14} className="text-[#A1A1AA] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#71717A] leading-relaxed">
            En el diálogo de impresión, selecciona{" "}
            <strong className="text-[#52525B]">&ldquo;Guardar como PDF&rdquo;</strong>{" "}
            para exportar. El sidebar y controles se ocultan automáticamente.
          </p>
        </div>
      )}

      {/* ── Contenido por tab ──────────────────────────────────────────────── */}
      {tab === "informe" ? (
        <ReportePreview
          periodo={periodo}
          flotas={flotas}
          equiposCriticos={equiposCriticos}
          equiposEnParo={equiposEnParo}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E4E4E7] p-5">
          <ComparacionPeriodos />
        </div>
      )}
    </div>
  );
}
