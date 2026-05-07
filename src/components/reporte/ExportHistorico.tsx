"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { getKpisMultiPeriodo, getRegistrosExport } from "@/lib/db/actions/exportar";
import { exportarCsv } from "@/lib/utils/export-csv";
import type { Periodo } from "@/lib/db/schema";

type TipoExport = "kpis" | "registros";

export function ExportHistorico({ periodos }: { periodos: Periodo[] }) {
  const [tipo, setTipo] = useState<TipoExport>("kpis");
  const [seleccionados, setSeleccionados] = useState<Set<number>>(() => {
    const ids = periodos.slice(0, 3).map((p) => p.id);
    return new Set(ids);
  });
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [fechaHasta, setFechaHasta] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function togglePeriodo(id: number) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function seleccionarTodos() {
    setSeleccionados(new Set(periodos.map((p) => p.id)));
  }

  async function handleExport() {
    setLoading(true);
    setDone(false);

    try {
      if (tipo === "kpis") {
        const ids = periodos.filter((p) => seleccionados.has(p.id)).map((p) => p.id);
        const data = await getKpisMultiPeriodo(ids);
        if (data.length > 0) {
          exportarCsv(data, [
            { header: "Período",        value: (r) => r.periodo },
            { header: "Equipo",         value: (r) => r.equipoId },
            { header: "Modelo",         value: (r) => r.modelo },
            { header: "Tipo Flota",     value: (r) => r.tipoFlota },
            { header: "DFM %",          value: (r) => r.dfm },
            { header: "TMEF h",         value: (r) => r.tmef },
            { header: "TMPR h",         value: (r) => r.tmpr },
            { header: "T.Operativo %",  value: (r) => r.tiempoOperativo },
            { header: "Reserva %",      value: (r) => r.reserva },
            { header: "Horas Acum.",    value: (r) => r.horasAcumuladas },
            { header: "Paro Total",     value: (r) => r.paroTotal ? "SÍ" : "NO" },
            { header: "Motivo Paro",    value: (r) => r.motivoParo },
            { header: "ASARCO Op %",         value: (r) => r.pctOperativo },
            { header: "ASARCO Res %",        value: (r) => r.pctReserva },
            { header: "ASARCO Det.Prog %",   value: (r) => r.pctDetProgramada },
            { header: "ASARCO Det.NoProg %", value: (r) => r.pctDetNoProg },
            { header: "ASARCO Pérdida %",    value: (r) => r.pctPerdidaOp },
          ], `MSG_KPIs_Historico_${ids.length}periodos.csv`);
        }
      } else {
        const data = await getRegistrosExport(fechaDesde, fechaHasta);
        if (data.length > 0) {
          exportarCsv(data, [
            { header: "Fecha",           value: (r) => r.fecha },
            { header: "Equipo",          value: (r) => r.equipoId },
            { header: "Modelo",          value: (r) => r.modelo },
            { header: "Tipo Flota",      value: (r) => r.tipoFlota },
            { header: "Turno",           value: (r) => r.turno },
            { header: "Operación h",     value: (r) => r.hrsOperacion },
            { header: "Reserva h",       value: (r) => r.hrsReserva },
            { header: "Det.Prog h",      value: (r) => r.hrsDetProgramada },
            { header: "Det.NoProg h",    value: (r) => r.hrsDetNoProgramada },
            { header: "Pérdida Op h",    value: (r) => r.hrsPerdidaOp },
            { header: "Observaciones",   value: (r) => r.observaciones },
          ], `MSG_RegistroDiario_${fechaDesde}_a_${fechaHasta}.csv`);
        }
      }

      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch {
      setDone(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[14px] font-semibold text-[#09090B]">Exportar datos a Excel</h3>
      <p className="text-[12px] text-[#71717A]">
        Descarga datos históricos como CSV compatible con Excel. Selecciona el tipo de datos y el rango.
      </p>

      {/* Tipo de export */}
      <div className="flex gap-2">
        {([
          { id: "kpis" as const, label: "KPIs por período" },
          { id: "registros" as const, label: "Registros diarios" },
        ]).map((opt) => (
          <button
            key={opt.id}
            onClick={() => setTipo(opt.id)}
            className={clsx(
              "px-3 py-1.5 rounded-[7px] text-[13px] font-medium border transition-colors",
              tipo === opt.id
                ? "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
                : "bg-white text-[#71717A] border-[#E4E4E7] hover:border-[#D4D4D8]"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Selector según tipo */}
      {tipo === "kpis" ? (
        <div className="flex flex-col gap-2 p-3 rounded-[10px] border border-[#E4E4E7] bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#71717A] uppercase tracking-wider">Períodos a exportar</span>
            <button onClick={seleccionarTodos} className="text-[11px] text-[#B45309] hover:underline">
              Seleccionar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {periodos.map((p) => (
              <label
                key={p.id}
                className={clsx(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[12px] cursor-pointer border transition-colors",
                  seleccionados.has(p.id)
                    ? "bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]"
                    : "bg-white text-[#71717A] border-[#E4E4E7] hover:border-[#D4D4D8]"
                )}
              >
                <input
                  type="checkbox"
                  checked={seleccionados.has(p.id)}
                  onChange={() => togglePeriodo(p.id)}
                  className="sr-only"
                />
                <span className={clsx(
                  "w-3 h-3 rounded-[3px] border flex items-center justify-center",
                  seleccionados.has(p.id) ? "bg-[#7C3AED] border-[#7C3AED]" : "border-[#D4D4D8]"
                )}>
                  {seleccionados.has(p.id) && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </span>
                {p.label}
              </label>
            ))}
          </div>
          <span className="text-[11px] text-[#A1A1AA]">{seleccionados.size} período(s) seleccionado(s)</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-[10px] border border-[#E4E4E7] bg-white">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Desde</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="px-2.5 py-1.5 rounded-[6px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Hasta</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="px-2.5 py-1.5 rounded-[6px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]"
            />
          </div>
        </div>
      )}

      {/* Botón descargar */}
      <button
        onClick={handleExport}
        disabled={loading || (tipo === "kpis" && seleccionados.size === 0)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#09090B] hover:bg-[#27272A] disabled:opacity-50 text-white text-[13px] font-semibold w-fit transition-colors"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : done ? <CheckCircle2 size={14} /> : <Download size={14} />}
        {loading ? "Generando..." : done ? "Descargado" : "Descargar Excel"}
      </button>
    </div>
  );
}
