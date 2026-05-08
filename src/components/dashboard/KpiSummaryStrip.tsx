"use client";

import { clsx } from "clsx";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { EstadoSemaforo } from "@/lib/domain/tipos";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const KPI_HELP_KEY: Record<string, string> = {
  "Dfm Flota":   "dfm",
  "TMEF Prom.":  "tmef",
  "TMPR Prom.":  "tmpr",
  "Tiempo Op.":  "tiempoOperativo",
  "Reserva":     "reserva",
};

const KPI_SHORT: Record<string, string> = {
  "Dfm Flota":   "Disponibilidad Física Mecánica — % del turno que el equipo está listo para operar",
  "TMEF Prom.":  "Tiempo Medio Entre Fallas — promedio de horas que opera sin averías",
  "TMPR Prom.":  "Tiempo Medio de Parada por Reparación — promedio de horas que dura cada reparación",
  "Tiempo Op.":  "% del turno en que el equipo estuvo efectivamente trabajando",
  "Reserva":     "% del turno en que el equipo estaba disponible pero sin tarea asignada",
};

function interpretarKpi(label: string, valor: number, estado: EstadoSemaforo, objetivo: number, delta: number | null): string | null {
  if (label === "Dfm Flota") {
    if (estado === "rojo") return `Indisponibilidad alta: ~${((100 - valor) / 4).toFixed(0)}h/turno fuera de servicio`;
    if (estado === "ambar") return `Cerca del límite — ${(objetivo - valor).toFixed(1)} pts bajo la meta`;
    if (delta !== null && delta < -2) return `Deterioro acelerado: cae ${Math.abs(delta).toFixed(1)}% vs mes anterior`;
    return null;
  }
  if (label === "TMEF Prom.") {
    if (estado === "rojo") return `Fallas frecuentes: un equipo falla cada ${valor.toFixed(0)}h promedio`;
    if (estado === "ambar") return `Confiabilidad moderada — evaluar equipos con TMEF < ${objetivo}h`;
    return null;
  }
  if (label === "TMPR Prom.") {
    if (estado === "rojo") return `Reparaciones lentas: cada falla tarda ${valor.toFixed(1)}h en resolverse`;
    if (estado === "ambar") return `Revisar disponibilidad de repuestos — reparaciones por encima de ${objetivo}h`;
    return null;
  }
  if (label === "Tiempo Op." && estado !== "verde") {
    return `${(100 - valor).toFixed(0)}% del turno no se produce — evaluar causas`;
  }
  if (delta !== null && delta < -3) {
    return `Caída significativa: ${Math.abs(delta).toFixed(1)} pts vs período anterior`;
  }
  return null;
}

const ESTADO_COLOR: Record<EstadoSemaforo, string> = {
  verde: "#15803D",
  ambar: "#B45309",
  rojo:  "#B91C1C",
  paro:  "#B91C1C",
};

const ESTADO_BG: Record<EstadoSemaforo, string> = {
  verde: "rgba(240,253,244,0.8)",
  ambar: "rgba(255,251,235,0.8)",
  rojo:  "rgba(254,242,242,0.8)",
  paro:  "rgba(254,242,242,0.8)",
};

// Variantes para entrada escalonada — Emil Kowalski: 240ms, ease sharp
const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      delay: i * 0.04,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

interface KpiItem {
  label: string;
  labelGerente?: string;
  valor: number;
  unidad: string;
  objetivo: number;
  delta: number | null;
  estado: EstadoSemaforo;
  invertido?: boolean;
}

interface KpiSummaryStripProps {
  items: KpiItem[];
}

export function KpiSummaryStrip({ items }: KpiSummaryStripProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item, i) => {
        const color  = ESTADO_COLOR[item.estado];
        const bg     = ESTADO_BG[item.estado];
        const up     = item.delta !== null && item.delta > 0;
        const down   = item.delta !== null && item.delta < 0;
        const pctObj = item.invertido
          ? Math.min((item.objetivo / Math.max(item.valor, 0.01)) * 100, 100)
          : Math.min((item.valor / item.objetivo) * 100, 100);

        return (
          <motion.div
            key={item.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3 p-4 rounded-[10px] bg-white border border-[#E4E4E7] relative overflow-hidden"
          >
            {/* Tinte de fondo según semáforo */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: bg, opacity: 0.5 }}
            />

            <div className="relative flex flex-col gap-2">
              <Tooltip
                short={KPI_SHORT[item.label] ?? item.label}
                help={HELP[KPI_HELP_KEY[item.label] ?? "dfm"]}
                className="cursor-help"
              >
                <span className="text-[12px] font-bold text-[#52525B] leading-tight block">
                  {item.labelGerente ?? item.label}
                </span>
                {item.labelGerente && (
                  <span className="text-[10px] text-[#A1A1AA] uppercase tracking-[0.05em] block">
                    {item.label}
                  </span>
                )}
              </Tooltip>

              {/* Valor */}
              <div className="flex items-end gap-1.5">
                <span
                  className="text-[36px] font-mono font-bold leading-none tabular-nums"
                  style={{ color }}
                >
                  {item.valor}
                </span>
                <span className="text-[15px] text-[#71717A] mb-0.5 font-medium">{item.unidad}</span>
              </div>

              {/* Barra de progreso con spring */}
              <div className="h-[3px] rounded-full bg-black/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color, opacity: 0.7 }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${pctObj}%` }}
                  transition={{ duration: 0.7, delay: i * 0.04 + 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                />
              </div>

              {/* Meta + delta */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#A1A1AA]">
                  Meta <span className="text-[#52525B] font-mono">{item.objetivo}{item.unidad}</span>
                </span>
                {item.delta === null ? (
                  <span className="text-[11px] text-[#A1A1AA]">Sin comparativa</span>
                ) : (
                  <span className={clsx(
                    "flex items-center gap-0.5 text-[12px] font-semibold",
                    up   ? (item.invertido ? "text-red-700"   : "text-green-700") :
                    down ? (item.invertido ? "text-green-700" : "text-red-700")   : "text-[#71717A]"
                  )}>
                    {up   && <TrendingUp  size={11} />}
                    {down && <TrendingDown size={11} />}
                    {Math.abs(item.delta).toFixed(1)}{item.unidad}
                  </span>
                )}
              </div>

              {(() => {
                const insight = interpretarKpi(item.label, item.valor, item.estado, item.objetivo, item.delta);
                return insight ? (
                  <p className="text-[10px] leading-tight mt-0.5 line-clamp-2" style={{ color }}>
                    {insight}
                  </p>
                ) : null;
              })()}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
