"use client";

import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import type { Alerta, EstadoSemaforo } from "@/lib/domain/tipos";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const KPI_LABEL: Record<string, string> = {
  dfm:             "Dfm",
  tmef:            "TMEF",
  tmpr:            "TMPR",
  tiempoOperativo: "T.Op.",
  reserva:         "Reserva",
};

const FONDO: Record<EstadoSemaforo, string> = {
  paro:  "bg-[#FEF2F2] border border-[#FECACA]",
  rojo:  "bg-[#FEF2F2]/60 border border-[#FECACA]/60",
  ambar: "bg-[#FFFBEB]/60 border border-[#FDE68A]/60",
  verde: "bg-transparent",
};

interface AlertasRecientesProps {
  alertas: Alerta[];
  max?: number;
}

export function AlertasRecientes({ alertas, max = 5 }: AlertasRecientesProps) {
  const top = alertas.slice(0, max);

  return (
    <div className="flex flex-col gap-2 p-4 rounded-[10px] bg-white border border-[#E4E4E7] h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="text-[#71717A]" />
          <Tooltip short="Equipos con KPIs fuera de umbral, ordenados por criticidad" help={HELP.alertasPrioritarias}>
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">
              Alertas Activas
            </span>
          </Tooltip>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#FFFBEB] text-[#92400E]">
            {alertas.length}
          </span>
        </div>
        <Link
          href="/alertas"
          className="flex items-center gap-0.5 text-[11px] text-[#B45309] hover:text-[#92400E] transition-colors"
        >
          Ver todas <ChevronRight size={11} />
        </Link>
      </div>

      {top.length === 0 && (
        <div className="flex items-center justify-center h-24 text-[12px] text-[#A1A1AA]">
          Sin alertas activas
        </div>
      )}

      <div className="flex flex-col gap-1">
        {top.map((alerta) => (
          <Link
            key={alerta.id}
            href={`/flota/${alerta.equipoId}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[7px] hover:bg-[#F4F4F5] transition-colors duration-150 min-h-[44px] ${FONDO[alerta.estado]}`}
          >
            <SemaforoDot estado={alerta.estado} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-mono font-bold text-[#09090B]">{alerta.equipoId}</span>
                <span className="text-[10px] text-[#71717A] hidden sm:block">{alerta.modelo}</span>
              </div>
              <p className="text-[11px] text-[#71717A] truncate mt-0.5">{alerta.mensaje}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] text-[#A1A1AA] uppercase">{KPI_LABEL[alerta.kpi]}</p>
              <p className="text-[15px] font-mono font-bold text-[#3F3F46] leading-tight">
                {alerta.valorActual === 0 ? "—" : alerta.valorActual}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
