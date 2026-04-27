"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LabelList,
  PieChart, Pie, Legend,
} from "recharts";
import type { FlotaResumen, EstadoSemaforo, DistribucionAsarco } from "@/lib/domain/tipos";
import { ASARCO_FLOTA } from "@/lib/data/asarco";

// ─── Paleta ───────────────────────────────────────────────────────────────────
const SEM: Record<EstadoSemaforo, string> = {
  verde: "#16A34A",
  ambar: "#D97706",
  rojo:  "#DC2626",
  paro:  "#DC2626",
};

const ASARCO_C = {
  operativo:             "#16A34A",
  reserva:               "#3A6AB0",
  detencionProgramada:   "#D97706",
  detencionNoProgramada: "#DC2626",
  perdidaOperacional:    "#7C2D12",
} as const;

const ASARCO_L = {
  operativo:             "Operativo",
  reserva:               "Reserva",
  detencionProgramada:   "Det. Programada",
  detencionNoProgramada: "Det. No Prog.",
  perdidaOperacional:    "Pérdida Op.",
} as const;

type AsarcoKey = keyof typeof ASARCO_C;

// ─── KPI Gauge (semicírculo SVG) ──────────────────────────────────────────────
interface GaugeProps {
  valor: number;
  meta: number;
  maxDisplay: number;
  unidad: string;
  label: string;
  color: string;
  invertido?: boolean;
}

function KpiGauge({ valor, meta, maxDisplay, unidad, label, color, invertido }: GaugeProps) {
  const cx = 100, cy = 86, r = 66, sw = 13;

  // Normalize: for invertido KPIs (lower = better), invert the arc so more arc = closer to ideal
  const rawPct    = Math.min(Math.max(valor / maxDisplay, 0.005), 0.995);
  const rawTgtPct = Math.min(Math.max(meta  / maxDisplay, 0.005), 0.995);
  const pct    = invertido ? 1 - rawPct    : rawPct;
  const tgtPct = invertido ? 1 - rawTgtPct : rawTgtPct;

  // Arc geometry: starts at (cx-r, cy) goes UP and right to endpoint
  const vAngle = Math.PI * (1 - pct);
  const vx = +(cx + r * Math.cos(vAngle)).toFixed(2);
  const vy = +(cy - r * Math.sin(vAngle)).toFixed(2);
  // largeArc siempre 0: el arco correcto (por el TOP) es siempre el arco corto (≤180°)
  const largeArc = 0;

  // Target tick geometry
  const tA  = Math.PI * (1 - tgtPct);
  const cos_t = Math.cos(tA), sin_t = Math.sin(tA);
  const ti_x = +(cx + (r - sw * 0.6) * cos_t).toFixed(2);
  const ti_y = +(cy - (r - sw * 0.6) * sin_t).toFixed(2);
  const to_x = +(cx + (r + sw * 0.6) * cos_t).toFixed(2);
  const to_y = +(cy - (r + sw * 0.6) * sin_t).toFixed(2);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 98" className="w-full max-w-[210px]" aria-hidden>
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke="#E4E4E7" strokeWidth={sw} fill="none" strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${vx} ${vy}`}
          stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" opacity={0.9}
        />
        {/* Target tick (amber) */}
        <line x1={ti_x} y1={ti_y} x2={to_x} y2={to_y}
          stroke="#B45309" strokeWidth={2.5} strokeLinecap="round" />
        {/* Value text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="28" fontWeight="700"
          fontFamily="ui-monospace, monospace" fill={color}>
          {valor}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="11" fill="#71717A">
          {unidad}
        </text>
      </svg>
      <div className="text-center mt-0.5 pb-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#3F3F46]">{label}</p>
        <p className="text-[9px] text-[#A1A1AA] mt-0.5">
          Meta {invertido ? "≤" : "≥"} {meta}{unidad}
          <span className="ml-1.5 inline-block w-4 align-middle border-t-2 border-dashed border-[#B45309]" />
        </p>
      </div>
    </div>
  );
}

// ─── Tooltip custom ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, suffix = "" }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-[8px] px-3 py-2.5 shadow-md">
      <p className="text-[12px] font-semibold text-[#09090B] mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-[#71717A]">{p.name}:</span>
          <span className="font-mono font-semibold text-[#09090B]">{p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut por flota ──────────────────────────────────────────────────────────
function DonutFlota({ modelo, distribucion }: {
  modelo: string;
  distribucion: DistribucionAsarco;
}) {
  const data = (Object.keys(ASARCO_C) as AsarcoKey[]).map((k) => ({
    name:  ASARCO_L[k],
    value: distribucion[k] ?? 0,
    fill:  ASARCO_C[k],
  }));
  const op  = distribucion.operativo ?? 0;
  const col = op >= 80 ? "#16A34A" : op >= 65 ? "#D97706" : "#DC2626";
  const shortName = modelo.replace("Komatsu ", "").replace("CAT ", "");

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-[11px] font-semibold text-[#3F3F46] text-center">{shortName}</p>
      <div className="relative w-full" style={{ paddingBottom: "85%", maxWidth: 160 }}>
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="42%"
                outerRadius="72%"
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.fill} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v}%`, ""] as [string, string]}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E4E4E7", padding: "6px 10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[17px] font-bold font-mono leading-none" style={{ color: col }}>{op}%</p>
              <p className="text-[8px] text-[#A1A1AA] leading-tight mt-0.5">Op.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sección header ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-[#F4F4F5]" />
      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A1A1AA] whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-[#F4F4F5]" />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface GraficosReporteProps {
  flotas: FlotaResumen[];
}

export function GraficosReporte({ flotas }: GraficosReporteProps) {
  // ── KPI promedios ──────────────────────────────────────────────────────────
  const avgDfm  = flotas.length ? +(flotas.reduce((a, f) => a + f.dfmPromedio,  0) / flotas.length).toFixed(1) : 0;
  const avgTmef = flotas.length ? +(flotas.reduce((a, f) => a + f.tmefPromedio, 0) / flotas.length).toFixed(1) : 0;
  const avgTmpr = flotas.length ? +(flotas.reduce((a, f) => a + f.tmprPromedio, 0) / flotas.length).toFixed(1) : 0;

  const estDfm  = (avgDfm  >= 85 ? "verde" : avgDfm  >= 75 ? "ambar" : "rojo") as EstadoSemaforo;
  const estTmef = (avgTmef >= 80 ? "verde" : avgTmef >= 50 ? "ambar" : "rojo") as EstadoSemaforo;
  const estTmpr = (avgTmpr <= 5  ? "verde" : avgTmpr <= 15 ? "ambar" : "rojo") as EstadoSemaforo;

  // ── Datos bar charts ───────────────────────────────────────────────────────
  const shortName = (tipo: string) => ({ "785D": "785D", "777F": "777F", "992": "992", "PC2000": "PC-2000" }[tipo] ?? tipo);

  const dfmData = flotas.map((f) => ({
    name: shortName(f.tipo),
    DFM:  f.dfmPromedio,
    fill: SEM[f.semaforoGeneral],
  }));

  const tmefData = flotas.map((f) => ({
    name: shortName(f.tipo),
    TMEF: f.tmefPromedio,
    fill: f.tmefPromedio >= 80 ? "#16A34A" : f.tmefPromedio >= 50 ? "#D97706" : "#DC2626",
  }));

  const tmprData = flotas.map((f) => ({
    name: shortName(f.tipo),
    TMPR: f.tmprPromedio,
    fill: f.tmprPromedio <= 5 ? "#16A34A" : f.tmprPromedio <= 15 ? "#D97706" : "#DC2626",
  }));

  // ── Datos ASARCO stacked ───────────────────────────────────────────────────
  const asarcoData = ASARCO_FLOTA.map((a) => ({
    name: shortName(a.tipoFlota),
    [ASARCO_L.operativo]:             a.distribucion.operativo,
    [ASARCO_L.reserva]:               a.distribucion.reserva,
    [ASARCO_L.detencionProgramada]:   a.distribucion.detencionProgramada,
    [ASARCO_L.detencionNoProgramada]: a.distribucion.detencionNoProgramada,
    [ASARCO_L.perdidaOperacional]:    a.distribucion.perdidaOperacional,
  }));

  // ── Shared axis styles ─────────────────────────────────────────────────────
  const axisStyle = { fontSize: 11, fill: "#71717A" };
  const catStyle  = { fontSize: 11, fill: "#3F3F46", fontWeight: 600 };

  return (
    <div className="space-y-5">

      {/* ── Separador ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-[#E4E4E7]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A1A1AA]">Análisis Visual</span>
        <div className="h-px flex-1 bg-[#E4E4E7]" />
      </div>

      {/* ── 1. KPI Gauges ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { valor: +avgDfm,  meta: 85, maxDisplay: 100, unidad: "%", label: "Dfm Flota",  color: SEM[estDfm],  invertido: false },
          { valor: +avgTmef, meta: 80, maxDisplay: 120, unidad: "h", label: "TMEF Prom.", color: SEM[estTmef], invertido: false },
          { valor: +avgTmpr, meta: 5,  maxDisplay: 20,  unidad: "h", label: "TMPR Prom.", color: SEM[estTmpr], invertido: true  },
        ].map((g) => (
          <div key={g.label} className="rounded-xl border border-[#E4E4E7] bg-white p-3 flex items-center justify-center">
            <KpiGauge {...g} />
          </div>
        ))}
      </div>

      {/* ── 2. Barras horizontales DFM + TMEF ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* DFM */}
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
          <SectionLabel>Disponibilidad (Dfm)</SectionLabel>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dfmData} layout="vertical" margin={{ left: 0, right: 36, top: 2, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F4F4F5" />
                <XAxis type="number" domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`} tick={axisStyle}
                  axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={catStyle}
                  axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<ChartTooltip suffix="%" />} />
                <ReferenceLine x={85} stroke="#B45309" strokeDasharray="5 3" strokeWidth={1.5} />
                <Bar dataKey="DFM" radius={[0, 5, 5, 0]} barSize={22} maxBarSize={28}>
                  {dfmData.map((d, i) => <Cell key={i} fill={d.fill} opacity={0.85} />)}
                  <LabelList
                    dataKey="DFM"
                    position="right"
                    style={{ fontSize: 11, fill: "#3F3F46", fontWeight: 600 }}
                    formatter={(v) => `${v}%`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-[#A1A1AA] mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-5 border-t border-dashed border-[#B45309]" />
            Meta ≥ 85%
          </p>
        </div>

        {/* TMEF */}
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
          <SectionLabel>Confiabilidad (TMEF)</SectionLabel>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tmefData} layout="vertical" margin={{ left: 0, right: 36, top: 2, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F4F4F5" />
                <XAxis type="number" domain={[0, 120]}
                  tickFormatter={(v) => `${v}h`} tick={axisStyle}
                  axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={catStyle}
                  axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<ChartTooltip suffix="h" />} />
                <ReferenceLine x={80} stroke="#B45309" strokeDasharray="5 3" strokeWidth={1.5} />
                <Bar dataKey="TMEF" radius={[0, 5, 5, 0]} barSize={22} maxBarSize={28}>
                  {tmefData.map((d, i) => <Cell key={i} fill={d.fill} opacity={0.85} />)}
                  <LabelList
                    dataKey="TMEF"
                    position="right"
                    style={{ fontSize: 11, fill: "#3F3F46", fontWeight: 600 }}
                    formatter={(v) => `${v}h`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-[#A1A1AA] mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-5 border-t border-dashed border-[#B45309]" />
            Meta ≥ 80h
          </p>
        </div>
      </div>

      {/* ── 3. TMPR horizontal ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
        <SectionLabel>Tiempo de Reparación (TMPR) — menor es mejor</SectionLabel>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tmprData} layout="vertical" margin={{ left: 0, right: 40, top: 2, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F4F4F5" />
              <XAxis type="number" domain={[0, 25]}
                tickFormatter={(v) => `${v}h`} tick={axisStyle}
                axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={catStyle}
                axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<ChartTooltip suffix="h" />} />
              <ReferenceLine x={5} stroke="#15803D" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "Meta", position: "insideTopRight", fontSize: 9, fill: "#15803D" }} />
              <ReferenceLine x={15} stroke="#DC2626" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "Límite", position: "insideTopRight", fontSize: 9, fill: "#DC2626" }} />
              <Bar dataKey="TMPR" radius={[0, 5, 5, 0]} barSize={22} maxBarSize={28}>
                {tmprData.map((d, i) => <Cell key={i} fill={d.fill} opacity={0.85} />)}
                <LabelList
                  dataKey="TMPR"
                  position="right"
                  style={{ fontSize: 11, fill: "#3F3F46", fontWeight: 600 }}
                  formatter={(v) => `${v}h`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-1.5">
          <p className="text-[9px] text-[#A1A1AA] flex items-center gap-1.5">
            <span className="inline-block w-5 border-t border-dashed border-[#15803D]" />
            Meta ≤ 5h
          </p>
          <p className="text-[9px] text-[#A1A1AA] flex items-center gap-1.5">
            <span className="inline-block w-5 border-t border-dashed border-[#DC2626]" />
            Crítico &gt; 15h
          </p>
        </div>
      </div>

      {/* ── 4. ASARCO Stacked Bar ────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
        <SectionLabel>Distribución ASARCO por Flota</SectionLabel>
        <div className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={asarcoData} margin={{ top: 4, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
              <XAxis dataKey="name" tick={catStyle} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, ""] as [string, string]}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E4E4E7", padding: "6px 12px" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
                iconType="rect"
                iconSize={8}
              />
              {(Object.keys(ASARCO_C) as AsarcoKey[]).map((k) => (
                <Bar
                  key={k}
                  dataKey={ASARCO_L[k]}
                  stackId="a"
                  fill={ASARCO_C[k]}
                  opacity={0.88}
                  radius={k === "perdidaOperacional" ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 5. Donut Grid ASARCO ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#E4E4E7] bg-white p-4">
        <SectionLabel>Desglose por Flota (ASARCO)</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ASARCO_FLOTA.map((a) => (
            <DonutFlota key={a.tipoFlota} modelo={a.modelo} distribucion={a.distribucion} />
          ))}
        </div>
        {/* Leyenda compartida */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-[#F4F4F5]">
          {(Object.keys(ASARCO_C) as AsarcoKey[]).map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: ASARCO_C[k] }} />
              <span className="text-[10px] text-[#71717A]">{ASARCO_L[k]}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
