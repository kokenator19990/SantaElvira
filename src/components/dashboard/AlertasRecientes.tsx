"use client";

import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import type { Alerta, EstadoSemaforo } from "@/lib/domain/tipos";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const KPI_LABEL: Record<string, string> = {
  dfm:             "Disponibilidad",
  tmef:            "Entre Fallas",
  tmpr:            "Reparación",
  tiempoOperativo: "Productivo",
  reserva:         "Reserva",
  apd:             "Aceites",
};

const KPI_UNIDAD: Record<string, string> = {
  dfm: "%", tmef: "h", tmpr: "h", tiempoOperativo: "%", reserva: "%", apd: "",
};

const FONDO: Record<EstadoSemaforo, string> = {
  paro:  "bg-[#FEF2F2] border border-[#FECACA]",
  rojo:  "bg-[#FEF2F2]/60 border border-[#FECACA]/60",
  ambar: "bg-[#FFFBEB]/60 border border-[#FDE68A]/60",
  verde: "bg-transparent",
};

const itemVariants = {
  hidden:  { opacity: 0, x: -6 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] as const },
  }),
  exit: { opacity: 0, transition: { duration: 0.12 } },
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
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-[0.1em]">
              Alertas Activas
            </span>
          </Tooltip>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#FFFBEB] text-[#92400E]">
            {alertas.length}
          </span>
        </div>
        <Link
          href="/alertas"
          className="flex items-center gap-0.5 text-[12px] text-[#B45309] hover:text-[#92400E] transition-colors"
        >
          Ver todas <ChevronRight size={11} />
        </Link>
      </div>

      {top.length === 0 && (
        <div className="flex items-center justify-center h-24 text-[13px] text-[#A1A1AA]">
          Sin alertas activas
        </div>
      )}

      <div className="flex flex-col gap-1">
        <AnimatePresence initial={true} mode="popLayout">
          {top.map((alerta, i) => (
            <motion.div
              key={alerta.id}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Link
                href={alerta.kpi === "apd" ? "/apd" : `/flota/${alerta.equipoId}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[7px] hover:bg-[#F4F4F5] transition-colors duration-150 min-h-[44px] ${FONDO[alerta.estado]}`}
              >
                <SemaforoDot estado={alerta.estado} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-mono font-bold text-[#09090B]">{alerta.equipoId}</span>
                    <span className="text-[11px] text-[#71717A] hidden sm:block">{alerta.modelo}</span>
                  </div>
                  <p className="text-[12px] text-[#71717A] truncate mt-0.5">{alerta.mensaje}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-[#A1A1AA] uppercase">{KPI_LABEL[alerta.kpi]}</p>
                  <p className="text-[17px] font-mono font-bold text-[#3F3F46] leading-tight">
                    {alerta.valorActual === 0 ? "—" : `${alerta.valorActual}${KPI_UNIDAD[alerta.kpi] ?? ""}`}
                  </p>
                </div>
                {(alerta.estado === "rojo" || alerta.estado === "paro") && (
                  <p className="sr-only sm:not-sr-only text-[10px] text-[#B45309] truncate max-w-[120px]">
                    Requiere atención
                  </p>
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
