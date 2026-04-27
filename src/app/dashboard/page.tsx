export const revalidate = 300;

import { getFlota } from "@/lib/db/queries/flota";
import { getAlertas } from "@/lib/db/queries/alertas";
import { getAsarcoPorFlota } from "@/lib/db/queries/asarco";
import { getTendenciaPorTipo } from "@/lib/db/queries/tendencias";
import { clasificarDfm, clasificarTmef, clasificarTmpr, clasificarTiempoOperativo, clasificarReserva } from "@/lib/domain/semaforo";
import { calcularResumenFlota } from "@/lib/data/flota-resumen";
import type { FlotaResumen } from "@/lib/domain/tipos";
import { FlotaSemaforo } from "@/components/dashboard/FlotaSemaforo";
import { KpiSummaryStrip } from "@/components/dashboard/KpiSummaryStrip";
import { AlertasRecientes } from "@/components/dashboard/AlertasRecientes";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TendenciaSeisMeses, AsarcoTimeChart } from "@/components/charts/lazy";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const round1 = (n: number) => Math.round(n * 10) / 10;

export default async function DashboardPage() {
  const [flota, alertas, asarcoFlota, tendencia777F] = await Promise.all([
    getFlota(),
    getAlertas(),
    getAsarcoPorFlota(),
    getTendenciaPorTipo("777F"),
  ]);

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
    { label: "Dfm Flota",  valor: AVG_DFM,  unidad: "%", objetivo: 85, delta: -1.2, estado: clasificarDfm(AVG_DFM) },
    { label: "TMEF Prom.", valor: AVG_TMEF, unidad: "h", objetivo: 80, delta: -2.5, estado: clasificarTmef(AVG_TMEF) },
    { label: "TMPR Prom.", valor: AVG_TMPR, unidad: "h", objetivo: 5,  delta: 3.1, invertido: true, estado: clasificarTmpr(AVG_TMPR) },
    { label: "Tiempo Op.", valor: AVG_TOP,  unidad: "%", objetivo: 80, delta: -1.8, estado: clasificarTiempoOperativo(AVG_TOP) },
    { label: "Reserva",    valor: AVG_RES,  unidad: "%", objetivo: 8,  delta: 2.3, invertido: true, estado: clasificarReserva(AVG_RES) },
  ];

  const EN_PARO  = flota.filter((e) => e.paroTotal).length;
  const CRITICOS = flota.filter((e) => !e.paroTotal && e.semaforo.general === "rojo").length;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">

      {/* ─ Header stats ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <Tooltip short="Total de equipos en la faena El Salvador" help={HELP.columnaId}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-white border border-[#E4E4E7]">
            <span className="text-[12px] text-[#52525B]">Total equipos</span>
            <span className="font-mono font-bold text-[#09090B]">{flota.length}</span>
          </div>
        </Tooltip>
        {EN_PARO > 0 && (
          <Tooltip short="Equipos completamente detenidos por falla mayor" help={HELP.paroTotal}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-[#FEF2F2] border border-[#FECACA]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-[12px] text-[#991B1B] font-semibold">{EN_PARO} en paro total</span>
            </div>
          </Tooltip>
        )}
        {CRITICOS > 0 && (
          <Tooltip short="Operan pero con KPIs en estado crítico (rojo)" help={HELP.criticos}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-[#FEF2F2] border border-[#FECACA]">
              <span className="text-[12px] text-[#B91C1C]">{CRITICOS} críticos</span>
            </div>
          </Tooltip>
        )}
        <Tooltip short="Total de alertas por KPIs fuera de umbral" help={HELP.alertasActivas}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-white border border-[#E4E4E7]">
            <span className="text-[12px] text-[#52525B]">Alertas activas</span>
            <span className="font-mono font-bold text-[#B45309]">{alertas.length}</span>
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
        <KpiSummaryStrip items={KPI_ITEMS} />
      </section>

      {/* ─ Semáforo + Alertas ────────────────────────────────────────────── */}
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
            <AsarcoTimeChart datos={asarcoFlota} />
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
                    <span className="text-[11px] text-[#71717A]">{label}</span>
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
