"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { DataTable, type ColumnaDef } from "@/components/ui/DataTable";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import { exportarCsv } from "@/lib/utils/export-csv";
import type { Equipo, TipoFlota } from "@/lib/domain/tipos";
import { clsx } from "clsx";

const TIPOS_VALIDOS = ["785D", "777F", "992", "PC2000"] as const;

function FlotaContent({ flota }: { flota: Equipo[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const TABS: { id: TipoFlota | "todos"; label: string; count: number; helpKey?: string }[] = [
    { id: "todos",  label: "Todos",   count: flota.length },
    { id: "785D",   label: "785D",    count: flota.filter((e) => e.tipoFlota === "785D").length,   helpKey: "flotaTipo785D" },
    { id: "777F",   label: "777F",    count: flota.filter((e) => e.tipoFlota === "777F").length,   helpKey: "flotaTipo777F" },
    { id: "992",    label: "992",     count: flota.filter((e) => e.tipoFlota === "992").length,    helpKey: "flotaTipo992" },
    { id: "PC2000", label: "PC-2000", count: flota.filter((e) => e.tipoFlota === "PC2000").length, helpKey: "flotaTipoPC2000" },
  ];

  const tipoParam = searchParams.get("tipo");
  const [tabActivo, setTabActivo] = useState<TipoFlota | "todos">(() => {
    if (tipoParam && (TIPOS_VALIDOS as readonly string[]).includes(tipoParam)) {
      return tipoParam as TipoFlota;
    }
    return "todos";
  });

  const filtradosSinOrden = tabActivo === "todos" ? flota : flota.filter((e) => e.tipoFlota === tabActivo);

  // Ordenar por criticidad: paros primero, luego rojos, ámbar, verdes
  const CRITICIDAD: Record<string, number> = { paro: 0, rojo: 1, ambar: 2, verde: 3 };
  const filtrados = [...filtradosSinOrden].sort((a, b) => {
    const ca = a.paroTotal ? 0 : (CRITICIDAD[a.semaforo.general] ?? 3);
    const cb = b.paroTotal ? 0 : (CRITICIDAD[b.semaforo.general] ?? 3);
    return ca - cb;
  });

  const stats = {
    total:    filtrados.length,
    ok:       filtrados.filter((e) => e.semaforo.general === "verde").length,
    criticos: filtrados.filter((e) => ["ambar", "rojo"].includes(e.semaforo.general)).length,
    paros:    filtrados.filter((e) => e.paroTotal).length,
  };

  function exportarFlota() {
    const label = tabActivo === "todos" ? "Todos" : tabActivo;
    exportarCsv(filtrados, [
      { header: "ID",          value: (e) => e.id },
      { header: "Modelo",      value: (e) => e.modelo },
      { header: "Tipo Flota",  value: (e) => e.tipoFlota },
      { header: "Año",         value: (e) => e.anio },
      { header: "Estado",      value: (e) => e.paroTotal ? "PARO" : e.semaforo.general.toUpperCase() },
      { header: "DFM %",       value: (e) => e.kpis.dfm },
      { header: "TMEF h",      value: (e) => e.kpis.tmef },
      { header: "TMPR h",      value: (e) => e.kpis.tmpr },
      { header: "T.Operativo %", value: (e) => e.kpis.tiempoOperativo },
      { header: "Reserva %",   value: (e) => e.kpis.reserva },
      { header: "Horas Acum.", value: (e) => e.horasAcumuladas },
      { header: "ASARCO Op %",       value: (e) => e.asarco.operativo },
      { header: "ASARCO Res %",      value: (e) => e.asarco.reserva },
      { header: "ASARCO Det.Prog %", value: (e) => e.asarco.detencionProgramada },
      { header: "ASARCO Det.NoProg %", value: (e) => e.asarco.detencionNoProgramada },
      { header: "ASARCO Pérdida %",  value: (e) => e.asarco.perdidaOperacional },
      { header: "Motivo Paro", value: (e) => e.motivoParo ?? "" },
    ], `MSG_Flota_${label}_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  const columnas: ColumnaDef<Equipo>[] = [
    {
      key: "id",
      header: "ID",
      helpKey: "columnaId",
      render: (e) => (
        <span className="font-mono font-bold text-[#09090B] text-[15px]">{e.id}</span>
      ),
    },
    {
      key: "modelo",
      header: "Modelo",
      render: (e) => <span className="text-[#71717A]">{e.modelo}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      render: (e) => (
        <div className="flex items-center gap-2">
          <SemaforoDot estado={e.semaforo.general} size="md" />
          <StatusBadge estado={e.semaforo.general} />
        </div>
      ),
    },
    {
      key: "dfm",
      header: "Dfm",
      helpKey: "dfm",
      headerClassName: "text-right",
      render: (e) => (
        <span className={clsx("font-mono font-bold text-[15px]", e.paroTotal && "text-[#B91C1C]")}>
          {e.paroTotal ? "—" : `${e.kpis.dfm}%`}
        </span>
      ),
      className: "text-right",
    },
    {
      key: "tmef",
      header: "TMEF",
      helpKey: "tmef",
      headerClassName: "text-right",
      render: (e) => (
        <span className="font-mono text-[13px]">{e.paroTotal ? "—" : `${e.kpis.tmef}h`}</span>
      ),
      className: "text-right",
    },
    {
      key: "tmpr",
      header: "TMPR",
      helpKey: "tmpr",
      headerClassName: "text-right",
      render: (e) => (
        <span className="font-mono text-[13px]">{e.paroTotal ? "—" : `${e.kpis.tmpr}h`}</span>
      ),
      className: "text-right",
    },
    {
      key: "top",
      header: "T.Op.",
      helpKey: "tiempoOperativo",
      headerClassName: "text-right",
      render: (e) => (
        <span className="font-mono text-[13px]">{e.paroTotal ? "—" : `${e.kpis.tiempoOperativo}%`}</span>
      ),
      className: "text-right",
    },
    {
      key: "anio",
      header: "Año",
      helpKey: "columnaAnio",
      render: (e) => <span className="text-[#71717A] text-[13px]">{e.anio}</span>,
    },
    {
      key: "horas",
      header: "Horas",
      helpKey: "equipoHoras",
      headerClassName: "text-right",
      render: (e) => (
        <span className="font-mono text-[12px] text-[#71717A]">
          {e.horasAcumuladas.toLocaleString("es-CL")}
        </span>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle>
          <Tooltip short="Tabla completa de todos los equipos con sus KPIs y estado" help={HELP.navFlota}>
            Flota Completa
          </Tooltip>
        </SectionTitle>
        <button
          onClick={exportarFlota}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-semibold text-[#52525B] transition-colors"
          title="Descargar tabla como CSV (compatible con Excel)"
        >
          <Download size={13} />
          Exportar Excel
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5" role="tablist" aria-label="Filtro por tipo de flota">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tabActivo === tab.id}
            onClick={() => setTabActivo(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-3.5 py-2 rounded-[7px] text-[13px] font-semibold",
              "whitespace-nowrap min-h-[36px] transition-all duration-150 border",
              tabActivo === tab.id
                ? "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
                : "text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] border-[#E4E4E7]"
            )}
          >
            {tab.helpKey ? (
              <Tooltip short={HELP[tab.helpKey]?.titulo ?? tab.label} help={HELP[tab.helpKey]}>
                <span className="cursor-help">{tab.label}</span>
              </Tooltip>
            ) : (
              tab.label
            )}
            <span className={clsx(
              "text-[11px] font-mono px-1 py-0.5 rounded-[3px]",
              tabActivo === tab.id ? "bg-[#FDE68A]/50 text-[#92400E]" : "bg-[#F4F4F5] text-[#A1A1AA]"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",            valor: stats.total,    color: "#09090B", bg: "bg-white",                        helpKey: "totalEquipos" },
          { label: "Operativos",       valor: stats.ok,       color: "#15803D", bg: "bg-white",                        helpKey: "operativos" },
          { label: "Advert./Críticos", valor: stats.criticos, color: "#B45309", bg: "bg-white",                        helpKey: "advertCriticos" },
          { label: "Paro Total",       valor: stats.paros,    color: "#B91C1C", bg: "bg-[#FEF2F2] border-[#FECACA]",  helpKey: "paroTotal" },
        ].map((s) => (
          <div key={s.label} className={clsx("flex flex-col gap-0.5 p-3.5 rounded-[9px] border border-[#E4E4E7]", s.bg)}>
            <Tooltip short={HELP[s.helpKey]?.titulo ?? s.label} help={HELP[s.helpKey]}>
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-[0.1em] cursor-help">{s.label}</span>
            </Tooltip>
            <span className="text-[31px] font-mono font-bold leading-tight" style={{ color: s.color }}>
              {s.valor}
            </span>
          </div>
        ))}
      </div>

      <DataTable
        columnas={columnas}
        datos={filtrados}
        keyExtractor={(e) => e.id}
        onRowClick={(e) => router.push(`/flota/${e.id}`)}
        rowClassName={(e) => {
          if (e.paroTotal) return "border-l-[3px] border-l-[#991B1B] !bg-[#FEF2F2]";
          if (e.semaforo.general === "rojo")  return "border-l-[3px] border-l-[#B91C1C]";
          if (e.semaforo.general === "ambar") return "border-l-[3px] border-l-[#B45309]";
          return "border-l-[3px] border-l-[#BBF7D0]";
        }}
      />

      <p className="text-[11px] text-[#A1A1AA] text-right font-mono">
        {filtrados.length} equipos · Haz clic en una fila para ver el detalle
      </p>
    </div>
  );
}

export function FlotaClientView({ flota }: { flota: Equipo[] }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FlotaContent flota={flota} />
    </Suspense>
  );
}
