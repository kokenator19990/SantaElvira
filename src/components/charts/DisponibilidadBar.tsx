"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { Equipo } from "@/lib/domain/tipos";
import { COLORES_SEMAFORO } from "@/lib/constants/umbrales";

const C_GRID = "#F4F4F5";
const C_AXIS = "#A1A1AA";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E4E4E7",
      borderRadius: 8,
      padding: "8px 12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    }}>
      <p style={{ color: "#09090B", fontWeight: 700, fontSize: 11 }}>{d.payload.id}</p>
      <p style={{ color: "#3F3F46", fontFamily: "var(--font-geist-mono)", fontWeight: 700, fontSize: 15 }}>
        {d.value}%
      </p>
    </div>
  );
}

interface DisponibilidadBarProps {
  equipos: Equipo[];
  maxItems?: number;
}

export function DisponibilidadBar({ equipos, maxItems = 12 }: DisponibilidadBarProps) {
  const datos = equipos
    .filter((e) => !e.paroTotal)
    .slice(0, maxItems)
    .map((e) => ({
      id:    e.id,
      dfm:   e.kpis.dfm,
      color: COLORES_SEMAFORO[e.semaforo.dfm],
    }));

  return (
    <div className="h-48" role="img" aria-label="Disponibilidad por equipo">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 8, left: -28, bottom: 0 }} barSize={16}>
          <CartesianGrid strokeDasharray="0" stroke={C_GRID} vertical={false} />
          <XAxis
            dataKey="id"
            tick={{ fill: C_AXIS, fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[50, 100]}
            tick={{ fill: C_AXIS, fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
            axisLine={false}
            tickLine={false}
            unit="%"
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
          <ReferenceLine y={85} stroke="#15803D" strokeDasharray="3 4" strokeWidth={1} />
          <ReferenceLine y={75} stroke="#B45309" strokeDasharray="3 4" strokeWidth={1} />
          <Bar dataKey="dfm" radius={[3, 3, 0, 0]}>
            {datos.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
