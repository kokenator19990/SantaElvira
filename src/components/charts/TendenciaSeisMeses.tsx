"use client";

import { useState } from "react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { SerieTemporal } from "@/lib/domain/tipos";

// ── Colores hex — nunca Tailwind en props Recharts ────────────────────────────
const C_FILL   = "#FFFFFF";
const C_LINE   = "#D97706";
const C_DOT    = "#B45309";
const C_VERDE  = "#15803D";
const C_AMBAR  = "#B45309";
const C_GRID   = "#F4F4F5";
const C_AXIS   = "#A1A1AA";
const C_TOOLTIP_BG = "#FFFFFF";

type KpiKey = "dfm" | "tmef" | "tmpr" | "tiempoOperativo" | "reserva";

const KPI_CFG: Record<KpiKey, { label: string; corto: string; unidad: string; umbralVerde: number; umbralAmbar: number }> = {
  dfm:             { label: "Disponibilidad Física", corto: "Dfm",    unidad: "%", umbralVerde: 85, umbralAmbar: 75  },
  tmef:            { label: "T. Medio Entre Fallas", corto: "TMEF",   unidad: "h", umbralVerde: 80, umbralAmbar: 50  },
  tmpr:            { label: "T. Medio Parada Rep.",  corto: "TMPR",   unidad: "h", umbralVerde: 5,  umbralAmbar: 15  },
  tiempoOperativo: { label: "Tiempo Operativo",      corto: "T.Op.",  unidad: "%", umbralVerde: 80, umbralAmbar: 65  },
  reserva:         { label: "Reserva",               corto: "Res.",   unidad: "%", umbralVerde: 8,  umbralAmbar: 20  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C_TOOLTIP_BG,
      border: "1px solid #E4E4E7",
      borderRadius: 8,
      padding: "8px 12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    }}>
      <p style={{ color: "#09090B", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p: {name: string; value: number; payload: Record<string, number>}, i: number) => {
        const cfg = KPI_CFG[p.name as KpiKey];
        return (
          <p key={i} style={{ color: "#3F3F46", fontSize: 13, fontFamily: "var(--font-geist-mono)", fontWeight: 700 }}>
            {p.value}{cfg?.unidad ?? ""}
          </p>
        );
      })}
    </div>
  );
}

export function TendenciaSeisMeses({ datos, titulo }: { datos: SerieTemporal[]; titulo?: string }) {
  const [kpiActivo, setKpiActivo] = useState<KpiKey>("dfm");
  const cfg = KPI_CFG[kpiActivo];

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-[10px] bg-white border border-[#E4E4E7]"
      role="img"
      aria-label={`Gráfico de tendencia ${cfg.label} — últimos 6 meses`}
    >
      {titulo && <p className="text-[11px] text-[#71717A] font-medium">{titulo}</p>}

      {/* Selector de KPI */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(KPI_CFG) as KpiKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setKpiActivo(k)}
            className={`px-2.5 py-1 rounded-[5px] text-[11px] font-semibold transition-all duration-150 min-h-[32px] ${
              kpiActivo === k
                ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]"
                : "text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] border border-[#E4E4E7]"
            }`}
          >
            {KPI_CFG[k].corto}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={datos} margin={{ top: 10, right: 10, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C_LINE} stopOpacity={0.12} />
                <stop offset="95%" stopColor={C_LINE} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke={C_GRID} vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fill: C_AXIS, fontSize: 10, fontFamily: "var(--font-geist-sans)" }}
              axisLine={{ stroke: C_GRID }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: C_AXIS, fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              axisLine={false}
              tickLine={false}
              unit={cfg.unidad}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E4E4E7", strokeWidth: 1 }} />
            <ReferenceLine
              y={cfg.umbralVerde}
              stroke={C_VERDE}
              strokeDasharray="3 4"
              strokeWidth={1}
              label={{ value: `${cfg.umbralVerde}`, fill: C_VERDE, fontSize: 9, position: "insideTopRight", dy: -4 }}
            />
            <ReferenceLine
              y={cfg.umbralAmbar}
              stroke={C_AMBAR}
              strokeDasharray="3 4"
              strokeWidth={1}
              label={{ value: `${cfg.umbralAmbar}`, fill: C_AMBAR, fontSize: 9, position: "insideTopRight", dy: -4 }}
            />
            <Area
              type="monotone"
              dataKey={kpiActivo}
              fill="url(#areaGrad)"
              stroke={C_LINE}
              strokeWidth={2}
              dot={{ r: 3.5, fill: C_DOT, stroke: C_FILL, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: C_DOT, stroke: C_FILL, strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[9px] text-[#A1A1AA] text-right font-mono">Nov 2024 — Abr 2025</p>
    </div>
  );
}
