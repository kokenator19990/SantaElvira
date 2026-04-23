"use client";

import type { Equipo, FlotaResumen, EstadoSemaforo } from "@/lib/domain/tipos";
import { GraficosReporte } from "./GraficosReporte";

interface ReportePreviewProps {
  periodo: string;
  flotas: FlotaResumen[];
  equiposCriticos: Equipo[];
  equiposEnParo: Equipo[];
}

// ─── Color helpers ─────────────────────────────────────────────────────────────
const ESTADO_LABEL: Record<EstadoSemaforo, string> = {
  verde: "VERDE",
  ambar: "ÁMBAR",
  rojo:  "ROJO",
  paro:  "PARO",
};

const ESTADO_PRINT_COLOR: Record<EstadoSemaforo, string> = {
  verde: "#15803D",
  ambar: "#B45309",
  rojo:  "#B91C1C",
  paro:  "#991B1B",
};

const ESTADO_BG: Record<EstadoSemaforo, string> = {
  verde: "#F0FDF4",
  ambar: "#FFFBEB",
  rojo:  "#FEF2F2",
  paro:  "#FEF2F2",
};

// ─── Estado general de la flota ───────────────────────────────────────────────
function calcularEstadoGeneral(flotas: FlotaResumen[]): EstadoSemaforo {
  if (flotas.some((f) => f.semaforoGeneral === "paro")) return "paro";
  if (flotas.some((f) => f.semaforoGeneral === "rojo")) return "rojo";
  if (flotas.some((f) => f.semaforoGeneral === "ambar")) return "ambar";
  return "verde";
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function ReportePreview({ periodo, flotas, equiposCriticos, equiposEnParo }: ReportePreviewProps) {
  const fechaGeneracion = new Date().toLocaleDateString("es-CL", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const estadoGeneral = calcularEstadoGeneral(flotas);
  const dfmFlota   = flotas.length > 0
    ? Math.round(flotas.reduce((s, f) => s + f.dfmPromedio,  0) / flotas.length * 10) / 10
    : 0;
  const tmefFlota  = flotas.length > 0
    ? Math.round(flotas.reduce((s, f) => s + f.tmefPromedio, 0) / flotas.length * 10) / 10
    : 0;
  const tmprFlota  = flotas.length > 0
    ? Math.round(flotas.reduce((s, f) => s + f.tmprPromedio, 0) / flotas.length * 10) / 10
    : 0;

  return (
    <div className="print-target bg-white rounded-xl border border-[#E4E4E7] overflow-hidden">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-[#E4E4E7] flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[18px] font-bold text-[#09090B] tracking-tight">
              Informe Mensual Flota
            </h1>
            {/* Badge estado — oculto en print, mostrado como texto */}
            <span
              className="no-print inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: ESTADO_BG[estadoGeneral],
                color: ESTADO_PRINT_COLOR[estadoGeneral],
              }}
            >
              {ESTADO_LABEL[estadoGeneral]}
            </span>
            <span
              className="print-only hidden text-[11px] font-bold uppercase"
              style={{ color: ESTADO_PRINT_COLOR[estadoGeneral] }}
            >
              {ESTADO_LABEL[estadoGeneral]}
            </span>
          </div>
          <p className="text-[13px] text-[#71717A]">
            Mining Services Group Ltda. — Faena El Salvador
          </p>
          <p className="text-[12px] text-[#A1A1AA] mt-0.5">Período: {periodo}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[12px] text-[#71717A]">Generado: {fechaGeneracion}</p>
          <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">Dashboard KPI MSG v1.0</p>
        </div>
      </div>

      {/* ── KPI CARDS — pantalla only ─────────────────────────────────────── */}
      <div className="no-print grid grid-cols-3 divide-x divide-[#F4F4F5] border-b border-[#E4E4E7]">
        {[
          { label: "Dfm promedio",   valor: `${dfmFlota}%`,  nota: "≥ 85% meta",  color: dfmFlota >= 85 ? "#15803D" : dfmFlota >= 75 ? "#B45309" : "#DC2626" },
          { label: "TMEF promedio",  valor: `${tmefFlota}h`, nota: "≥ 80h meta",  color: tmefFlota >= 80 ? "#15803D" : tmefFlota >= 50 ? "#B45309" : "#DC2626" },
          { label: "TMPR promedio",  valor: `${tmprFlota}h`, nota: "≤ 5h meta",   color: tmprFlota <= 5 ? "#15803D" : tmprFlota <= 15 ? "#B45309" : "#DC2626" },
        ].map(({ label, valor, nota, color }) => (
          <div key={label} className="px-5 py-4 flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-[0.1em]">{label}</span>
            <span className="text-[24px] font-bold font-mono leading-none" style={{ color }}>{valor}</span>
            <span className="text-[10px] text-[#A1A1AA]">{nota}</span>
          </div>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* ── SECCIÓN 1: Resumen por flota ─────────────────────────────────── */}
        <section>
          <h2 className="text-[14px] font-bold text-[#09090B] border-l-[3px] border-[#09090B] pl-3 mb-3">
            1. Resumen por Flota
          </h2>
          <div className="overflow-x-auto rounded-lg border border-[#E4E4E7]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#F4F4F5]">
                  <th className="border border-[#E4E4E7] px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[#52525B]">Flota</th>
                  <th className="border border-[#E4E4E7] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#52525B]">N°</th>
                  <th className="border border-[#E4E4E7] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#52525B]">Dfm</th>
                  <th className="border border-[#E4E4E7] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#52525B]">TMEF</th>
                  <th className="border border-[#E4E4E7] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#52525B]">TMPR</th>
                  <th className="border border-[#E4E4E7] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#52525B]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {flotas.map((f) => (
                  <tr key={f.tipo} className="bg-white hover:bg-[#FAFAFA] transition-colors">
                    <td className="border border-[#F4F4F5] px-3 py-2.5 font-medium text-[#09090B]">{f.modelo}</td>
                    <td className="border border-[#F4F4F5] px-3 py-2.5 text-center text-[#52525B]">{f.cantidad}</td>
                    <td className="border border-[#F4F4F5] px-3 py-2.5 text-center font-mono text-[#52525B]">{f.dfmPromedio}%</td>
                    <td className="border border-[#F4F4F5] px-3 py-2.5 text-center font-mono text-[#52525B]">{f.tmefPromedio}h</td>
                    <td className="border border-[#F4F4F5] px-3 py-2.5 text-center font-mono text-[#52525B]">{f.tmprPromedio}h</td>
                    <td className="border border-[#F4F4F5] px-3 py-2.5 text-center">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: ESTADO_BG[f.semaforoGeneral],
                          color: ESTADO_PRINT_COLOR[f.semaforoGeneral],
                        }}
                      >
                        {ESTADO_LABEL[f.semaforoGeneral]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Paros ─────────────────────────────────────────────── */}
        {equiposEnParo.length > 0 && (
          <section>
            <h2 className="text-[14px] font-bold text-[#09090B] border-l-[3px] border-[#B91C1C] pl-3 mb-3">
              2. Equipos en Paro Total ({equiposEnParo.length})
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#FECACA]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#FEF2F2]">
                    <th className="border border-[#FECACA] px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">ID</th>
                    <th className="border border-[#FECACA] px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">Modelo</th>
                    <th className="border border-[#FECACA] px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">Motivo del paro</th>
                  </tr>
                </thead>
                <tbody>
                  {equiposEnParo.map((e) => (
                    <tr key={e.id} className="bg-[#FEF2F2]">
                      <td className="border border-[#FECACA] px-3 py-2.5 font-mono font-bold text-[#B91C1C]">{e.id}</td>
                      <td className="border border-[#FECACA] px-3 py-2.5 text-[#52525B]">{e.modelo}</td>
                      <td className="border border-[#FECACA] px-3 py-2.5 text-[#52525B]">{e.motivoParo ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── SECCIÓN 3: Críticos ──────────────────────────────────────────── */}
        {equiposCriticos.length > 0 && (
          <section>
            <h2 className="text-[14px] font-bold text-[#09090B] border-l-[3px] border-[#B45309] pl-3 mb-3">
              3. Equipos en Estado Crítico ({equiposCriticos.length})
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#E4E4E7]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F4F4F5]">
                    <th className="border border-[#E4E4E7] px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[#52525B]">ID</th>
                    <th className="border border-[#E4E4E7] px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-[#52525B]">Modelo</th>
                    <th className="border border-[#E4E4E7] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#52525B]">Dfm</th>
                    <th className="border border-[#E4E4E7] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#52525B]">TMEF</th>
                    <th className="border border-[#E4E4E7] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#52525B]">TMPR</th>
                  </tr>
                </thead>
                <tbody>
                  {equiposCriticos.map((e) => (
                    <tr key={e.id} className="bg-white hover:bg-[#FAFAFA]">
                      <td className="border border-[#F4F4F5] px-3 py-2.5 font-mono font-bold text-[#B91C1C]">{e.id}</td>
                      <td className="border border-[#F4F4F5] px-3 py-2.5 text-[#52525B]">{e.modelo}</td>
                      <td className="border border-[#F4F4F5] px-3 py-2.5 text-center font-mono text-[#B91C1C]">{e.kpis.dfm}%</td>
                      <td className="border border-[#F4F4F5] px-3 py-2.5 text-center font-mono text-[#B91C1C]">{e.kpis.tmef}h</td>
                      <td className="border border-[#F4F4F5] px-3 py-2.5 text-center font-mono text-[#B45309]">{e.kpis.tmpr}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── GRÁFICOS VISUALES — pantalla only ────────────────────────────── */}
        <GraficosReporte flotas={flotas} />

        {/* ── PIE ──────────────────────────────────────────────────────────── */}
        <footer className="pt-4 border-t border-[#E4E4E7] flex flex-col sm:flex-row justify-between gap-1 text-[10px] text-[#A1A1AA]">
          <span>MSG — Dashboard KPI El Salvador</span>
          <span>Confidencial · Solo uso interno</span>
          <span>Generado automáticamente</span>
        </footer>
      </div>
    </div>
  );
}
