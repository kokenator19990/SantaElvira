"use client";

import { useState, useMemo } from "react";
import { Table2, ClipboardList, Wrench, Download, Search, ChevronUp, ChevronDown, ArrowUpDown, Info, Sun, Moon } from "lucide-react";
import { clsx } from "clsx";
import { exportarCsv } from "@/lib/utils/export-csv";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import type { KpiRow, RegistroRow, FallaRow } from "@/lib/db/queries/explorador";
import type { ComparativaTurno } from "@/lib/db/queries/turnos";

type Tab = "kpis" | "registros" | "fallas" | "turnos";
type SortDir = "asc" | "desc";

/* ─── Sorting genérico ──────────────────────────────────────────────────────── */

function sortData<T>(data: T[], key: keyof T, dir: SortDir): T[] {
  return [...data].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    let cmp: number;
    if (typeof va === "string") cmp = va.localeCompare(vb as string);
    else if (typeof va === "boolean") cmp = (va ? 1 : 0) - ((vb as boolean) ? 1 : 0);
    else cmp = (va as number) - (vb as number);
    return dir === "asc" ? cmp : -cmp;
  });
}

function SortTh<T>({ label, sortKey, current, onSort, className, helpKey }: {
  label: string;
  sortKey: keyof T;
  current: { key: keyof T; dir: SortDir };
  onSort: (key: keyof T) => void;
  className?: string;
  helpKey?: string;
}) {
  const active = current.key === sortKey;
  const inner = (
    <div className="flex items-center gap-1">
      {label}
      {active
        ? current.dir === "asc"
          ? <ChevronUp size={11} className="text-[#B45309]" />
          : <ChevronDown size={11} className="text-[#B45309]" />
        : <ArrowUpDown size={9} className="opacity-25" />
      }
    </div>
  );
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={clsx(
        "px-2 py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none",
        "hover:bg-[#F0F0F0] transition-colors whitespace-nowrap",
        className
      )}
    >
      {helpKey && HELP[helpKey] ? (
        <Tooltip short={HELP[helpKey].titulo} help={HELP[helpKey]}>
          <span className="cursor-help">{inner}</span>
        </Tooltip>
      ) : (
        inner
      )}
    </th>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function uniqueValues<T>(data: T[], key: keyof T): string[] {
  return Array.from(new Set(data.map((d) => String(d[key])))).sort();
}

function avg(arr: number[]): string {
  if (arr.length === 0) return "—";
  return (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1);
}

function sum(arr: number[]): string {
  return arr.reduce((s, v) => s + v, 0).toFixed(1);
}

const NUM_CELL = "text-right font-mono tabular-nums text-[12px]";
const TH_NUM = "text-right";

/* ─── Componente principal ──────────────────────────────────────────────────── */

interface Props {
  kpis: KpiRow[];
  registros: RegistroRow[];
  fallas: FallaRow[];
  turnos?: ComparativaTurno[];
}

export function ExploradorClient({ kpis, registros, fallas, turnos = [] }: Props) {
  const [tab, setTab] = useState<Tab>("kpis");
  const [busqueda, setBusqueda] = useState("");

  /* Filtros KPIs */
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [filtroFlota, setFiltroFlota] = useState("todos");
  const [sortKpi, setSortKpi] = useState<{ key: keyof KpiRow; dir: SortDir }>({ key: "periodoLabel", dir: "desc" });

  /* Filtros Registros */
  const [filtroFlotaReg, setFiltroFlotaReg] = useState("todos");
  const [sortReg, setSortReg] = useState<{ key: keyof RegistroRow; dir: SortDir }>({ key: "fecha", dir: "desc" });

  /* Filtros Fallas */
  const [filtroComponente, setFiltroComponente] = useState("todos");
  const [filtroFlotaFal, setFiltroFlotaFal] = useState("todos");
  const [sortFal, setSortFal] = useState<{ key: keyof FallaRow; dir: SortDir }>({ key: "fecha", dir: "desc" });

  /* Listas para filtros */
  const periodos = uniqueValues(kpis, "periodoLabel");
  const flotasKpi = uniqueValues(kpis, "tipoFlota");
  const flotasReg = uniqueValues(registros, "tipoFlota");
  const flotasFal = uniqueValues(fallas, "tipoFlota");
  const componentes = uniqueValues(fallas, "componente");

  /* Datos filtrados + ordenados */
  const kpisFiltrados = useMemo(() => {
    let d = kpis;
    if (filtroPeriodo !== "todos") d = d.filter((r) => r.periodoLabel === filtroPeriodo);
    if (filtroFlota !== "todos") d = d.filter((r) => r.tipoFlota === filtroFlota);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      d = d.filter((r) => r.equipoId.toLowerCase().includes(q) || r.modelo.toLowerCase().includes(q));
    }
    return sortData(d, sortKpi.key, sortKpi.dir);
  }, [kpis, filtroPeriodo, filtroFlota, busqueda, sortKpi]);

  const registrosFiltrados = useMemo(() => {
    let d = registros;
    if (filtroFlotaReg !== "todos") d = d.filter((r) => r.tipoFlota === filtroFlotaReg);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      d = d.filter((r) => r.equipoId.toLowerCase().includes(q) || r.modelo.toLowerCase().includes(q));
    }
    return sortData(d, sortReg.key, sortReg.dir);
  }, [registros, filtroFlotaReg, busqueda, sortReg]);

  const fallasFiltradas = useMemo(() => {
    let d = fallas;
    if (filtroComponente !== "todos") d = d.filter((r) => r.componente === filtroComponente);
    if (filtroFlotaFal !== "todos") d = d.filter((r) => r.tipoFlota === filtroFlotaFal);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      d = d.filter((r) => r.equipoId.toLowerCase().includes(q) || r.descripcion.toLowerCase().includes(q));
    }
    return sortData(d, sortFal.key, sortFal.dir);
  }, [fallas, filtroComponente, filtroFlotaFal, busqueda, sortFal]);

  function toggleSortKpi(key: keyof KpiRow) {
    setSortKpi((p) => ({ key, dir: p.key === key && p.dir === "desc" ? "asc" : "desc" }));
  }
  function toggleSortReg(key: keyof RegistroRow) {
    setSortReg((p) => ({ key, dir: p.key === key && p.dir === "desc" ? "asc" : "desc" }));
  }
  function toggleSortFal(key: keyof FallaRow) {
    setSortFal((p) => ({ key, dir: p.key === key && p.dir === "desc" ? "asc" : "desc" }));
  }

  /* Export */
  function exportarKpis() {
    exportarCsv(kpisFiltrados, [
      { header: "Período",              value: (r) => r.periodoLabel },
      { header: "Equipo",               value: (r) => r.equipoId },
      { header: "Modelo",               value: (r) => r.modelo },
      { header: "Tipo Flota",           value: (r) => r.tipoFlota },
      { header: "DFM %",                value: (r) => r.dfm },
      { header: "TMEF h",               value: (r) => r.tmef },
      { header: "TMPR h",               value: (r) => r.tmpr },
      { header: "T.Operativo %",        value: (r) => r.tiempoOperativo },
      { header: "Reserva %",            value: (r) => r.reserva },
      { header: "Horas Acum.",          value: (r) => r.horasAcumuladas },
      { header: "Paro Total",           value: (r) => r.paroTotal ? "SÍ" : "NO" },
      { header: "Motivo Paro",          value: (r) => r.motivoParo },
      { header: "ASARCO Op %",          value: (r) => r.pctOperativo },
      { header: "ASARCO Res %",         value: (r) => r.pctReserva },
      { header: "ASARCO Det.Prog %",    value: (r) => r.pctDetProgramada },
      { header: "ASARCO Det.NoProg %",  value: (r) => r.pctDetNoProg },
      { header: "ASARCO Pérdida %",     value: (r) => r.pctPerdidaOp },
    ], `MSG_KPIs_Explorador.csv`);
  }

  function exportarRegistros() {
    exportarCsv(registrosFiltrados, [
      { header: "Fecha",         value: (r) => r.fecha },
      { header: "Equipo",        value: (r) => r.equipoId },
      { header: "Modelo",        value: (r) => r.modelo },
      { header: "Tipo Flota",    value: (r) => r.tipoFlota },
      { header: "Turno",         value: (r) => r.turno },
      { header: "Operación h",   value: (r) => r.hrsOperacion },
      { header: "Reserva h",     value: (r) => r.hrsReserva },
      { header: "Det.Prog h",    value: (r) => r.hrsDetProgramada },
      { header: "Det.NoProg h",  value: (r) => r.hrsDetNoProgramada },
      { header: "Pérdida Op h",  value: (r) => r.hrsPerdidaOp },
      { header: "Total h",       value: (r) => r.hrsOperacion + r.hrsReserva + r.hrsDetProgramada + r.hrsDetNoProgramada + r.hrsPerdidaOp },
      { header: "Observaciones", value: (r) => r.observaciones },
    ], `MSG_Registros_Explorador.csv`);
  }

  function exportarFallas() {
    exportarCsv(fallasFiltradas, [
      { header: "Fecha",           value: (r) => r.fecha },
      { header: "Equipo",          value: (r) => r.equipoId },
      { header: "Modelo",          value: (r) => r.modelo },
      { header: "Tipo Flota",      value: (r) => r.tipoFlota },
      { header: "Componente",      value: (r) => r.componente },
      { header: "Descripción",     value: (r) => r.descripcion },
      { header: "Hrs Reparación",  value: (r) => r.hrsReparacion },
      { header: "Resuelta",        value: (r) => r.resuelta ? "Sí" : "No" },
    ], `MSG_Fallas_Explorador.csv`);
  }

  function exportarTurnos() {
    exportarCsv(turnos, [
      { header: "Turno",              value: (r) => r.turno },
      { header: "Equipos",            value: (r) => r.equipos },
      { header: "Registros",          value: (r) => r.registros },
      { header: "Hrs Operación",      value: (r) => r.hrsOperacion },
      { header: "Hrs Reserva",        value: (r) => r.hrsReserva },
      { header: "Hrs Det.Prog",       value: (r) => r.hrsDetProgramada },
      { header: "Hrs Det.NoProg",     value: (r) => r.hrsDetNoProgramada },
      { header: "Hrs Pérdida Op",     value: (r) => r.hrsPerdidaOp },
      { header: "% Operativo",        value: (r) => r.pctOperativo },
      { header: "% Reserva",          value: (r) => r.pctReserva },
      { header: "% Det.NoProg",       value: (r) => r.pctDetNoProg },
    ], `MSG_Turnos_Explorador.csv`);
  }

  const counts: Record<Tab, number> = { kpis: kpisFiltrados.length, registros: registrosFiltrados.length, fallas: fallasFiltradas.length, turnos: turnos.length };

  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <SectionTitle>
        <Tooltip short="Vista interactiva tipo planilla de todos los datos" help={HELP.navExplorador}>
          Explorador de Datos
        </Tooltip>
      </SectionTitle>

      <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE]">
        <Info size={14} className="text-[#1D4ED8] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#1E40AF]">
          Explora todos los datos como en una planilla: ordena por cualquier columna, filtra por tipo de flota o período,
          busca por equipo, y exporta a Excel lo que necesites. Reemplaza la necesidad de abrir la planilla original.
        </p>
      </div>

      {/* Toolbar: tabs + búsqueda + export */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-[10px] bg-[#F4F4F5] border border-[#E4E4E7]">
          {([
            { id: "kpis" as const,      label: "KPIs",     icon: Table2,        count: kpis.length,      helpKey: "explorerKpis" },
            { id: "registros" as const, label: "Registros", icon: ClipboardList, count: registros.length, helpKey: "explorerRegistros" },
            { id: "fallas" as const,    label: "Fallas",    icon: Wrench,        count: fallas.length,    helpKey: "explorerFallas" },
            ...(turnos.length > 0 ? [{ id: "turnos" as const, label: "Turnos", icon: Sun, count: turnos.length, helpKey: "explorerTurnos" }] : []),
          ]).map(({ id, label, icon: Icon, count, helpKey }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all",
                tab === id
                  ? "bg-white text-[#09090B] shadow-sm"
                  : "text-[#71717A] hover:text-[#09090B]"
              )}
            >
              <Icon size={13} strokeWidth={tab === id ? 2.2 : 1.7} />
              <Tooltip short={HELP[helpKey]?.titulo ?? label} help={HELP[helpKey]}>
                <span className="cursor-help">{label}</span>
              </Tooltip>
              <span className={clsx(
                "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
                tab === id ? "bg-[#F4F4F5] text-[#52525B]" : "bg-transparent text-[#A1A1AA]"
              )}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar equipo..."
            className="pl-8 pr-3 py-1.5 rounded-[7px] border border-[#E4E4E7] text-[13px] w-[180px] focus:outline-none focus:border-[#B45309]"
          />
        </div>

        {/* Filtros por tab */}
        {tab === "kpis" && (
          <>
            <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="px-2.5 py-1.5 rounded-[7px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]">
              <option value="todos">Todos los períodos</option>
              {periodos.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filtroFlota} onChange={(e) => setFiltroFlota(e.target.value)}
              className="px-2.5 py-1.5 rounded-[7px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]">
              <option value="todos">Todas las flotas</option>
              {flotasKpi.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </>
        )}
        {tab === "registros" && (
          <select value={filtroFlotaReg} onChange={(e) => setFiltroFlotaReg(e.target.value)}
            className="px-2.5 py-1.5 rounded-[7px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]">
            <option value="todos">Todas las flotas</option>
            {flotasReg.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        )}
        {tab === "fallas" && (
          <>
            <select value={filtroComponente} onChange={(e) => setFiltroComponente(e.target.value)}
              className="px-2.5 py-1.5 rounded-[7px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]">
              <option value="todos">Todos los componentes</option>
              {componentes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filtroFlotaFal} onChange={(e) => setFiltroFlotaFal(e.target.value)}
              className="px-2.5 py-1.5 rounded-[7px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]">
              <option value="todos">Todas las flotas</option>
              {flotasFal.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </>
        )}

        {/* Export */}
        <button
          onClick={tab === "kpis" ? exportarKpis : tab === "registros" ? exportarRegistros : tab === "fallas" ? exportarFallas : exportarTurnos}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-semibold text-[#52525B] transition-colors"
        >
          <Download size={12} /> Exportar Excel
        </button>
      </div>

      {/* Contador de filas filtradas */}
      <div className="text-[12px] text-[#71717A]">
        {counts[tab]} fila{counts[tab] !== 1 ? "s" : ""}
        {busqueda && ` · filtradas por "${busqueda}"`}
      </div>

      {/* ─── Tabla KPIs ──────────────────────────────────────────────────────── */}
      {tab === "kpis" && (
        <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
          <table className="w-full text-[12px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA]">
                <SortTh<KpiRow> label="Período" sortKey="periodoLabel" current={sortKpi} onSort={toggleSortKpi} className="text-left text-[#A1A1AA] sticky left-0 bg-[#FAFAFA] min-w-[110px]" />
                <SortTh<KpiRow> label="Equipo" sortKey="equipoId" current={sortKpi} onSort={toggleSortKpi} className="text-left text-[#A1A1AA] min-w-[70px]" />
                <SortTh<KpiRow> label="Modelo" sortKey="modelo" current={sortKpi} onSort={toggleSortKpi} className="text-left text-[#A1A1AA]" />
                <SortTh<KpiRow> label="Flota" sortKey="tipoFlota" current={sortKpi} onSort={toggleSortKpi} className="text-left text-[#A1A1AA]" />
                <SortTh<KpiRow> label="DFM %" sortKey="dfm" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#15803D]")} helpKey="dfm" />
                <SortTh<KpiRow> label="TMEF h" sortKey="tmef" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#1D4ED8]")} helpKey="tmef" />
                <SortTh<KpiRow> label="TMPR h" sortKey="tmpr" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#B91C1C]")} helpKey="tmpr" />
                <SortTh<KpiRow> label="T.Op %" sortKey="tiempoOperativo" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#71717A]")} helpKey="tiempoOperativo" />
                <SortTh<KpiRow> label="Reserva %" sortKey="reserva" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#71717A]")} helpKey="reserva" />
                <SortTh<KpiRow> label="Hrs Acum" sortKey="horasAcumuladas" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#71717A]")} helpKey="equipoHoras" />
                <SortTh<KpiRow> label="Paro" sortKey="paroTotal" current={sortKpi} onSort={toggleSortKpi} className="text-center text-[#A1A1AA]" helpKey="paroTotal" />
                <SortTh<KpiRow> label="Op %" sortKey="pctOperativo" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#15803D]")} helpKey="asarcoOperativo" />
                <SortTh<KpiRow> label="Res %" sortKey="pctReserva" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#1D4ED8]")} helpKey="asarcoReserva" />
                <SortTh<KpiRow> label="D.Prog %" sortKey="pctDetProgramada" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#B45309]")} helpKey="asarcoDetProg" />
                <SortTh<KpiRow> label="D.NoPr %" sortKey="pctDetNoProg" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#B91C1C]")} helpKey="asarcoDetNoProg" />
                <SortTh<KpiRow> label="Pérd %" sortKey="pctPerdidaOp" current={sortKpi} onSort={toggleSortKpi} className={clsx(TH_NUM, "text-[#71717A]")} helpKey="asarcoPerdida" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5]">
              {kpisFiltrados.map((r, i) => (
                <tr key={`${r.periodoLabel}-${r.equipoId}-${i}`} className={clsx("hover:bg-[#FAFAFA]", r.paroTotal && "bg-[#FEF2F2]")}>
                  <td className="px-2 py-1.5 sticky left-0 bg-white text-[#52525B]">{r.periodoLabel}</td>
                  <td className="px-2 py-1.5 font-mono font-bold text-[#09090B]">{r.equipoId}</td>
                  <td className="px-2 py-1.5 text-[#71717A]">{r.modelo}</td>
                  <td className="px-2 py-1.5 text-[#71717A]">{r.tipoFlota}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, r.dfm >= 85 ? "text-[#15803D]" : r.dfm >= 75 ? "text-[#B45309]" : "text-[#B91C1C]")}>{r.dfm.toFixed(1)}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, r.tmef >= 80 ? "text-[#15803D]" : r.tmef >= 50 ? "text-[#B45309]" : "text-[#B91C1C]")}>{r.tmef.toFixed(1)}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, r.tmpr <= 5 ? "text-[#15803D]" : r.tmpr <= 15 ? "text-[#B45309]" : "text-[#B91C1C]")}>{r.tmpr.toFixed(1)}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#52525B]")}>{r.tiempoOperativo.toFixed(1)}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#52525B]")}>{r.reserva.toFixed(1)}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#52525B]")}>{r.horasAcumuladas.toLocaleString()}</td>
                  <td className="px-2 py-1.5 text-center">{r.paroTotal ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B91C1C] text-white font-bold">PARO</span> : "—"}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#52525B]")}>{r.pctOperativo.toFixed(1)}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#52525B]")}>{r.pctReserva.toFixed(1)}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#52525B]")}>{r.pctDetProgramada.toFixed(1)}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#52525B]")}>{r.pctDetNoProg.toFixed(1)}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#52525B]")}>{r.pctPerdidaOp.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
            {kpisFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#E4E4E7] bg-[#FAFAFA] font-bold">
                  <td className="px-2 py-2 sticky left-0 bg-[#FAFAFA] text-[11px] text-[#71717A] uppercase">Promedio</td>
                  <td colSpan={3} />
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.dfm))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.tmef))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.tmpr))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.tiempoOperativo))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.reserva))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.horasAcumuladas))}</td>
                  <td className="px-2 py-2 text-center text-[11px] text-[#71717A]">{kpisFiltrados.filter((r) => r.paroTotal).length}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.pctOperativo))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.pctReserva))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.pctDetProgramada))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.pctDetNoProg))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{avg(kpisFiltrados.map((r) => r.pctPerdidaOp))}</td>
                </tr>
              </tfoot>
            )}
          </table>
          {kpisFiltrados.length === 0 && (
            <div className="flex items-center justify-center h-[80px] text-[13px] text-[#A1A1AA]">Sin datos para los filtros seleccionados</div>
          )}
        </div>
      )}

      {/* ─── Tabla Registros ─────────────────────────────────────────────────── */}
      {tab === "registros" && (
        <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
          <table className="w-full text-[12px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA]">
                <SortTh<RegistroRow> label="Fecha" sortKey="fecha" current={sortReg} onSort={toggleSortReg} className="text-left text-[#A1A1AA] sticky left-0 bg-[#FAFAFA] min-w-[100px]" />
                <SortTh<RegistroRow> label="Equipo" sortKey="equipoId" current={sortReg} onSort={toggleSortReg} className="text-left text-[#A1A1AA]" />
                <SortTh<RegistroRow> label="Modelo" sortKey="modelo" current={sortReg} onSort={toggleSortReg} className="text-left text-[#A1A1AA]" />
                <SortTh<RegistroRow> label="Flota" sortKey="tipoFlota" current={sortReg} onSort={toggleSortReg} className="text-left text-[#A1A1AA]" />
                <SortTh<RegistroRow> label="Turno" sortKey="turno" current={sortReg} onSort={toggleSortReg} className="text-left text-[#A1A1AA]" helpKey="turno" />
                <SortTh<RegistroRow> label="Oper. h" sortKey="hrsOperacion" current={sortReg} onSort={toggleSortReg} className={clsx(TH_NUM, "text-[#15803D]")} helpKey="asarcoOperativo" />
                <SortTh<RegistroRow> label="Reserva h" sortKey="hrsReserva" current={sortReg} onSort={toggleSortReg} className={clsx(TH_NUM, "text-[#1D4ED8]")} helpKey="asarcoReserva" />
                <SortTh<RegistroRow> label="D.Prog h" sortKey="hrsDetProgramada" current={sortReg} onSort={toggleSortReg} className={clsx(TH_NUM, "text-[#B45309]")} helpKey="asarcoDetProg" />
                <SortTh<RegistroRow> label="D.NoPr h" sortKey="hrsDetNoProgramada" current={sortReg} onSort={toggleSortReg} className={clsx(TH_NUM, "text-[#B91C1C]")} helpKey="asarcoDetNoProg" />
                <SortTh<RegistroRow> label="Pérd h" sortKey="hrsPerdidaOp" current={sortReg} onSort={toggleSortReg} className={clsx(TH_NUM, "text-[#71717A]")} helpKey="asarcoPerdida" />
                <th className={clsx("px-2 py-2 text-[11px] font-bold uppercase tracking-wider", TH_NUM, "text-[#A1A1AA]")}>Total h</th>
                <th className="px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-left text-[#A1A1AA] min-w-[100px]">Obs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5]">
              {registrosFiltrados.map((r, i) => {
                const total = r.hrsOperacion + r.hrsReserva + r.hrsDetProgramada + r.hrsDetNoProgramada + r.hrsPerdidaOp;
                return (
                  <tr key={`${r.fecha}-${r.equipoId}-${i}`} className="hover:bg-[#FAFAFA]">
                    <td className="px-2 py-1.5 sticky left-0 bg-white font-mono text-[#52525B]">{r.fecha}</td>
                    <td className="px-2 py-1.5 font-mono font-bold text-[#09090B]">{r.equipoId}</td>
                    <td className="px-2 py-1.5 text-[#71717A]">{r.modelo}</td>
                    <td className="px-2 py-1.5 text-[#71717A]">{r.tipoFlota}</td>
                    <td className="px-2 py-1.5 text-[#71717A]">{r.turno}</td>
                    <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#15803D]")}>{r.hrsOperacion.toFixed(1)}</td>
                    <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#1D4ED8]")}>{r.hrsReserva.toFixed(1)}</td>
                    <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#B45309]")}>{r.hrsDetProgramada.toFixed(1)}</td>
                    <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#B91C1C]")}>{r.hrsDetNoProgramada.toFixed(1)}</td>
                    <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#71717A]")}>{r.hrsPerdidaOp.toFixed(1)}</td>
                    <td className={clsx("px-2 py-1.5", NUM_CELL, total > 24 ? "text-[#B91C1C] font-bold" : "text-[#09090B] font-bold")}>{total.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-[#71717A] truncate max-w-[160px]" title={r.observaciones}>{r.observaciones || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
            {registrosFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#E4E4E7] bg-[#FAFAFA] font-bold">
                  <td className="px-2 py-2 sticky left-0 bg-[#FAFAFA] text-[11px] text-[#71717A] uppercase">Totales</td>
                  <td colSpan={4} />
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{sum(registrosFiltrados.map((r) => r.hrsOperacion))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{sum(registrosFiltrados.map((r) => r.hrsReserva))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{sum(registrosFiltrados.map((r) => r.hrsDetProgramada))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{sum(registrosFiltrados.map((r) => r.hrsDetNoProgramada))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{sum(registrosFiltrados.map((r) => r.hrsPerdidaOp))}</td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{sum(registrosFiltrados.map((r) => r.hrsOperacion + r.hrsReserva + r.hrsDetProgramada + r.hrsDetNoProgramada + r.hrsPerdidaOp))}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
          {registrosFiltrados.length === 0 && (
            <div className="flex items-center justify-center h-[80px] text-[13px] text-[#A1A1AA]">Sin registros para los filtros seleccionados</div>
          )}
        </div>
      )}

      {/* ─── Tabla Fallas ────────────────────────────────────────────────────── */}
      {tab === "fallas" && (
        <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
          <table className="w-full text-[12px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA]">
                <SortTh<FallaRow> label="Fecha" sortKey="fecha" current={sortFal} onSort={toggleSortFal} className="text-left text-[#A1A1AA] sticky left-0 bg-[#FAFAFA] min-w-[130px]" />
                <SortTh<FallaRow> label="Equipo" sortKey="equipoId" current={sortFal} onSort={toggleSortFal} className="text-left text-[#A1A1AA]" />
                <SortTh<FallaRow> label="Modelo" sortKey="modelo" current={sortFal} onSort={toggleSortFal} className="text-left text-[#A1A1AA]" />
                <SortTh<FallaRow> label="Flota" sortKey="tipoFlota" current={sortFal} onSort={toggleSortFal} className="text-left text-[#A1A1AA]" />
                <SortTh<FallaRow> label="Componente" sortKey="componente" current={sortFal} onSort={toggleSortFal} className="text-left text-[#A1A1AA]" helpKey="componenteFalla" />
                <th className="px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-left text-[#A1A1AA] min-w-[200px]">Descripción</th>
                <SortTh<FallaRow> label="Hrs Rep" sortKey="hrsReparacion" current={sortFal} onSort={toggleSortFal} className={clsx(TH_NUM, "text-[#B91C1C]")} helpKey="hrsReparacion" />
                <SortTh<FallaRow> label="Resuelta" sortKey="resuelta" current={sortFal} onSort={toggleSortFal} className="text-center text-[#A1A1AA]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5]">
              {fallasFiltradas.map((r, i) => (
                <tr key={`${r.fecha}-${r.equipoId}-${i}`} className="hover:bg-[#FAFAFA]">
                  <td className="px-2 py-1.5 sticky left-0 bg-white font-mono text-[#52525B]">{r.fecha.replace("T", " ")}</td>
                  <td className="px-2 py-1.5 font-mono font-bold text-[#09090B]">{r.equipoId}</td>
                  <td className="px-2 py-1.5 text-[#71717A]">{r.modelo}</td>
                  <td className="px-2 py-1.5 text-[#71717A]">{r.tipoFlota}</td>
                  <td className="px-2 py-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-[3px] bg-[#F4F4F5] text-[#52525B]">{r.componente}</span>
                  </td>
                  <td className="px-2 py-1.5 text-[#52525B] max-w-[300px] truncate" title={r.descripcion}>{r.descripcion}</td>
                  <td className={clsx("px-2 py-1.5", NUM_CELL, "text-[#B91C1C]")}>{r.hrsReparacion.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-center">{r.resuelta ? <span className="text-[#15803D]">Sí</span> : <span className="text-[#B91C1C]">No</span>}</td>
                </tr>
              ))}
            </tbody>
            {fallasFiltradas.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#E4E4E7] bg-[#FAFAFA] font-bold">
                  <td className="px-2 py-2 sticky left-0 bg-[#FAFAFA] text-[11px] text-[#71717A] uppercase">Resumen</td>
                  <td colSpan={5} className="px-2 py-2 text-[11px] text-[#71717A]">
                    {fallasFiltradas.length} falla{fallasFiltradas.length !== 1 ? "s" : ""} · {new Set(fallasFiltradas.map((r) => r.equipoId)).size} equipo(s) afectado(s)
                  </td>
                  <td className={clsx("px-2 py-2", NUM_CELL)}>{sum(fallasFiltradas.map((r) => r.hrsReparacion))}</td>
                  <td className="px-2 py-2 text-center text-[11px] text-[#71717A]">
                    {fallasFiltradas.filter((r) => r.resuelta).length}/{fallasFiltradas.length}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          {fallasFiltradas.length === 0 && (
            <div className="flex items-center justify-center h-[80px] text-[13px] text-[#A1A1AA]">Sin fallas para los filtros seleccionados</div>
          )}
        </div>
      )}

      {/* ─── Comparativa por Turno ──────────────────────────────────────────── */}
      {tab === "turnos" && turnos.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A]">
            <Sun size={14} className="text-[#B45309] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#92400E]">
              Comparativa entre turnos día y noche. Permite identificar si un turno tiene más detenciones, menor operatividad o mayor pérdida que otro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {turnos.map((t) => {
              const TurnoIcon = t.turno === "dia" ? Sun : Moon;
              const turnoLabel = t.turno === "dia" ? "Turno Día" : "Turno Noche";
              const headerBg = t.turno === "dia" ? "bg-[#FFFBEB]" : "bg-[#1E1B4B]";
              const headerText = t.turno === "dia" ? "text-[#92400E]" : "text-[#C7D2FE]";

              return (
                <div key={t.turno} className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
                  <div className={`flex items-center gap-2 px-4 py-3 ${headerBg}`}>
                    <TurnoIcon size={15} className={headerText} />
                    <span className={`text-[14px] font-bold ${headerText}`}>{turnoLabel}</span>
                    <span className={`ml-auto text-[11px] font-mono ${headerText} opacity-60`}>
                      {t.registros} registros · {t.equipos} equipos
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* KPIs principales */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Operativo</span>
                        <span className={clsx("text-[24px] font-mono font-bold leading-none", t.pctOperativo >= 80 ? "text-[#15803D]" : t.pctOperativo >= 65 ? "text-[#B45309]" : "text-[#B91C1C]")}>
                          {t.pctOperativo}%
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Reserva</span>
                        <span className="text-[24px] font-mono font-bold leading-none text-[#1D4ED8]">
                          {t.pctReserva}%
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Det. No Prog.</span>
                        <span className={clsx("text-[24px] font-mono font-bold leading-none", t.pctDetNoProg <= 5 ? "text-[#15803D]" : t.pctDetNoProg <= 15 ? "text-[#B45309]" : "text-[#B91C1C]")}>
                          {t.pctDetNoProg}%
                        </span>
                      </div>
                    </div>

                    {/* Barras ASARCO */}
                    <div className="h-[6px] flex rounded-full overflow-hidden">
                      <div style={{ width: `${Math.max(0, t.pctOperativo)}%`, backgroundColor: "#16A34A" }} />
                      <div style={{ width: `${Math.max(0, t.pctReserva)}%`, backgroundColor: "#3A6AB0" }} />
                      <div style={{ width: `${Math.max(0, 100 - t.pctOperativo - t.pctReserva - t.pctDetNoProg)}%`, backgroundColor: "#D97706" }} />
                      <div style={{ width: `${Math.max(0, t.pctDetNoProg)}%`, backgroundColor: "#DC2626" }} />
                    </div>

                    {/* Detalle horas */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-[#71717A]">Operación</span><span className="font-mono text-[#52525B]">{t.hrsOperacion}h</span></div>
                      <div className="flex justify-between"><span className="text-[#71717A]">Reserva</span><span className="font-mono text-[#52525B]">{t.hrsReserva}h</span></div>
                      <div className="flex justify-between"><span className="text-[#71717A]">Det. Prog.</span><span className="font-mono text-[#52525B]">{t.hrsDetProgramada}h</span></div>
                      <div className="flex justify-between"><span className="text-[#71717A]">Det. No Prog.</span><span className="font-mono text-[#B91C1C]">{t.hrsDetNoProgramada}h</span></div>
                      <div className="flex justify-between"><span className="text-[#71717A]">Pérdida Op.</span><span className="font-mono text-[#52525B]">{t.hrsPerdidaOp}h</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {turnos.length === 2 && (() => {
            const dia = turnos.find((t) => t.turno === "dia");
            const noche = turnos.find((t) => t.turno === "noche");
            if (!dia || !noche) return null;
            const diffOp = dia.pctOperativo - noche.pctOperativo;
            const diffDet = dia.pctDetNoProg - noche.pctDetNoProg;
            const mejor = diffOp > 2 ? "día" : diffOp < -2 ? "noche" : null;

            return (
              <div className="p-3.5 rounded-[10px] bg-white border border-[#E4E4E7]">
                <p className="text-[13px] text-[#52525B] leading-relaxed">
                  {mejor ? (
                    <>El turno <strong>{mejor}</strong> tiene {Math.abs(diffOp).toFixed(1)} pts más de operatividad. </>
                  ) : (
                    <>Ambos turnos tienen operatividad similar (diferencia: {Math.abs(diffOp).toFixed(1)} pts). </>
                  )}
                  {Math.abs(diffDet) > 2 && (
                    <>Detenciones no programadas: turno {diffDet > 0 ? "día" : "noche"} tiene {Math.abs(diffDet).toFixed(1)} pts más.</>
                  )}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {tab === "turnos" && turnos.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[120px] rounded-[10px] bg-white border border-[#E4E4E7]">
          <p className="text-[13px] text-[#A1A1AA]">No hay datos por turno registrados</p>
          <p className="text-[11px] text-[#A1A1AA] mt-1">Los registros deben tener turno &ldquo;dia&rdquo; o &ldquo;noche&rdquo; en vez de &ldquo;completo&rdquo;</p>
        </div>
      )}
    </div>
  );
}
