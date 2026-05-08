export const revalidate = 300;

import Link from "next/link";
import { AlertTriangle, BellRing, Info } from "lucide-react";
import { notFound } from "next/navigation";
import { getEquipoPorId } from "@/lib/db/queries/flota";
import { getHistoricoEquipo } from "@/lib/db/queries/historico";
import { getUmbralesActivos } from "@/lib/db/queries/umbrales";
import { getAlertas } from "@/lib/db/queries/alertas";
import { OBJETIVO_DFM, OBJETIVO_TMEF, OBJETIVO_TMPR, OBJETIVO_OP, OBJETIVO_RESERVA } from "@/lib/constants/umbrales";
import { EquipoHeader } from "@/components/equipo/EquipoHeader";
import { EquipoKpiPanel } from "@/components/equipo/EquipoKpiPanel";
import { EquipoAsarcoBar } from "@/components/equipo/EquipoAsarcoBar";
import { TendenciaSeisMeses } from "@/components/charts/lazy";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const KPI_HELP_KEY: Record<string, string> = {
  "Disponibilidad":      "dfm",
  "Tiempo entre Fallas": "tmef",
  "Tiempo de Reparación": "tmpr",
  "Tiempo Productivo":   "tiempoOperativo",
  "Reserva":             "reserva",
};

interface Props {
  params: { equipoId: string };
}

export default async function EquipoPage({ params }: Props) {
  const [equipoResult, umbralesActivos, todasAlertas, historicoResult] = await Promise.all([
    getEquipoPorId(params.equipoId.toUpperCase()),
    getUmbralesActivos(),
    getAlertas(),
    getHistoricoEquipo(params.equipoId.toUpperCase()),
  ]);
  const equipo = equipoResult;
  if (!equipo) notFound();

  const alertasEquipo = todasAlertas.filter((a) => a.equipoId === equipo.id);
  const historico = historicoResult;

  // Detectar si el equipo está marcado como "paro" solo por falta de datos (no por falla real)
  const SIN_DATOS_KPI = equipo.paroTotal && equipo.motivoParo === "Sin datos KPI para este período";

  // Objetivos KPI dinámicos desde BD con fallback a constantes
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

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      <EquipoHeader equipo={equipo} />

      {/* Banner: sin datos KPI — no es paro real */}
      {SIN_DATOS_KPI && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE]">
          <Info size={15} className="text-[#1D4ED8] shrink-0" />
          <p className="text-[13px] text-[#1E40AF] flex-1">
            <strong>Sin datos cargados para este período.</strong> El estado de paro es provisional — no indica falla real. Para actualizar, carga los KPIs desde{" "}
            <Link href="/admin/kpis" className="underline font-semibold hover:text-[#1D4ED8]">Admin → Carga de KPIs</Link>.
          </p>
        </div>
      )}

      {/* Alertas activas del equipo */}
      {alertasEquipo.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA]">
          <BellRing size={15} className="text-[#B91C1C] shrink-0" />
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[#991B1B]">
              {alertasEquipo.length} alerta{alertasEquipo.length > 1 ? "s" : ""} activa{alertasEquipo.length > 1 ? "s" : ""} para este equipo
            </p>
            <p className="text-[12px] text-[#B91C1C] mt-0.5">
              {alertasEquipo.map((a) => a.mensaje).join(" · ")}
            </p>
          </div>
          <Link
            href="/alertas"
            className="shrink-0 px-3 py-1.5 rounded-[6px] bg-[#B91C1C] hover:bg-[#991B1B] text-white text-[12px] font-semibold transition-colors"
          >
            Ver alertas
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Columna izquierda — KPIs + ASARCO + Datos */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <section>
            <SectionTitle className="mb-3">
              <Tooltip short="Indicadores clave de rendimiento de este equipo" help={HELP.kpiStripFlota}>
                KPIs del Equipo
              </Tooltip>
            </SectionTitle>
            <EquipoKpiPanel equipo={equipo} />
          </section>

          {/* Diagnóstico — explica POR QUÉ el equipo está en este estado */}
          {!equipo.paroTotal && equipo.semaforo.general !== "verde" && (() => {
            const problemas: { kpi: string; label: string; valor: number; objetivo: number; unidad: string; impacto: string; accion: string; gap: number }[] = [];

            if (equipo.semaforo.dfm !== "verde") {
              problemas.push({ kpi: "DFM", label: "Disponibilidad baja", valor: equipo.kpis.dfm, objetivo: OBJ_DFM, unidad: "%", gap: OBJ_DFM - equipo.kpis.dfm, impacto: `Disponible solo ${equipo.kpis.dfm}% del tiempo (meta: ${OBJ_DFM}%)`, accion: "Coordina con taller para reducir tiempos de detención no programada." });
            }
            if (equipo.semaforo.tmef !== "verde") {
              problemas.push({ kpi: "TMEF", label: "Fallas frecuentes", valor: equipo.kpis.tmef, objetivo: OBJ_TMEF, unidad: "h", gap: OBJ_TMEF - equipo.kpis.tmef, impacto: `Falla cada ${equipo.kpis.tmef}h promedio (meta: cada ${OBJ_TMEF}h)`, accion: "Solicita plan de mantenimiento preventivo al área de mantención." });
            }
            if (equipo.semaforo.tmpr !== "verde") {
              problemas.push({ kpi: "TMPR", label: "Reparaciones lentas", valor: equipo.kpis.tmpr, objetivo: OBJ_TMPR, unidad: "h", gap: equipo.kpis.tmpr - OBJ_TMPR, impacto: `Reparaciones toman ${equipo.kpis.tmpr}h promedio (meta: ${OBJ_TMPR}h)`, accion: "Verifica disponibilidad de repuestos y personal de taller." });
            }
            if (equipo.semaforo.tiempoOperativo !== "verde") {
              problemas.push({ kpi: "T.Op", label: "Baja utilización", valor: equipo.kpis.tiempoOperativo, objetivo: OBJ_OP, unidad: "%", gap: OBJ_OP - equipo.kpis.tiempoOperativo, impacto: `Operando ${equipo.kpis.tiempoOperativo}% del turno (meta: ${OBJ_OP}%)`, accion: "Revisa con operaciones la asignación de frentes y tareas." });
            }
            if (equipo.semaforo.reserva !== "verde") {
              problemas.push({ kpi: "Reserva", label: "Alta reserva", valor: equipo.kpis.reserva, objetivo: OBJ_RES, unidad: "%", gap: equipo.kpis.reserva - OBJ_RES, impacto: `Reserva en ${equipo.kpis.reserva}% (meta: máx. ${OBJ_RES}%)`, accion: "Coordina con planificación si sobra dotación o faltan frentes." });
            }

            problemas.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));

            return (
              <section>
                <SectionTitle className="mb-3">
                  <Tooltip short="Análisis causal: qué KPIs están fuera de meta y qué hacer" help={HELP.diagnosticoEquipo}>
                    Diagnóstico
                  </Tooltip>
                </SectionTitle>
                <div className="flex flex-col gap-2">
                  {problemas.map((p, i) => (
                    <div
                      key={p.kpi}
                      className={`flex flex-col gap-1.5 p-3 rounded-[10px] border ${
                        i === 0 ? "bg-[#FEF2F2] border-[#FECACA]" : "bg-[#FFFBEB] border-[#FDE68A]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={13} className={i === 0 ? "text-[#B91C1C]" : "text-[#B45309]"} />
                        <span className={`text-[13px] font-bold ${i === 0 ? "text-[#991B1B]" : "text-[#92400E]"}`}>
                          {i === 0 ? "Problema principal" : "También afecta"}: {p.label}
                        </span>
                        <span className="ml-auto font-mono text-[13px] font-bold text-[#09090B]">
                          {p.valor}{p.unidad}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#52525B] leading-relaxed">{p.impacto}</p>
                      <p className="text-[12px] text-[#B45309] leading-relaxed flex gap-1">
                        <span className="font-bold shrink-0">Acción:</span>
                        <span>{p.accion}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          <section>
            <SectionTitle className="mb-3">
              <Tooltip short="Cómo se distribuyó el tiempo del equipo en las 5 categorías ASARCO" help={HELP.distribucionAsarco}>
                Distribución ASARCO
              </Tooltip>
            </SectionTitle>
            <div className="p-4 rounded-xl bg-white border border-[#E4E4E7]">
              <EquipoAsarcoBar asarco={equipo.asarco} />
            </div>
          </section>

          {/* Detalles del equipo */}
          <section>
            <SectionTitle className="mb-3">
              <Tooltip short="Metadatos operacionales del equipo" help={HELP.columnaId}>
                Datos del Equipo
              </Tooltip>
            </SectionTitle>
            <div className="flex flex-col divide-y divide-[#F4F4F5] rounded-xl bg-white border border-[#E4E4E7] overflow-hidden">
              {[
                { label: "Modelo",              valor: equipo.modelo,                                                   helpKey: "modelo" },
                { label: "Tipo flota",           valor: equipo.tipoFlota,                                                helpKey: "tipoFlota" },
                { label: "Año fabricación",      valor: String(equipo.anio),                                             helpKey: "columnaAnio" },
                { label: "Horas acumuladas",     valor: `${(equipo.horasAcumuladas ?? 0).toLocaleString("es-CL")} h`,  helpKey: "equipoHoras" },
                { label: "Última actualización", valor: new Date(equipo.ultimaActualizacion).toLocaleDateString("es-CL") },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center px-4 py-2.5 text-sm">
                  {"helpKey" in item && item.helpKey ? (
                    <Tooltip short={HELP[item.helpKey]?.titulo ?? item.label} help={HELP[item.helpKey]}>
                      <span className="text-[#71717A] cursor-help">{item.label}</span>
                    </Tooltip>
                  ) : (
                    <span className="text-[#71717A]">{item.label}</span>
                  )}
                  <span className="font-medium text-[#09090B]">{item.valor}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Motivo de paro — solo cuando hay falla real, no cuando faltan datos */}
          {equipo.paroTotal && !SIN_DATOS_KPI && (
            <section>
              <SectionTitle className="mb-3">
                <Tooltip short="Razón por la cual el equipo está completamente detenido" help={HELP.paroTotal}>
                  Causa del Paro
                </Tooltip>
              </SectionTitle>
              <div className="px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                <p className="text-[13px] text-[#B91C1C] font-medium">
                  {equipo.motivoParo || "Sin motivo registrado — completa la información en Admin → Carga de KPIs."}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Columna derecha — Historial completo de KPIs */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <section>
            <SectionTitle className="mb-3">
              <Tooltip short="Evolución de KPIs a lo largo de todos los períodos registrados" help={HELP.historicoEquipo}>
                Historial de KPIs — {equipo.modelo}
              </Tooltip>
              {historico.length > 0 && (
                <span className="ml-2 text-[12px] font-normal text-[#A1A1AA]">
                  ({historico.length} período{historico.length !== 1 ? "s" : ""})
                </span>
              )}
            </SectionTitle>

            {historico.length > 0 ? (
              <TendenciaSeisMeses datos={historico} titulo={`${equipo.id} — todos los períodos`} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 h-[220px] rounded-[10px] bg-white border border-[#E4E4E7]">
                <p className="text-[13px] text-[#A1A1AA]">Sin datos históricos para este equipo</p>
                <p className="text-[11px] text-[#A1A1AA]">
                  Carga KPIs de al menos un período desde <Link href="/admin" className="text-[#B45309] hover:underline">Admin</Link> para ver la tendencia.
                </p>
              </div>
            )}
          </section>

          {/* Comparativa KPI actual vs objetivo */}
          <section>
            <SectionTitle className="mb-3">
              <Tooltip short="Qué tan cerca está cada KPI del objetivo definido" help={HELP.comparativaObjetivos}>
                Comparativa con Objetivos
              </Tooltip>
            </SectionTitle>
            <div className="rounded-xl bg-white border border-[#E4E4E7] overflow-hidden">
              {[
                { label: "Disponibilidad",       valor: equipo.kpis.dfm,             objetivo: OBJ_DFM,  unidad: "%",  invertido: false, estado: equipo.semaforo.dfm },
                { label: "Tiempo entre Fallas", valor: equipo.kpis.tmef,            objetivo: OBJ_TMEF, unidad: "h",  invertido: false, estado: equipo.semaforo.tmef },
                { label: "Tiempo de Reparación",valor: equipo.kpis.tmpr,            objetivo: OBJ_TMPR, unidad: "h",  invertido: true,  estado: equipo.semaforo.tmpr },
                { label: "Tiempo Productivo",   valor: equipo.kpis.tiempoOperativo, objetivo: OBJ_OP,   unidad: "%",  invertido: false, estado: equipo.semaforo.tiempoOperativo },
                { label: "Reserva",              valor: equipo.kpis.reserva,         objetivo: OBJ_RES,  unidad: "%",  invertido: true,  estado: equipo.semaforo.reserva },
              ].map((item) => {
                const color =
                  item.estado === "paro"  ? "#991B1B" :
                  item.estado === "rojo"  ? "#B91C1C" :
                  item.estado === "ambar" ? "#B45309" : "#15803D";
                const pct = item.invertido
                  ? Math.min((item.objetivo / Math.max(item.valor, 0.01)) * 100, 100)
                  : Math.min((item.valor / item.objetivo) * 100, 100);
                const helpKey = KPI_HELP_KEY[item.label] ?? "dfm";

                return (
                  <div key={item.label} className="px-4 py-3 border-b border-[#F4F4F5] last:border-b-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <Tooltip short={HELP[helpKey]?.titulo ?? item.label} help={HELP[helpKey]}>
                        <span className="text-[12px] text-[#71717A] cursor-help">{item.label}</span>
                      </Tooltip>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#A1A1AA]">Obj: {item.objetivo}{item.unidad}</span>
                        <span className="font-mono font-bold text-[14px]" style={{ color }}>
                          {item.valor}{item.unidad}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F4F4F5] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
