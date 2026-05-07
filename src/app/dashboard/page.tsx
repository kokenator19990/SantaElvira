import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dashboard" };

// No ISR fijo — la página lee searchParams (períodos), se renderiza dinámicamente
export const dynamic = "force-dynamic";

import { getFlota } from "@/lib/db/queries/flota";
import { getAlertas } from "@/lib/db/queries/alertas";
import { getAsarcoPorFlota } from "@/lib/db/queries/asarco";
import { getTendencias, getKpisDeltaFlota } from "@/lib/db/queries/tendencias";
import { getPeriodos, getPeriodoActual } from "@/lib/db/queries/periodos";
import { clasificarDfm, clasificarTmef, clasificarTmpr, clasificarTiempoOperativo, clasificarReserva } from "@/lib/domain/semaforo";
import { calcularResumenFlota } from "@/lib/data/flota-resumen";
import { generarResumenEjecutivo, formatUsd } from "@/lib/domain/resumen-ejecutivo";
import type { FlotaResumen } from "@/lib/domain/tipos";
import Link from "next/link";
import { Table2, Lock, DollarSign, FileText, Clock } from "lucide-react";
import { FlotaSemaforo } from "@/components/dashboard/FlotaSemaforo";
import { KpiSummaryStrip } from "@/components/dashboard/KpiSummaryStrip";
import { AlertasRecientes } from "@/components/dashboard/AlertasRecientes";
import { PeriodoSelector } from "@/components/dashboard/PeriodoSelector";
import { DashboardExport } from "@/components/dashboard/DashboardExport";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TendenciaFlotaSelector, AsarcoTimeChart } from "@/components/charts/lazy";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

import { round1 } from "@/lib/utils/safe-parse";
import { getUmbralesActivos } from "@/lib/db/queries/umbrales";
import { OBJETIVO_DFM, OBJETIVO_TMEF, OBJETIVO_TMPR, OBJETIVO_OP, OBJETIVO_RESERVA } from "@/lib/constants/umbrales";

interface Props {
  searchParams: { periodo?: string };
}

export default async function DashboardPage({ searchParams }: Props) {
  const raw = searchParams.periodo;
  const parsed = raw ? parseInt(raw, 10) : undefined;
  const periodoIdParam = parsed && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;

  const [flota, alertas, asarcoFlota, tendencias, periodos, periodoActual, delta, umbralesActivos] = await Promise.all([
    getFlota(periodoIdParam),
    getAlertas(periodoIdParam),
    getAsarcoPorFlota(periodoIdParam),
    getTendencias(),
    getPeriodos(),
    getPeriodoActual(),
    getKpisDeltaFlota(periodoIdParam),
    getUmbralesActivos(),
  ]);

  // Objetivos KPI: usar umbrales de BD si existen, sino fallback a constantes
  const umbralMap = new Map(umbralesActivos.map((u) => [u.kpi, u]));
  const parseUmbral = (val: string | undefined, fallback: number) => {
    if (val == null) return fallback;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };
  const OBJ_DFM  = parseUmbral(umbralMap.get("dfm")?.nivelVerde, OBJETIVO_DFM);
  const OBJ_TMEF = parseUmbral(umbralMap.get("tmef")?.nivelVerde, OBJETIVO_TMEF);
  const OBJ_TMPR = parseUmbral(umbralMap.get("tmpr")?.nivelVerde, OBJETIVO_TMPR);
  const OBJ_OP   = parseUmbral(umbralMap.get("tiempoOperativo")?.nivelVerde, OBJETIVO_OP);
  const OBJ_RES  = parseUmbral(umbralMap.get("reserva")?.nivelVerde, OBJETIVO_RESERVA);

  // Label del período mostrado
  const periodoLabel = periodoIdParam
    ? (periodos.find((p) => p.id === periodoIdParam)?.label ?? "Período seleccionado")
    : (periodoActual?.label ?? "Sin datos");

  const FLOTAS: FlotaResumen[] = [
    calcularResumenFlota("785D",   "CAT 785D",        flota),
    calcularResumenFlota("777F",   "CAT 777F",        flota),
    calcularResumenFlota("992",    "CAT 992",         flota),
    calcularResumenFlota("PC2000", "Komatsu PC-2000", flota),
  ];

  const ACTIVOS = flota.filter((e) => !e.paroTotal);
  const avg = (fn: (e: typeof flota[0]) => number) =>
    ACTIVOS.length === 0 ? 0 : round1(ACTIVOS.reduce((a, e) => a + fn(e), 0) / ACTIVOS.length);

  const AVG_DFM  = avg((e) => e.kpis.dfm);
  const AVG_TMEF = avg((e) => e.kpis.tmef);
  const AVG_TMPR = avg((e) => e.kpis.tmpr);
  const AVG_TOP  = avg((e) => e.kpis.tiempoOperativo);
  const AVG_RES  = avg((e) => e.kpis.reserva);

  const KPI_ITEMS = [
    { label: "Dfm Flota",  labelGerente: "Disponibilidad",       valor: AVG_DFM,  unidad: "%", objetivo: OBJ_DFM,  delta: delta?.dfm  ?? null, estado: clasificarDfm(AVG_DFM) },
    { label: "TMEF Prom.", labelGerente: "Tiempo entre Fallas",   valor: AVG_TMEF, unidad: "h", objetivo: OBJ_TMEF, delta: delta?.tmef ?? null, estado: clasificarTmef(AVG_TMEF) },
    { label: "TMPR Prom.", labelGerente: "Tiempo de Reparación",  valor: AVG_TMPR, unidad: "h", objetivo: OBJ_TMPR, delta: delta?.tmpr ?? null, invertido: true, estado: clasificarTmpr(AVG_TMPR) },
    { label: "Tiempo Op.", labelGerente: "Tiempo Productivo",     valor: AVG_TOP,  unidad: "%", objetivo: OBJ_OP,   delta: delta?.tiempoOperativo ?? null, estado: clasificarTiempoOperativo(AVG_TOP) },
    { label: "Reserva",    labelGerente: "Equipos sin Tarea",     valor: AVG_RES,  unidad: "%", objetivo: OBJ_RES,  delta: delta?.reserva ?? null, invertido: true, estado: clasificarReserva(AVG_RES) },
  ];

  const EN_PARO  = flota.filter((e) => e.paroTotal).length;
  const CRITICOS = flota.filter((e) => !e.paroTotal && e.semaforo.general === "rojo").length;

  const sinDatos = flota.length === 0;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">

      {/* ─ Header: período + selector ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip short="Total de equipos en la faena El Salvador" help={HELP.totalEquipos}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-white border border-[#E4E4E7]">
              <span className="text-[12px] text-[#52525B]">Total equipos</span>
              <span className="font-mono font-bold text-[#09090B]">{flota.length}</span>
            </div>
          </Tooltip>
          {EN_PARO > 0 && (
            <Tooltip short="Equipos completamente detenidos por falla mayor" help={HELP.paroTotal}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-[#FEF2F2] border border-[#FECACA]">
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <span className="text-[14px] text-[#991B1B] font-bold">{EN_PARO} en paro</span>
              </div>
            </Tooltip>
          )}
          {CRITICOS > 0 && (
            <Tooltip short="Operan pero con KPIs en estado crítico (rojo)" help={HELP.criticos}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-[#FEF2F2] border border-[#FECACA]">
                <span className="text-[14px] text-[#B91C1C] font-bold">{CRITICOS} {CRITICOS === 1 ? "crítico" : "críticos"}</span>
              </div>
            </Tooltip>
          )}
          <Tooltip short="Total de alertas por KPIs fuera de umbral" help={HELP.alertasActivas}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-white border border-[#E4E4E7]">
              <span className="text-[13px] text-[#52525B]">Alertas</span>
              <span className="font-mono font-bold text-[16px] text-[#B45309]">{alertas.length}</span>
            </div>
          </Tooltip>
        </div>

        {/* Selector de período + export */}
        <div className="flex items-center gap-2">
          {periodos.length > 0 && (
            <>
              <span className="text-[12px] text-[#71717A]">Período:</span>
              <PeriodoSelector
                periodos={periodos}
                periodoSeleccionadoId={periodoIdParam ?? periodoActual?.id}
              />
            </>
          )}
          <DashboardExport flota={flota} periodoLabel={periodoLabel} />
          <Link
            href="/explorador"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-semibold text-[#52525B] transition-colors"
            title="Ver todos los datos en vista tipo planilla"
          >
            <Table2 size={13} /> Explorador
          </Link>
        </div>
      </div>

      {/* Indicador de período cerrado */}
      {periodoActual?.cerrado && !periodoIdParam && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A]">
          <Lock size={13} className="text-[#B45309] shrink-0" />
          <p className="text-[12px] text-[#92400E]">
            <strong>{periodoActual.label}</strong> está cerrado — los datos de este período están congelados y no se actualizarán.
          </p>
        </div>
      )}

      {/* Banner: estás viendo un período que NO es el actual */}
      {periodoIdParam && periodoActual && periodoIdParam !== periodoActual.id && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE]">
          <Clock size={14} className="text-[#1D4ED8] shrink-0" />
          <p className="text-[13px] text-[#1E40AF] flex-1">
            Estás viendo datos de <strong>{periodoLabel}</strong>.
            El período actual es <strong>{periodoActual.label}</strong>.
          </p>
          <Link
            href="/dashboard"
            className="text-[12px] font-bold text-[#1D4ED8] hover:underline shrink-0"
          >
            Ir al actual
          </Link>
        </div>
      )}

      {/* ─ Estado sin datos ─────────────────────────────────────────────────── */}
      {sinDatos && (
        <div className="flex flex-col items-center justify-center gap-3 h-64 rounded-[12px] bg-white border border-[#E4E4E7]">
          <p className="text-[16px] font-semibold text-[#52525B]">Sin datos para este período</p>
          <p className="text-[13px] text-[#A1A1AA] text-center max-w-sm">
            Aún no se han cargado KPIs. Para comenzar, ve a <strong>Admin</strong> y sigue el flujo: crear período, registrar horas diarias, registrar fallas y calcular KPIs.
          </p>
          <Link
            href="/admin"
            className="mt-2 px-4 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] text-white text-[13px] font-semibold transition-colors"
          >
            Ir a Admin
          </Link>
        </div>
      )}

      {!sinDatos && (
        <>
          {/* ─ KPI strip ──────────────────────────────────────────────────────── */}
          <section aria-label="KPIs promedio de flota">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <SectionTitle>
                <Tooltip short="Indicadores Clave de Rendimiento promedio de toda la flota activa" help={HELP.kpiStripFlota}>
                  KPIs Flota — {periodoLabel}
                  {!delta && <span className="ml-2 text-[11px] font-normal text-[#A1A1AA]">(primer período — sin comparativa)</span>}
                </Tooltip>
              </SectionTitle>
              <span className="text-[11px] text-[#52525B] font-mono px-2 py-1 rounded-md bg-[#F4F4F5]" suppressHydrationWarning>
                Actualizado {new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "short" })} {new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <KpiSummaryStrip items={KPI_ITEMS} />
          </section>

          {/* ─ Resumen Ejecutivo + Pérdida ──────────────────────────────────── */}
          {(() => {
            const periodoSeleccionado = periodoIdParam
              ? periodos.find((p) => p.id === periodoIdParam)
              : periodoActual;
            const resumen = generarResumenEjecutivo(flota, FLOTAS, delta, periodoLabel,
              periodoSeleccionado ? { anio: periodoSeleccionado.anio, mes: periodoSeleccionado.mes } : undefined);
            const estadoColor = resumen.estado === "critico" ? "#DC2626"
              : resumen.estado === "advertencia" ? "#D97706" : "#16A34A";
            const estadoBg = resumen.estado === "critico" ? "bg-[#FEF2F2] border-[#FECACA]"
              : resumen.estado === "advertencia" ? "bg-[#FFFBEB] border-[#FDE68A]" : "bg-[#F0FDF4] border-[#BBF7D0]";
            const estadoLabel = resumen.estado === "critico" ? "CRÍTICO"
              : resumen.estado === "advertencia" ? "ADVERTENCIA" : "ESTABLE";

            return (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4">
                <section className={`p-4 rounded-[10px] border ${estadoBg}`} aria-label="Resumen ejecutivo">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} style={{ color: estadoColor }} />
                    <span className="text-[13px] font-bold" style={{ color: estadoColor }}>
                      Resumen Ejecutivo — {estadoLabel}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {resumen.bullets.map((b, i) => (
                      <li key={i} className="text-[13px] text-[#52525B] leading-snug flex gap-2">
                        <span className="text-[#A1A1AA] shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="flex flex-col gap-2 p-4 rounded-[10px] bg-white border border-[#E4E4E7]" aria-label="Pérdida estimada">
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={13} className="text-[#B91C1C]" />
                    <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-[0.1em]">Pérdida Est.</span>
                  </div>
                  <span className="text-[32px] font-mono font-bold text-[#B91C1C] leading-none">
                    {formatUsd(resumen.perdidaEstimadaUsd)}
                  </span>
                  <span className="text-[11px] text-[#A1A1AA] leading-tight">
                    USD/mes por detención no programada y pérdida operacional
                  </span>
                </section>
              </div>
            );
          })()}

          {/* ─ Semáforo + Alertas ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <section aria-label="Estado de flota por tipo">
              <SectionTitle className="mb-3">
                <Tooltip short="Estado de salud por tipo de equipo con semáforo de criticidad" help={HELP.estadoFlota}>
                  Estado por Flota
                </Tooltip>
              </SectionTitle>
              <FlotaSemaforo flotas={FLOTAS} />
            </section>
            <section aria-label="Alertas más críticas">
              <SectionTitle className="mb-3">
                <Tooltip short="Los 5 equipos más críticos en este momento" help={HELP.alertasPrioritarias}>
                  Alertas Prioritarias
                </Tooltip>
              </SectionTitle>
              <AlertasRecientes alertas={alertas} max={5} />
            </section>
          </div>

          {/* ─ Charts ─────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
            <section aria-label="Tendencia de KPIs por flota">
              <SectionTitle className="mb-3">
                <Tooltip short="Evolución histórica de KPIs por tipo de flota — selecciona la flota con los botones" help={HELP.tendencia6Meses}>
                  Tendencia Histórica por Flota
                </Tooltip>
              </SectionTitle>
              <TendenciaFlotaSelector tendencias={tendencias} flotaInicial="777F" />
            </section>
            <section aria-label="Distribución ASARCO">
              <SectionTitle className="mb-3">
                <Tooltip short="Cómo se distribuye el tiempo de los equipos en las 5 categorías ASARCO" help={HELP.distribucionAsarco}>
                  Distribución ASARCO
                </Tooltip>
              </SectionTitle>
              <div className="p-4 rounded-[10px] bg-white border border-[#E4E4E7]">
                <AsarcoTimeChart datos={asarcoFlota} />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                  {[
                    ["#16A34A", "Operativo",    "asarcoOperativo"],
                    ["#3A6AB0", "Reserva",       "asarcoReserva"],
                    ["#D97706", "Det. Prog.",    "asarcoDetProg"],
                    ["#DC2626", "Det. No Prog.", "asarcoDetNoProg"],
                    ["#7F1D1D", "Pérdida",       "asarcoPerdida"],
                  ].map(([color, label, helpKey]) => (
                    <Tooltip key={label} short={label} help={HELP[helpKey]}>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[11px] text-[#71717A]">{label}</span>
                      </div>
                    </Tooltip>
                  ))}
                  <span className="text-[11px] text-[#15803D] font-semibold ml-1">
                    — Meta Operativo: {OBJ_OP}%
                  </span>
                </div>
              </div>
            </section>
          </div>
        </>
      )}

    </div>
  );
}
