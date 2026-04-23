"use client";

import { useState } from "react";
import { COLORES_ASARCO, LABELS_ASARCO } from "@/lib/constants/umbrales";
import type { DistribucionAsarco } from "@/lib/domain/tipos";

interface Segmento {
  key: string;
  valor: number;
  color: string;
  label: string;
}

interface EquipoAsarcoBarProps {
  asarco: DistribucionAsarco;
}

export function EquipoAsarcoBar({ asarco }: EquipoAsarcoBarProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const segmentos: Segmento[] = [
    { key: "operativo",             valor: asarco.operativo,             color: COLORES_ASARCO.operativo,             label: LABELS_ASARCO.operativo },
    { key: "reserva",               valor: asarco.reserva,               color: COLORES_ASARCO.reserva,               label: LABELS_ASARCO.reserva },
    { key: "detencionProgramada",   valor: asarco.detencionProgramada,   color: COLORES_ASARCO.detencionProgramada,   label: LABELS_ASARCO.detencionProgramada },
    { key: "detencionNoProgramada", valor: asarco.detencionNoProgramada, color: COLORES_ASARCO.detencionNoProgramada, label: LABELS_ASARCO.detencionNoProgramada },
    { key: "perdidaOperacional",    valor: asarco.perdidaOperacional,    color: COLORES_ASARCO.perdidaOperacional,    label: LABELS_ASARCO.perdidaOperacional },
  ].filter((s) => s.valor > 0);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs text-[#71717A] font-semibold uppercase tracking-wider">Distribución ASARCO</span>

      {/* Barra 100% */}
      <div className="flex h-8 rounded-lg overflow-hidden w-full">
        {segmentos.map((seg) => (
          <div
            key={seg.key}
            style={{ width: `${seg.valor}%`, backgroundColor: seg.color }}
            className="relative transition-opacity duration-150"
            onMouseEnter={() => setHoveredKey(seg.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            {seg.valor >= 8 && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/90">
                {seg.valor}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Tooltip hover */}
      {hoveredKey && (
        <div className="px-3 py-2 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-xs">
          <span className="text-[#52525B] font-medium">
            {LABELS_ASARCO[hoveredKey as keyof typeof LABELS_ASARCO]}:{" "}
            <span className="font-mono font-bold text-[#09090B]">
              {asarco[hoveredKey as keyof DistribucionAsarco]}%
            </span>
          </span>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segmentos.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-xs text-[#71717A]">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
            {seg.label}: <span className="font-mono text-[#09090B]">{seg.valor}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
