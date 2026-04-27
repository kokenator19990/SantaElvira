export const revalidate = 300;

import { getAlertas } from "@/lib/db/queries/alertas";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { SectionTitle } from "@/components/ui/SectionTitle";
import Link from "next/link";
import type { Alerta, EstadoSemaforo } from "@/lib/domain/tipos";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const KPI_LABEL: Record<string, string> = {
  dfm:             "Disponibilidad Física",
  tmef:            "TMEF",
  tmpr:            "TMPR",
  tiempoOperativo: "Tiempo Operativo",
  reserva:         "Reserva",
};

const SECCION_CONFIG: Record<EstadoSemaforo, { titulo: string; headerBg: string; borderColor: string }> = {
  paro:  { titulo: "Paro Total",   headerBg: "bg-[#991B1B]",   borderColor: "border-[#FECACA]" },
  rojo:  { titulo: "Crítico",      headerBg: "bg-[#B91C1C]",   borderColor: "border-[#FECACA]" },
  ambar: { titulo: "Advertencia",  headerBg: "bg-[#B45309]",   borderColor: "border-[#FDE68A]" },
  verde: { titulo: "OK",           headerBg: "bg-[#15803D]",   borderColor: "border-[#BBF7D0]" },
};

function AlertaRow({ alerta }: { alerta: Alerta }) {
  return (
    <Link
      href={`/flota/${alerta.equipoId}`}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F4F4F5] transition-colors duration-150 min-h-[52px] group"
    >
      <SemaforoDot estado={alerta.estado} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-[13px] text-[#09090B]">{alerta.equipoId}</span>
          <span className="text-[11px] text-[#71717A]">{alerta.modelo}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#F4F4F5] text-[#71717A] font-mono">
            {alerta.tipoFlota}
          </span>
        </div>
        <p className="text-[12px] text-[#71717A] mt-0.5 truncate">{alerta.mensaje}</p>
      </div>

      <div className="text-right shrink-0 ml-2">
        <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">
          {KPI_LABEL[alerta.kpi] ?? alerta.kpi}
        </p>
        <p className="font-mono font-bold text-[18px] text-[#09090B] leading-none mt-0.5">
          {alerta.valorActual === 0 ? "—" : alerta.valorActual}
        </p>
        {alerta.valorActual > 0 && (
          <p className="text-[10px] text-[#A1A1AA] mt-0.5">
            Umbral: <span className="text-[#71717A]">{alerta.umbralCritico}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

function SeccionAlertas({ estado, alertas }: { estado: EstadoSemaforo; alertas: Alerta[] }) {
  if (alertas.length === 0) return null;
  const cfg = SECCION_CONFIG[estado];

  return (
    <section>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-t-[10px] ${cfg.headerBg}`}>
        <SemaforoDot estado={estado} size="sm" />
        <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.1em]">{cfg.titulo}</span>
        <span className="ml-auto text-[10px] font-mono text-white/50">
          {alertas.length} alerta{alertas.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className={`flex flex-col divide-y divide-[#F4F4F5] rounded-b-[10px] border-x border-b ${cfg.borderColor} bg-white overflow-hidden`}>
        {alertas.map((a) => <AlertaRow key={a.id} alerta={a} />)}
      </div>
    </section>
  );
}

export default async function AlertasPage() {
  const alertas  = await getAlertas();
  const paros    = alertas.filter((a) => a.estado === "paro");
  const criticos = alertas.filter((a) => a.estado === "rojo");
  const ambar    = alertas.filter((a) => a.estado === "ambar");

  return (
    <div className="flex flex-col gap-5 max-w-[960px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle>Panel de Alertas</SectionTitle>
        <span className="text-[11px] font-mono text-[#A1A1AA]">
          {alertas.length} alertas · Actualizado ahora
        </span>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Paros Totales", valor: paros.length,    textColor: "text-[#991B1B]",   bg: "bg-[#FEF2F2] border-[#FECACA]", helpKey: "paroTotal",      shortTip: "Equipos completamente detenidos por falla mayor" },
          { label: "Críticos",      valor: criticos.length, textColor: "text-[#B91C1C]",   bg: "bg-[#FEF2F2] border-[#FECACA]", helpKey: "criticos",       shortTip: "Operan pero con KPIs en estado rojo" },
          { label: "Advertencias",  valor: ambar.length,    textColor: "text-[#B45309]", bg: "bg-[#FFFBEB] border-[#FDE68A]",   helpKey: "alertasActivas", shortTip: "Equipos con KPIs en zona de advertencia (ámbar)" },
        ].map((s) => (
          <Tooltip key={s.label} short={s.shortTip} help={HELP[s.helpKey]}>
            <div className={`flex flex-col gap-1 p-3.5 rounded-[10px] border ${s.bg}`}>
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">{s.label}</span>
              <span className={`text-[32px] font-mono font-bold leading-none ${s.textColor}`}>{s.valor}</span>
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Secciones */}
      <SeccionAlertas estado="paro"  alertas={paros} />
      <SeccionAlertas estado="rojo"  alertas={criticos} />
      <SeccionAlertas estado="ambar" alertas={ambar} />

      {alertas.length === 0 && (
        <div className="flex items-center justify-center h-40 rounded-[10px] bg-white border border-[#E4E4E7]">
          <p className="text-[13px] text-[#A1A1AA]">No hay alertas activas</p>
        </div>
      )}
    </div>
  );
}
