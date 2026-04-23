"use client";

import { CsvUploader } from "@/components/apd/CsvUploader";
import { ApdParameterTable } from "@/components/apd/ApdParameterTable";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useCsvApd } from "@/hooks/useCsvApd";
import { AlertTriangle, Info } from "lucide-react";

export default function ApdPage() {
  const { estado, datos, nombreArchivo, error, procesarArchivo, limpiar } = useCsvApd();

  const criticos    = datos.filter((p) => p.estado === "rojo").length;
  const advertencias = datos.filter((p) => p.estado === "ambar").length;

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto">
      <SectionTitle>APD — Análisis Predictivo de Aceites</SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        {/* Panel izquierdo */}
        <div className="flex flex-col gap-4">
          <CsvUploader
            onArchivo={procesarArchivo}
            nombreArchivo={nombreArchivo}
            onLimpiar={limpiar}
            estado={estado}
          />

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-[9px] bg-[#FEF2F2] border border-[#FECACA]">
              <AlertTriangle size={15} className="text-[#B91C1C] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#991B1B] leading-relaxed">{error}</p>
            </div>
          )}

          {/* Resumen si hay datos */}
          {estado === "done" && (
            <div className="flex flex-col gap-2.5 p-4 rounded-[10px] bg-[#FAFAFA] border border-[#E4E4E7]">
              <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em] mb-1">
                Resumen del análisis
              </p>
              {[
                { label: "Total parámetros", valor: datos.length,   color: "#09090B" },
                { label: "Fuera de rango",   valor: criticos,        color: "#B91C1C" },
                { label: "En advertencia",   valor: advertencias,    color: "#B45309" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#71717A]">{s.label}</span>
                  <span className="font-mono font-bold text-[15px]" style={{ color: s.color }}>
                    {s.valor}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Formato esperado */}
          <div className="flex flex-col gap-2 p-4 rounded-[10px] bg-[#FAFAFA] border border-[#E4E4E7]">
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-[#A1A1AA]" />
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.08em]">
                Formato CSV esperado
              </span>
            </div>
            <pre className="text-[10px] text-[#52525B] font-mono whitespace-pre-wrap leading-relaxed">
{`Equipo,Compartimento,Parámetro,Valor,Unidad,LimMin,LimMax
CH-01,Motor,Fe,18,ppm,,30
CH-01,Motor,Cu,5,ppm,,20
CH-01,Transmisión,Fe,25,ppm,,40`}
            </pre>
          </div>
        </div>

        {/* Panel derecho — resultados */}
        <div>
          {estado === "idle" && (
            <div className="flex flex-col items-center justify-center h-64 rounded-[10px] bg-white border border-dashed border-[#E4E4E7] gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                <Info size={18} className="text-[#A1A1AA]" />
              </div>
              <p className="text-[12px] text-[#A1A1AA] text-center max-w-[200px] leading-relaxed">
                Sube un archivo CSV para visualizar los resultados del análisis
              </p>
            </div>
          )}
          {estado === "parsing" && (
            <div className="flex flex-col items-center justify-center h-64 rounded-[10px] bg-white border border-[#FDE68A] gap-3">
              <div className="w-8 h-8 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-[#B45309]/80">Procesando archivo…</p>
            </div>
          )}
          {estado === "done" && <ApdParameterTable datos={datos} />}
          {estado === "error" && (
            <div className="flex items-center justify-center h-64 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA]">
              <p className="text-[13px] text-[#991B1B]">No se pudo procesar el archivo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
