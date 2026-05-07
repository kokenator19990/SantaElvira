"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, AlertTriangle, Info, Calendar, Download, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { upsertRegistrosDiarioBatch, cargarRegistrosPorFecha } from "@/lib/db/actions/registro-diario";
import { exportarCsv } from "@/lib/utils/export-csv";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

interface Equipo {
  id: string;
  modelo: string;
  tipoFlotaId: string;
}

interface FilaRegistro {
  equipoId: string;
  hrsOperacion: number;
  hrsReserva: number;
  hrsDetProgramada: number;
  hrsDetNoProgramada: number;
  hrsPerdidaOp: number;
  observaciones: string;
}

const COLUMNAS = [
  { key: "hrsOperacion" as const,       label: "Operación",   color: "#15803D", short: "Hrs producción activa" },
  { key: "hrsReserva" as const,         label: "Reserva",     color: "#1D4ED8", short: "Hrs disponible sin asignación" },
  { key: "hrsDetProgramada" as const,   label: "Det. Prog.",  color: "#B45309", short: "Hrs mantención programada" },
  { key: "hrsDetNoProgramada" as const, label: "Det. No Prog.", color: "#B91C1C", short: "Hrs falla/avería" },
  { key: "hrsPerdidaOp" as const,       label: "Pérdida Op.", color: "#71717A", short: "Hrs pérdida externa (clima, etc.)" },
] as const;

type HrsKey = typeof COLUMNAS[number]["key"];

export function RegistroDiarioClient({ equipos }: { equipos: Equipo[] }) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [filas, setFilas] = useState<FilaRegistro[]>(() => crearFilasVacias(equipos));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datosExistentes, setDatosExistentes] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error" | "warn"; text: string } | null>(null);
  const fetchIdRef = useRef(0);

  function crearFilasVacias(eqs: Equipo[]): FilaRegistro[] {
    return eqs.map((e) => ({
      equipoId: e.id,
      hrsOperacion: 0,
      hrsReserva: 0,
      hrsDetProgramada: 0,
      hrsDetNoProgramada: 0,
      hrsPerdidaOp: 0,
      observaciones: "",
    }));
  }

  const cargarFecha = useCallback(async (f: string) => {
    const thisId = ++fetchIdRef.current;
    setLoading(true);
    setMsg(null);
    try {
      const existentes = await cargarRegistrosPorFecha(f);
      if (thisId !== fetchIdRef.current) return; // respuesta obsoleta
      if (existentes.length > 0) {
        const filasNuevas = equipos.map((e) => {
          const reg = existentes.find((r) => r.equipoId === e.id);
          return reg ?? {
            equipoId: e.id,
            hrsOperacion: 0,
            hrsReserva: 0,
            hrsDetProgramada: 0,
            hrsDetNoProgramada: 0,
            hrsPerdidaOp: 0,
            observaciones: "",
          };
        });
        setFilas(filasNuevas);
        setDatosExistentes(true);
        setMsg({ type: "ok", text: `${existentes.length} registro(s) cargados del ${f}` });
      } else {
        setFilas(crearFilasVacias(equipos));
        setDatosExistentes(false);
      }
    } catch {
      if (thisId !== fetchIdRef.current) return;
      setFilas(crearFilasVacias(equipos));
      setDatosExistentes(false);
    }
    setLoading(false);
  }, [equipos]);

  useEffect(() => {
    cargarFecha(fecha);
  }, [fecha, cargarFecha]);

  function patchFila(idx: number, key: HrsKey, value: number) {
    setFilas((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f))
    );
  }

  function patchObs(idx: number, value: string) {
    setFilas((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, observaciones: value } : f))
    );
  }

  function totalHrs(fila: FilaRegistro): number {
    return fila.hrsOperacion + fila.hrsReserva + fila.hrsDetProgramada + fila.hrsDetNoProgramada + fila.hrsPerdidaOp;
  }

  async function guardarTodo() {
    setSaving(true);
    setMsg(null);

    const filasConDatos = filas.filter((f) => totalHrs(f) > 0);

    if (filasConDatos.length === 0) {
      setMsg({ type: "warn", text: "No hay datos para guardar. Ingresa horas en al menos un equipo." });
      setSaving(false);
      return;
    }

    const result = await upsertRegistrosDiarioBatch(
      filasConDatos.map((f) => ({ ...f, fecha }))
    );

    if (!result.ok) {
      setMsg({ type: "error", text: result.error });
    } else {
      const { guardados, errores } = result.data!;
      if (errores.length > 0) {
        setMsg({ type: "warn", text: `${guardados} guardados, ${errores.length} error(es): ${errores[0]}` });
      } else {
        setMsg({ type: "ok", text: `${guardados} registro(s) guardados para ${fecha}.` });
      }
      setDatosExistentes(true);
    }
    setSaving(false);
  }

  function exportarDia() {
    const filasConDatos = filas.filter((f) => totalHrs(f) > 0);
    exportarCsv(filasConDatos, [
      { header: "Equipo",         value: (f) => f.equipoId },
      { header: "Fecha",          value: () => fecha },
      { header: "Operación h",    value: (f) => f.hrsOperacion },
      { header: "Reserva h",      value: (f) => f.hrsReserva },
      { header: "Det.Prog h",     value: (f) => f.hrsDetProgramada },
      { header: "Det.NoProg h",   value: (f) => f.hrsDetNoProgramada },
      { header: "Pérdida Op h",   value: (f) => f.hrsPerdidaOp },
      { header: "Total h",        value: (f) => totalHrs(f) },
      { header: "Observaciones",  value: (f) => f.observaciones },
    ], `MSG_RegistroDiario_${fecha}.csv`);
  }

  const filasConExceso = filas.filter((f) => totalHrs(f) > 24);
  const filasConDatos = filas.filter((f) => totalHrs(f) > 0);

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[13px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Admin
        </Link>
      </div>

      <SectionTitle>
        <Tooltip short="Ingreso de horas diarias por equipo en las 5 categorías ASARCO" help={HELP.registroDiario}>
          Registro Diario de Horas
        </Tooltip>
      </SectionTitle>

      <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE]">
        <Info size={14} className="text-[#1D4ED8] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#1E40AF]">
          Registra las horas de cada equipo distribuidas en las 5 categorías ASARCO.
          Las 5 columnas deben sumar como máximo 24 horas por equipo.
          Al cambiar la fecha, se cargan automáticamente los datos existentes para edición.
        </p>
      </div>

      {/* Toolbar: fecha + acciones */}
      <div className="flex items-center gap-3 p-3 rounded-[10px] bg-white border border-[#E4E4E7] flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[#71717A]" />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="px-2.5 py-1.5 rounded-[6px] border border-[#E4E4E7] text-[13px] text-[#3F3F46] focus:outline-none focus:border-[#B45309]"
          />
          {loading && <RefreshCw size={13} className="text-[#71717A] animate-spin" />}
          {datosExistentes && !loading && (
            <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#F0FDF4] text-[#15803D] font-medium border border-[#BBF7D0]">
              Datos cargados
            </span>
          )}
        </div>

        {filasConExceso.length > 0 && (
          <span className="text-[12px] text-[#B91C1C] font-medium">
            {filasConExceso.length} equipo(s) exceden 24h
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {filasConDatos.length > 0 && (
            <button
              onClick={exportarDia}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-semibold text-[#52525B] transition-colors"
              title="Descargar registros del día como CSV"
            >
              <Download size={12} /> Excel
            </button>
          )}
          <button
            onClick={guardarTodo}
            disabled={saving || filasConExceso.length > 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] disabled:opacity-50 text-white text-[13px] font-semibold"
          >
            <Save size={13} /> {saving ? "Guardando..." : "Guardar día"}
          </button>
        </div>
      </div>

      {msg && (
        <div className={clsx(
          "flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] text-[13px]",
          msg.type === "ok"   ? "bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]" :
          msg.type === "warn" ? "bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]" :
          "bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]"
        )}>
          {msg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {msg.text}
        </div>
      )}

      {/* Tabla de registro */}
      <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA]">
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] sticky left-0 bg-[#FAFAFA] min-w-[100px]">
                Equipo
              </th>
              {COLUMNAS.map((col) => (
                <th key={col.key} className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider min-w-[80px]" style={{ color: col.color }}>
                  <Tooltip short={col.short}>
                    <span className="cursor-help">{col.label}</span>
                  </Tooltip>
                </th>
              ))}
              <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] min-w-[55px]">
                Total
              </th>
              <th className="text-left px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] min-w-[120px]">
                Obs.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5]">
            {filas.map((fila, idx) => {
              const equipo = equipos[idx];
              const total = totalHrs(fila);
              const excede = total > 24;
              return (
                <tr key={equipo.id} className={clsx(excede && "bg-[#FEF2F2]")}>
                  <td className="px-3 py-2 sticky left-0 bg-white">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-[#09090B]">{equipo.id}</span>
                      <span className="text-[10px] text-[#A1A1AA]">{equipo.modelo}</span>
                    </div>
                  </td>
                  {COLUMNAS.map((col) => (
                    <td key={col.key} className="px-1 py-1.5 text-center">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        value={fila[col.key] || ""}
                        onChange={(e) => patchFila(idx, col.key, parseFloat(e.target.value) || 0)}
                        className={clsx(
                          "w-[65px] mx-auto px-1.5 py-1.5 rounded-[5px] border focus:outline-none text-center text-[13px] font-mono tabular-nums",
                          fila[col.key] > 0
                            ? "border-[#D4D4D8] bg-[#FAFAFA] focus:border-[#B45309]"
                            : "border-[#E4E4E7] focus:border-[#B45309]"
                        )}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center">
                    <span className={clsx(
                      "font-mono font-bold text-[13px] tabular-nums",
                      excede ? "text-[#B91C1C]" : total > 0 ? "text-[#15803D]" : "text-[#A1A1AA]"
                    )}>
                      {total > 0 ? total.toFixed(1) : "---"}
                    </span>
                  </td>
                  <td className="px-1 py-1.5">
                    <input
                      type="text"
                      value={fila.observaciones}
                      onChange={(e) => patchObs(idx, e.target.value)}
                      placeholder="---"
                      className="w-full px-2 py-1.5 rounded-[5px] border border-[#E4E4E7] focus:border-[#B45309] focus:outline-none text-[12px] text-[#52525B]"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen rápido */}
      <div className="flex items-center gap-4 px-3 py-2 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]">
        <span className="text-[12px] text-[#52525B]">
          <strong className="text-[#09090B]">{filasConDatos.length}</strong> de {filas.length} equipos con datos
        </span>
        <span className="text-[12px] text-[#A1A1AA]">|</span>
        <span className="text-[12px] text-[#52525B]">
          Total horas registradas: <strong className="text-[#09090B] font-mono">{filas.reduce((s, f) => s + totalHrs(f), 0).toFixed(1)}</strong>
        </span>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-[#A1A1AA]">
        <Info size={12} className="shrink-0 mt-0.5" />
        <p>
          Los registros se guardan con upsert: si ya existe un registro para ese equipo, fecha y turno, se sobrescribe.
          Una vez completado el mes, usa «Calcular KPIs» para generar automáticamente los indicadores del período.
        </p>
      </div>
    </div>
  );
}
