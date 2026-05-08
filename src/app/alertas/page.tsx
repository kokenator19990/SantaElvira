import type { Metadata } from "next";
export const metadata: Metadata = { title: "Alertas" };
export const revalidate = 0; // siempre fresco — las alertas cambian con frecuencia

import { getAlertas, getAlertasResueltas } from "@/lib/db/queries/alertas";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { SectionTitle } from "@/components/ui/SectionTitle";
import Link from "next/link";
import { CheckCircle2, History } from "lucide-react";
import type { Alerta, EstadoSemaforo } from "@/lib/domain/tipos";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import { ResolverTodasButton } from "./ResolverTodasButton";
import { AlertaRowClient } from "./AlertaRowClient";
import { ReabrirButton } from "./ReabrirButton";

const KPI_LABEL: Record<string, string> = {
  dfm:             "Disponibilidad",
  tmef:            "Tiempo entre Fallas",
  tmpr:            "Tiempo de Reparación",
  tiempoOperativo: "Tiempo Productivo",
  reserva:         "Reserva",
  apd:             "Análisis de Aceite",
};

const KPI_UNIDAD: Record<string, string> = {
  dfm: "%", tmef: "h", tmpr: "h", tiempoOperativo: "%", reserva: "%", apd: "",
};

const SECCION_CONFIG: Record<EstadoSemaforo, { titulo: string; headerBg: string; borderColor: string }> = {
  paro:  { titulo: "Paro Total",   headerBg: "bg-[#991B1B]",   borderColor: "border-[#FECACA]" },
  rojo:  { titulo: "Crítico",      headerBg: "bg-[#B91C1C]",   borderColor: "border-[#FECACA]" },
  ambar: { titulo: "Advertencia",  headerBg: "bg-[#B45309]",   borderColor: "border-[#FDE68A]" },
  verde: { titulo: "OK",           headerBg: "bg-[#15803D]",   borderColor: "border-[#BBF7D0]" },
};

function SeccionAlertas({ estado, alertas }: { estado: EstadoSemaforo; alertas: Alerta[] }) {
  if (alertas.length === 0) return null;
  const cfg = SECCION_CONFIG[estado];

  return (
    <section>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-t-[10px] ${cfg.headerBg}`}>
        <SemaforoDot estado={estado} size="sm" />
        <span className="text-[12px] font-bold text-white/90 uppercase tracking-[0.1em]">{cfg.titulo}</span>
        <span className="ml-auto text-[11px] font-mono text-white/50">
          {alertas.length} alerta{alertas.length !== 1 ? "s" : ""}
        </span>
        {estado !== "verde" && (
          <ResolverTodasButton
            estado={estado as "paro" | "rojo" | "ambar"}
            cantidad={alertas.length}
            tituloSeccion={cfg.titulo}
          />
        )}
      </div>
      <div className={`flex flex-col rounded-b-[10px] border-x border-b ${cfg.borderColor} bg-white overflow-hidden`}>
        {alertas.map((a) => <AlertaRowClient key={a.id} alerta={a} />)}
      </div>
    </section>
  );
}

function HistorialResueltas({ resueltas }: { resueltas: Alerta[] }) {
  if (resueltas.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <History size={15} className="text-[#71717A]" />
        <SectionTitle>
          <Tooltip short="Registro de alertas resueltas — incluye la acción tomada y quién la resolvió">
            Historial de Resolución
          </Tooltip>
        </SectionTitle>
        <span className="text-[11px] text-[#A1A1AA] ml-auto">Últimas {resueltas.length}</span>
      </div>
      <p className="text-[11px] text-[#71717A] mb-3 leading-relaxed">
        Alertas resueltas con su acción registrada. Si una resolución fue un error, usa <strong>Reabrir</strong> para devolver la alerta al panel activo.
        {resueltas.length >= 50 && (
          <span className="text-[#A1A1AA] ml-1">(mostrando las últimas 50)</span>
        )}
      </p>
      <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
        {resueltas.map((a) => (
          <div key={a.id} className="flex items-start gap-3 px-4 py-3 border-t border-[#F4F4F5] first:border-t-0">
            <CheckCircle2 size={14} className="text-[#15803D] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={a.kpi === "apd" ? "/apd" : `/flota/${a.equipoId}`}
                  className="font-mono font-bold text-[13px] text-[#52525B] hover:text-[#09090B] hover:underline"
                >
                  {a.equipoId}
                </Link>
                <span className="text-[11px] text-[#A1A1AA]">{a.modelo}</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#F4F4F5] text-[#A1A1AA] font-mono">
                  {KPI_LABEL[a.kpi] ?? a.kpi}
                </span>
                <span className="text-[11px] font-mono text-[#71717A]">
                  {a.valorActual}{KPI_UNIDAD[a.kpi] ?? ""}
                </span>
              </div>
              <p className="text-[12px] text-[#A1A1AA] mt-0.5 truncate">{a.mensaje}</p>
              {a.accionTomada && (
                <p className="text-[12px] text-[#52525B] mt-1.5 bg-[#F4F4F5] px-2.5 py-1.5 rounded-[6px] inline-block">
                  <span className="font-semibold text-[#71717A]">Acción: </span>{a.accionTomada}
                </p>
              )}
            </div>
            <div className="text-right shrink-0 flex flex-col items-end gap-1">
              {a.resueltaPor && (
                <p className="text-[11px] text-[#A1A1AA]">{a.resueltaPor}</p>
              )}
              {a.resueltaEn && (
                <p className="text-[11px] text-[#A1A1AA] font-mono">
                  {new Date(a.resueltaEn).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                </p>
              )}
              <ReabrirButton
                alertaId={a.id}
                equipoId={a.equipoId}
                kpiLabel={KPI_LABEL[a.kpi] ?? a.kpi}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function AlertasPage() {
  const [alertas, resueltas] = await Promise.all([
    getAlertas(),
    getAlertasResueltas(),
  ]);

  const paros    = alertas.filter((a) => a.estado === "paro");
  const criticos = alertas.filter((a) => a.estado === "rojo");
  const ambar    = alertas.filter((a) => a.estado === "ambar");

  return (
    <div className="flex flex-col gap-5 max-w-[960px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle>
          <Tooltip short="Panel que consolida todas las alertas activas de equipos en la flota" help={HELP.alertasActivas}>
            Panel de Alertas
          </Tooltip>
        </SectionTitle>
        <span className="text-[12px] font-mono text-[#A1A1AA]">
          {alertas.length} alerta{alertas.length !== 1 ? "s" : ""} · Período actual
        </span>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Paros Totales", valor: paros.length,    textColor: "text-[#991B1B]",   bg: "bg-[#FEF2F2] border-[#FECACA]", helpKey: "paroTotal",      shortTip: "Equipos completamente detenidos por falla mayor" },
          { label: "Críticos",      valor: criticos.length, textColor: "text-[#B91C1C]",   bg: "bg-[#FEF2F2] border-[#FECACA]", helpKey: "criticos",       shortTip: "Operan pero con KPIs en estado rojo" },
          { label: "Advertencias",  valor: ambar.length,    textColor: "text-[#B45309]",   bg: "bg-[#FFFBEB] border-[#FDE68A]", helpKey: "alertasActivas", shortTip: "Equipos con KPIs en zona de advertencia (ámbar)" },
        ].map((s) => (
          <Tooltip key={s.label} short={s.shortTip} help={HELP[s.helpKey]}>
            <div className={`flex flex-col gap-1 p-3.5 rounded-[10px] border ${s.bg}`}>
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-[0.1em]">{s.label}</span>
              <span className={`text-[36px] font-mono font-bold leading-none ${s.textColor}`}>{s.valor}</span>
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Secciones */}
      <SeccionAlertas estado="paro"  alertas={paros} />
      <SeccionAlertas estado="rojo"  alertas={criticos} />
      <SeccionAlertas estado="ambar" alertas={ambar} />

      {alertas.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 h-48 rounded-[10px] bg-white border border-[#E4E4E7]">
          <CheckCircle2 size={32} className="text-[#15803D]" />
          <p className="text-[15px] text-[#A1A1AA]">No hay alertas activas</p>
          <p className="text-[12px] text-[#71717A]">Todos los equipos están dentro de parámetros</p>
        </div>
      )}

      {/* Historial de resueltas */}
      <HistorialResueltas resueltas={resueltas} />
    </div>
  );
}
