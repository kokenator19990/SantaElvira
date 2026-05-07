"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { AsarcoFlota } from "@/lib/domain/tipos";
import { COLORES_ASARCO, LABELS_ASARCO } from "@/lib/constants/umbrales";

const C_GRID   = "#F4F4F5";
const C_AXIS   = "#A1A1AA";
const TOOLTIP_BG = "#FFFFFF";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: TOOLTIP_BG,
      border: "1px solid #E4E4E7",
      borderRadius: 8,
      padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      minWidth: 180,
    }}>
      <p style={{ color: "#09090B", fontWeight: 700, fontSize: 11, marginBottom: 6 }}>{label}</p>
      {[...payload].reverse().map((p: { name: string; value: number; fill: string }, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.fill, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: "#71717A", fontSize: 11 }}>
            {LABELS_ASARCO[p.name as keyof typeof LABELS_ASARCO] ?? p.name}:
          </span>
          <span style={{ color: "#09090B", fontWeight: 700, fontFamily: "var(--font-geist-mono)", fontSize: 12, marginLeft: "auto" }}>
            {p.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

interface AsarcoTimeChartProps {
  datos: AsarcoFlota[];
}

export function AsarcoTimeChart({ datos }: AsarcoTimeChartProps) {
  const chartData = datos.map((d) => ({
    name:                  d.modelo,
    operativo:             d.distribucion.operativo,
    reserva:               d.distribucion.reserva,
    detencionProgramada:   d.distribucion.detencionProgramada,
    detencionNoProgramada: d.distribucion.detencionNoProgramada,
    perdidaOperacional:    d.distribucion.perdidaOperacional,
  }));

  const segmentos = [
    "operativo",
    "reserva",
    "detencionProgramada",
    "detencionNoProgramada",
    "perdidaOperacional",
  ] as const;

  return (
    <div
      className="h-64"
      role="img"
      aria-label="Distribución de tiempo ASARCO por tipo de flota"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }} barSize={32}>
          <CartesianGrid strokeDasharray="0" stroke={C_GRID} horizontal={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: C_AXIS, fontSize: 10, fontFamily: "var(--font-geist-sans)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            unit="%"
            domain={[0, 100]}
            tick={{ fill: C_AXIS, fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />

          {segmentos.map((seg, i) => (
            <Bar
              key={seg}
              dataKey={seg}
              stackId="asarco"
              fill={COLORES_ASARCO[seg]}
              radius={i === segmentos.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
          <ReferenceLine
            y={80}
            stroke="#15803D"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: "Meta Operativo: 80%",
              position: "right",
              fill: "#15803D",
              fontSize: 10,
              fontWeight: 600,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
