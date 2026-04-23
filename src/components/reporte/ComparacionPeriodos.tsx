"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PERIODOS_DISPONIBLES, getPeriodo } from "@/lib/data/periodos";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface KpiRow {
  kpi: string;
  label: string;
  unidad: string;
  mejorEsMayor: boolean; // true → mayor = mejor (dfm, tmef) / false → menor = mejor (tmpr)
}

const KPIS: KpiRow[] = [
  { kpi: "dfm",  label: "Dfm",  unidad: "%", mejorEsMayor: true  },
  { kpi: "tmef", label: "TMEF", unidad: "h", mejorEsMayor: true  },
  { kpi: "tmpr", label: "TMPR", unidad: "h", mejorEsMayor: false },
];

// ─── Helper delta ─────────────────────────────────────────────────────────────
function deltaColor(delta: number, mejorEsMayor: boolean): string {
  if (Math.abs(delta) < 0.5) return "#71717A";
  const mejora = mejorEsMayor ? delta > 0 : delta < 0;
  return mejora ? "#15803D" : "#DC2626";
}

function DeltaIcon({ delta, mejorEsMayor }: { delta: number; mejorEsMayor: boolean }) {
  if (Math.abs(delta) < 0.5) return <Minus size={12} className="text-[#A1A1AA]" />;
  const mejora = mejorEsMayor ? delta > 0 : delta < 0;
  return mejora
    ? <TrendingUp size={12} className="text-[#15803D]" />
    : <TrendingDown size={12} className="text-[#DC2626]" />;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function ComparacionPeriodos() {
  const labels = PERIODOS_DISPONIBLES.map((p) => p.label);
  const [labelA, setLabelA] = useState(labels[1]); // Marzo 2025
  const [labelB, setLabelB] = useState(labels[0]); // Abril 2025

  const periodoA = getPeriodo(labelA);
  const periodoB = getPeriodo(labelB);

  // ─── Tabla resumen por KPI (promedio de flotas) ───────────────────────────
  function promedio(label: string, kpi: "dfm" | "tmef" | "tmpr"): number {
    const p = getPeriodo(label);
    if (!p || p.flotas.length === 0) return 0;
    const vals = p.flotas.map((f) => f[kpi]);
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }

  // ─── Datos para BarChart (por flota) ─────────────────────────────────────
  const chartDataDfm = periodoA?.flotas.map((fA) => {
    const fB = periodoB?.flotas.find((f) => f.tipo === fA.tipo);
    return {
      name:   fA.modelo.replace("Komatsu ", "").replace("CAT ", ""),
      [labelA]: fA.dfm,
      [labelB]: fB?.dfm ?? 0,
    };
  }) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Selectores A / B */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#71717A]">
            Período A (base)
          </label>
          <select
            value={labelA}
            onChange={(e) => setLabelA(e.target.value)}
            className="px-3 py-2 rounded-[8px] bg-white border border-[#E4E4E7] text-[13px] text-[#3F3F46] focus:outline-none focus:border-[#B45309] transition-colors"
          >
            {labels.map((l) => (
              <option key={l} value={l} disabled={l === labelB}>{l}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#71717A]">
            Período B (comparar)
          </label>
          <select
            value={labelB}
            onChange={(e) => setLabelB(e.target.value)}
            className="px-3 py-2 rounded-[8px] bg-white border border-[#E4E4E7] text-[13px] text-[#3F3F46] focus:outline-none focus:border-[#B45309] transition-colors"
          >
            {labels.map((l) => (
              <option key={l} value={l} disabled={l === labelA}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla KPI */}
      <div className="overflow-x-auto rounded-xl border border-[#E4E4E7]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F4F4F5] border-b border-[#E4E4E7]">
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#52525B]">KPI</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#52525B]">{labelA}</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#52525B]">{labelB}</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#52525B]">Δ</th>
            </tr>
          </thead>
          <tbody>
            {KPIS.map(({ kpi, label, unidad, mejorEsMayor }) => {
              const valA  = promedio(labelA, kpi as "dfm" | "tmef" | "tmpr");
              const valB  = promedio(labelB, kpi as "dfm" | "tmef" | "tmpr");
              const delta = Math.round((valB - valA) * 10) / 10;
              const col   = deltaColor(delta, mejorEsMayor);
              return (
                <tr key={kpi} className="border-b border-[#F4F4F5] last:border-0 bg-white hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#09090B]">{label}</td>
                  <td className="px-4 py-3 text-center font-mono text-[#52525B]">{valA}{unidad}</td>
                  <td className="px-4 py-3 text-center font-mono text-[#52525B]">{valB}{unidad}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1" style={{ color: col }}>
                      <DeltaIcon delta={delta} mejorEsMayor={mejorEsMayor} />
                      <span className="font-mono font-semibold text-[12px]">
                        {delta > 0 ? "+" : ""}{delta}{unidad}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* BarChart Dfm por flota */}
      <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
        <p className="text-[12px] font-semibold text-[#52525B] mb-4">Dfm por flota — comparación</p>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataDfm} barCategoryGap="30%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#71717A" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#71717A" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, ""] as [string, string]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E4E4E7" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconType="rect"
                iconSize={8}
              />
              <Bar dataKey={labelA} fill="#B45309" radius={[3, 3, 0, 0]} />
              <Bar dataKey={labelB} fill="#D97706" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detalle por flota */}
      {periodoA && periodoB && (
        <div className="overflow-x-auto rounded-xl border border-[#E4E4E7]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F4F4F5] border-b border-[#E4E4E7]">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#52525B]">Flota</th>
                {["Dfm", "TMEF", "TMPR"].map((k) => (
                  <th key={k} colSpan={2} className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#52525B] border-l border-[#E4E4E7]">
                    {k}
                  </th>
                ))}
              </tr>
              <tr className="bg-white border-b border-[#E4E4E7] text-[9px] text-[#A1A1AA] uppercase tracking-wider">
                <th className="px-4 py-1.5" />
                <th className="px-3 py-1.5 text-center border-l border-[#F4F4F5]">{labelA.split(" ")[0]}</th>
                <th className="px-3 py-1.5 text-center">{labelB.split(" ")[0]}</th>
                <th className="px-3 py-1.5 text-center border-l border-[#F4F4F5]">{labelA.split(" ")[0]}</th>
                <th className="px-3 py-1.5 text-center">{labelB.split(" ")[0]}</th>
                <th className="px-3 py-1.5 text-center border-l border-[#F4F4F5]">{labelA.split(" ")[0]}</th>
                <th className="px-3 py-1.5 text-center">{labelB.split(" ")[0]}</th>
              </tr>
            </thead>
            <tbody>
              {periodoA.flotas.map((fA) => {
                const fB = periodoB.flotas.find((f) => f.tipo === fA.tipo);
                return (
                  <tr key={fA.tipo} className="border-b border-[#F4F4F5] last:border-0 bg-white hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 font-medium text-[#09090B] whitespace-nowrap">
                      {fA.modelo.replace("Komatsu ", "").replace("CAT ", "")}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-[#52525B] border-l border-[#F4F4F5]">{fA.dfm}%</td>
                    <td className="px-3 py-3 text-center font-mono text-[#52525B]">{fB?.dfm ?? "—"}%</td>
                    <td className="px-3 py-3 text-center font-mono text-[#52525B] border-l border-[#F4F4F5]">{fA.tmef}h</td>
                    <td className="px-3 py-3 text-center font-mono text-[#52525B]">{fB?.tmef ?? "—"}h</td>
                    <td className="px-3 py-3 text-center font-mono text-[#52525B] border-l border-[#F4F4F5]">{fA.tmpr}h</td>
                    <td className="px-3 py-3 text-center font-mono text-[#52525B]">{fB?.tmpr ?? "—"}h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
