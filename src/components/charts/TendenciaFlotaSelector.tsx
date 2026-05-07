"use client";

import { useState } from "react";
import { TendenciaSeisMeses } from "./TendenciaSeisMeses";
import type { SerieTemporalFlota, TipoFlota } from "@/lib/domain/tipos";

const FLOTAS_CFG: { tipo: TipoFlota; label: string; corto: string }[] = [
  { tipo: "785D",   label: "CAT 785D",        corto: "785D" },
  { tipo: "777F",   label: "CAT 777F",        corto: "777F" },
  { tipo: "992",    label: "CAT 992",         corto: "992" },
  { tipo: "PC2000", label: "Komatsu PC-2000", corto: "PC-2000" },
];

interface Props {
  tendencias: SerieTemporalFlota[];
  flotaInicial?: TipoFlota;
}

export function TendenciaFlotaSelector({ tendencias, flotaInicial = "777F" }: Props) {
  const [flotaActiva, setFlotaActiva] = useState<TipoFlota>(flotaInicial);
  const tendenciaActiva = tendencias.find((t) => t.tipoFlota === flotaActiva);

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs de flota */}
      <div className="flex flex-wrap gap-1.5">
        {FLOTAS_CFG.map(({ tipo, corto }) => (
          <button
            key={tipo}
            onClick={() => setFlotaActiva(tipo)}
            className={`px-2.5 py-1 rounded-[5px] text-[12px] font-semibold transition-all duration-150 min-h-[32px] border ${
              flotaActiva === tipo
                ? "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
                : "text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] border-[#E4E4E7]"
            }`}
          >
            {corto}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      {tendenciaActiva && tendenciaActiva.datos.length > 0 ? (
        <TendenciaSeisMeses datos={tendenciaActiva.datos} titulo={tendenciaActiva.modelo} />
      ) : (
        <div className="flex items-center justify-center h-[200px] rounded-[10px] bg-white border border-[#E4E4E7]">
          <p className="text-[13px] text-[#A1A1AA]">Sin datos de tendencia para esta flota</p>
        </div>
      )}
    </div>
  );
}
