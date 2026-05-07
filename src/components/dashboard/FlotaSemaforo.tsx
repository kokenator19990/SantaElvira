"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { AlertTriangle } from "lucide-react";
import type { FlotaResumen, EstadoSemaforo } from "@/lib/domain/tipos";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const BORDE: Record<EstadoSemaforo, string> = {
  verde: "border-l-[#15803D]",
  ambar: "border-l-[#B45309]",
  rojo:  "border-l-[#B91C1C]",
  paro:  "border-l-[#991B1B]",
};

const SEMAFORO_LABEL: Record<EstadoSemaforo, string> = {
  verde: "Sin problemas",
  ambar: "En advertencia",
  rojo:  "Estado crítico",
  paro:  "Paro total",
};

function MiniBar({ valor, max = 100, color }: { valor: number; max?: number; color: string }) {
  const pct = Number.isFinite(valor / max) ? Math.max(0, Math.min((valor / max) * 100, 100)) : 0;
  return (
    <div className="h-[3px] rounded-full bg-[#F4F4F5] overflow-hidden mt-1">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

interface FlotaSemaforoProps {
  flotas: FlotaResumen[];
}

export function FlotaSemaforo({ flotas }: FlotaSemaforoProps) {
  if (flotas.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-[10px] bg-white border border-[#E4E4E7]">
        <p className="text-[13px] text-[#A1A1AA]">Sin datos de flota disponibles — carga KPIs desde Admin para ver el semáforo.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {flotas.map((flota, i) => {
        const colorMap: Record<EstadoSemaforo, string> = {
          verde: "#15803D", ambar: "#B45309", rojo: "#B91C1C", paro: "#991B1B",
        };
        const color = colorMap[flota.semaforoGeneral];

        return (
          <Link
            key={flota.tipo}
            href={`/flota?tipo=${flota.tipo}`}
            className={clsx(
              "animate-fade-in-up flex flex-col gap-3.5 p-4 rounded-[10px]",
              "bg-white border border-[#E4E4E7] border-l-[3px]",
              "hover:bg-[#F4F4F5] transition-all duration-150 group",
              BORDE[flota.semaforoGeneral]
            )}
            style={{ animationDelay: `${Math.min(i * 30, 120)}ms` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[17px] font-semibold text-[#09090B] leading-tight">{flota.modelo}</p>
                <p className="text-[12px] text-[#71717A] mt-0.5">
                  {flota.cantidad} equipos · {SEMAFORO_LABEL[flota.semaforoGeneral]}
                </p>
              </div>
              <Tooltip short={`Estado ${flota.modelo}: ${flota.semaforoGeneral}`} help={HELP.semaforo}>
                <SemaforoDot estado={flota.semaforoGeneral} size="lg" />
              </Tooltip>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: "Dfm",  v: flota.dfmPromedio,  u: "%",  max: 100, helpKey: "dfm" },
                { k: "TMEF", v: flota.tmefPromedio,  u: "h",  max: 150, helpKey: "tmef" },
                { k: "TMPR", v: flota.tmprPromedio,  u: "h",  max: 30,  helpKey: "tmpr" },
              ].map(({ k, v, u, max, helpKey }) => (
                <div key={k} className="flex flex-col">
                  <Tooltip short={HELP[helpKey].titulo} help={HELP[helpKey]}>
                    <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider cursor-help">{k}</span>
                  </Tooltip>
                  <span className="text-[22px] font-mono font-bold text-[#09090B] leading-none mt-0.5">
                    {v}
                  </span>
                  <span className="text-[10px] text-[#A1A1AA]">{u}</span>
                  <MiniBar valor={k === "TMPR" ? Math.max(max - v, 0) : v} max={max} color={color} />
                </div>
              ))}
            </div>

            {/* Paro badge */}
            {flota.enParo > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA]">
                <AlertTriangle size={12} className="text-[#B91C1C] shrink-0" />
                <span className="text-[12px] font-semibold text-[#991B1B]">
                  {flota.enParo} equipo{flota.enParo > 1 ? "s" : ""} en paro total
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
