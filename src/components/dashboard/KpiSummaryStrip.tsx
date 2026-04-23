"use client";

import { clsx } from "clsx";
import { TrendingDown, TrendingUp } from "lucide-react";
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

// Descripción breve para el tooltip básico (sin modo ayuda)
const KPI_SHORT: Record<string, string> = {
  "Dfm Flota":   "Disponibilidad Física Mecánica — % del turno que el equipo está listo para operar",
  "TMEF Prom.":  "Tiempo Medio Entre Fallas — promedio de horas que opera sin averías",
  "TMPR Prom.":  "Tiempo Medio de Parada por Reparación — promedio de horas que dura cada reparación",
  "Tiempo Op.":  "% del turno en que el equipo estuvo efectivamente trabajando",
  "Reserva":     "% del turno en que el equipo estaba disponible pero sin tarea asignada",
};

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

interface KpiItem {
  label: string;
  valor: number;
  unidad: string;
  objetivo: number;
  delta: number;
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
        const color = ESTADO_COLOR[item.estado];
        const bg    = ESTADO_BG[item.estado];
        const up    = item.delta > 0;
        const down  = item.delta < 0;
        const pctObj = item.invertido
          ? Math.min((item.objetivo / Math.max(item.valor, 0.01)) * 100, 100)
          : Math.min((item.valor / item.objetivo) * 100, 100);

        return (
          <div
            key={item.label}
            className="animate-fade-in-up flex flex-col gap-3 p-4 rounded-[10px] bg-white border border-[#E4E4E7] relative overflow-hidden"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Subtle tinted bg from semaphore */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: bg, opacity: 0.5 }}
            />

            <div className="relative flex flex-col gap-2">
              {/* Label */}
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">
                <Tooltip
                  short={KPI_SHORT[item.label] ?? item.label}
                  help={HELP[KPI_HELP_KEY[item.label] ?? "dfm"]}
                  className="cursor-help"
                >
                  {item.label}
                </Tooltip>
              </span>

              {/* Value */}
              <div className="flex items-end gap-1.5">
                <span
                  className="text-[32px] font-mono font-bold leading-none tabular-nums"
                  style={{ color }}
                >
                  {item.valor}
                </span>
                <span className="text-[13px] text-[#71717A] mb-0.5 font-medium">{item.unidad}</span>
              </div>

              {/* Progress bar toward objective */}
              <div className="h-[3px] rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: `${pctObj}%`, backgroundColor: color, opacity: 0.7 }}
                />
              </div>

              {/* Objective + delta */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#A1A1AA]">
                  Meta <span className="text-[#52525B] font-mono">{item.objetivo}{item.unidad}</span>
                </span>
                <span className={clsx(
                  "flex items-center gap-0.5 text-[11px] font-semibold",
                  up   ? "text-green-700" :
                  down ? "text-red-700"   : "text-[#71717A]"
                )}>
                  {up   && <TrendingUp  size={11} />}
                  {down && <TrendingDown size={11} />}
                  {Math.abs(item.delta).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
