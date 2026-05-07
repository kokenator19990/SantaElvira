import { KpiGauge } from "@/components/kpi/KpiGauge";
import type { Equipo } from "@/lib/domain/tipos";

interface EquipoKpiPanelProps {
  equipo: Equipo;
}

export function EquipoKpiPanel({ equipo }: EquipoKpiPanelProps) {
  const { kpis, semaforo } = equipo;

  if (equipo.paroTotal) {
    return (
      <div className="flex flex-col items-center justify-center h-36 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] gap-2">
        <span className="text-[18px] font-bold text-[#991B1B] uppercase tracking-widest">
          PARO TOTAL
        </span>
        <p className="text-[13px] text-[#991B1B]/60 text-center px-4 max-w-[220px] leading-relaxed">
          {equipo.motivoParo}
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-4 rounded-[10px] bg-white border border-[#E4E4E7]"
      role="img"
      aria-label={`KPIs del equipo ${equipo.id}`}
    >
      <KpiGauge label="Dfm"        valor={kpis.dfm}             max={100} unidad="%" estado={semaforo.dfm}             helpKey="dfm" />
      <KpiGauge label="TMEF"       valor={kpis.tmef}            max={150} unidad="h" estado={semaforo.tmef}            helpKey="tmef" />
      <KpiGauge label="TMPR"       valor={kpis.tmpr}            max={30}  unidad="h" estado={semaforo.tmpr} invertido  helpKey="tmpr" />
      <KpiGauge label="Tiempo Op." valor={kpis.tiempoOperativo} max={100} unidad="%" estado={semaforo.tiempoOperativo} helpKey="tiempoOperativo" />
      <KpiGauge label="Reserva"    valor={kpis.reserva}         max={40}  unidad="%" estado={semaforo.reserva} invertido helpKey="reserva" />
    </div>
  );
}
