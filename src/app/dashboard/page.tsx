"use client";

import { FLOTA } from "@/lib/data/flota";
import { TENDENCIAS } from "@/lib/data/tendencias";
import { ASARCO_FLOTA } from "@/lib/data/asarco";
import { ALERTAS } from "@/lib/data/alertas";
import { calcularSemaforoGeneral } from "@/lib/domain/semaforo";
import { calcularResumenFlota } from "@/lib/data/flota-resumen";
import type { FlotaResumen } from "@/lib/domain/tipos";
import { FlotaSemaforo } from "@/components/dashboard/FlotaSemaforo";
import { KpiSummaryStrip } from "@/components/dashboard/KpiSummaryStrip";
import { AlertasRecientes } from "@/components/dashboard/AlertasRecientes";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TendenciaSeisMeses } from "@/components/charts/TendenciaSeisMeses";
import { AsarcoTimeChart } from "@/components/charts/AsarcoTimeChart";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

export default function DashboardPage() {
  const flotas: FlotaResumen[] = [
    calcularResumenFlota("785D",   "CAT 785D"),
    calcularResumenFlota("777F",   "CAT 777F"),
    calcularResumenFlota("992",    "CAT 992"),
    calcularResumenFlota("PC2000", "Komatsu PC-2000"),
  ];

  const activos = FLOTA.filter((e) => !e.paroTotal);
  const avg = (fn: (e: typeof FLOTA[0]) => number) =>
    Math.round(activos.reduce((a, e) => a + fn(e), 0) / activos.length * 10) / 10;

  const kpiItems = [
    { label: "Dfm Flota",  valor: avg((e) => e.kpis.dfm),             unidad: "%", objetivo: 85, delta: -1.2,
      estado: calcularSemaforoGeneral({ dfm: avg((e) => e.kpis.dfm), tmef: 80, tmpr: 5, tiempoOperativo: 80, reserva: 8 }) },
    { label: "TMEF Prom.", valor: avg((e) => e.kpis.tmef),            unidad: "h", objetivo: 80, delta: -2.5,
      estado: calcularSemaforoGeneral({ dfm: 80, tmef: avg((e) => e.kpis.tmef), tmpr: 5, tiempoOperativo: 80, reserva: 8 }) },
    { label: "TMPR Prom.", valor: avg((e) => e.kpis.tmpr),            unidad: "h", objetivo: 5,  delta: 3.1, invertido: true,
      estado: calcularSemaforoGeneral({ dfm: 80, tmef: 80, tmpr: avg((e) => e.kpis.tmpr), tiempoOperativo: 80, reserva: 8 }) },
    { label: "Tiempo Op.", valor: avg((e) => e.kpis.tiempoOperativo), unidad: "%", objetivo: 80, delta: -1.8,
      estado: calcularSemaforoGeneral({ dfm: 80, tmef: 80, tmpr: 5, tiempoOperativo: avg((e) => e.kpis.tiempoOperativo), reserva: 8 }) },
    { label: "Reserva",    valor: avg((e) => e.kpis.reserva),         unidad: "%", objetivo: 8,  delta: 2.3, invertido: true,
      estado: calcularSemaforoGeneral({ dfm: 80, tmef: 80, tmpr: 5, tiempoOperativo: 80, reserva: avg((e) => e.kpis.reserva) }) },
  ];

  const enParo   = FLOTA.filter((e) => e.paroTotal).length;
  const criticos = FLOTA.filter((e) => !e.paroTotal && e.semaforo.general === "rojo").length;
  const tendencia777F = TENDENCIAS.find((t) => t.tipoFlota === "777F");

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">

      {/* ─ Header stats ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <Tooltip short="Total de equipos en la faena El Salvador" help={HELP.columnaId}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-white border border-[#E4E4E7]">
            <span className="text-[11px] text-[#52525B]">Total equipos</span>
            <span className="font-mono font-bold text-[#09090B]">{FLOTA.length}</span>
          </div>
        </Tooltip>
        {enParo > 0 && (
          <Tooltip short="Equipos completamente detenidos por falla mayor" help={HELP.paroTotal}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-[#FEF2F2] border border-[#FECACA]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping-slow" />
              <span className="text-[11px] text-[#991B1B] font-semibold">{enParo} en paro total</span>
            </div>
          </Tooltip>
        )}
        {criticos > 0 && (
          <Tooltip short="Operan pero con KPIs en estado crítico (rojo)" help={HELP.criticos}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-[#FEF2F2] border border-[#FECACA]">
              <span className="text-[11px] text-[#B91C1C]">{criticos} críticos</span>
            </div>
          </Tooltip>
        )}
        <Tooltip short="Total de alertas por KPIs fuera de umbral" help={HELP.alertasActivas}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-white border border-[#E4E4E7]">
            <span className="text-[11px] text-[#52525B]">Alertas activas</span>
            <span className="font-mono font-bold text-[#B45309]">{ALERTAS.length}</span>
          </div>
        </Tooltip>
      </div>

      {/* ─ KPI strip ─────────────────────────────────────────────────────── */}
      <section aria-label="KPIs promedio de flota">
        <SectionTitle className="mb-3">
          <Tooltip short="Indicadores Clave de Rendimiento promedio de toda la flota activa" help={HELP.tendencia6Meses}>
            KPIs Flota — Abril 2025
          </Tooltip>
        </SectionTitle>
        <KpiSummaryStrip items={[...kpiItems]} />
      </section>

      {/* ─ Semáforo + Alertas ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <section aria-label="Estado de flota por tipo">
          <SectionTitle className="mb-3">
            <Tooltip short="Estado de salud por tipo de equipo con semáforo de criticidad" help={HELP.estadoFlota}>
              Estado por Flota
            </Tooltip>
          </SectionTitle>
          <FlotaSemaforo flotas={flotas} />
        </section>
        <section aria-label="Alertas más críticas">
          <SectionTitle className="mb-3">
            <Tooltip short="Los 5 equipos más críticos en este momento" help={HELP.alertasPrioritarias}>
              Alertas Prioritarias
            </Tooltip>
          </SectionTitle>
          <AlertasRecientes alertas={ALERTAS} max={5} />
        </section>
      </div>

      {/* ─ Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
        <section aria-label="Tendencia de KPIs en 6 meses">
          <SectionTitle className="mb-3">
            <Tooltip short="Evolución histórica de KPIs para detectar deterioro o mejora" help={HELP.tendencia6Meses}>
              Tendencia 6 Meses — CAT 777F
            </Tooltip>
          </SectionTitle>
          {tendencia777F && <TendenciaSeisMeses datos={tendencia777F.datos} />}
        </section>
        <section aria-label="Distribución ASARCO">
          <SectionTitle className="mb-3">
            <Tooltip short="Cómo se distribuye el tiempo de los equipos en las 5 categorías ASARCO" help={HELP.distribucionAsarco}>
              Distribución ASARCO
            </Tooltip>
          </SectionTitle>
          <div className="p-4 rounded-[10px] bg-white border border-[#E4E4E7]">
            <AsarcoTimeChart datos={ASARCO_FLOTA} />
            {/* Leyenda manual compacta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {[
                ["#16A34A", "Operativo",      "asarcoOperativo"],
                ["#3A6AB0", "Reserva",         "asarcoReserva"],
                ["#D97706", "Det. Prog.",      "asarcoDetProg"],
                ["#DC2626", "Det. No Prog.",   "asarcoDetNoProg"],
                ["#7F1D1D", "Pérdida",         "asarcoPerdida"],
              ].map(([color, label, helpKey]) => (
                <Tooltip key={label} short={label} help={HELP[helpKey]}>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[10px] text-[#71717A]">{label}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
