"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save, AlertTriangle, CheckCircle2, RefreshCw, Upload } from "lucide-react";
import { clsx } from "clsx";
import type { Equipo } from "@/lib/domain/tipos";
import type { Periodo } from "@/lib/db/schema";
import { upsertKpiEquipo, upsertAsarcoEquipo, regenerarAlertasPeriodo } from "@/lib/db/actions/kpis";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

interface KpiRow {
  equipoId: string;
  modelo: string;
  dfm: number;
  tmef: number;
  tmpr: number;
  tiempoOperativo: number;
  reserva: number;
  horasAcumuladas: number;
  paroTotal: boolean;
  motivoParo: string;
  pctOperativo: number;
  pctReserva: number;
  pctDetProgramada: number;
  pctDetNoProg: number;
  pctPerdidaOp: number;
  status: "idle" | "saving" | "ok" | "error";
  errorMsg?: string;
}

function rowFromEquipo(e: Equipo): KpiRow {
  return {
    equipoId:         e.id,
    modelo:           e.modelo,
    dfm:              e.kpis.dfm,
    tmef:             e.kpis.tmef,
    tmpr:             e.kpis.tmpr,
    tiempoOperativo:  e.kpis.tiempoOperativo,
    reserva:          e.kpis.reserva,
    horasAcumuladas:  e.horasAcumuladas,
    paroTotal:        e.paroTotal,
    motivoParo:       e.motivoParo ?? "",
    pctOperativo:             e.asarco.operativo,
    pctReserva:               e.asarco.reserva,
    pctDetProgramada:         e.asarco.detencionProgramada,
    pctDetNoProg:             e.asarco.detencionNoProgramada,
    pctPerdidaOp:             e.asarco.perdidaOperacional,
    status: "idle",
  };
}

function sumaAsarco(r: KpiRow) {
  return r.pctOperativo + r.pctReserva + r.pctDetProgramada + r.pctDetNoProg + r.pctPerdidaOp;
}

export function KpisAdminClient({ flota, periodos }: { flota: Equipo[]; periodos: Periodo[] }) {
  const [periodoId, setPeriodoId] = useState(periodos[0]?.id ?? 0);
  const [rows, setRows] = useState<KpiRow[]>(() => flota.map(rowFromEquipo));
  const [globalMsg, setGlobalMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [, startTransition] = useTransition();

  function patch(idx: number, p: Partial<KpiRow>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...p } : r)));
  }

  // Devuelve { ok, error? } — NO depende del state de React para reportar el resultado.
  async function guardarFila(idx: number): Promise<{ ok: boolean; error?: string }> {
    const r = rows[idx];

    // Validar suma ASARCO ANTES de llamar al servidor
    const suma = sumaAsarco(r);
    if (Math.abs(suma - 100) > 0.1) {
      const msg = `ASARCO suma ${suma.toFixed(1)}% — debe ser 100%`;
      patch(idx, { status: "error", errorMsg: msg });
      return { ok: false, error: msg };
    }

    // Validar motivo si paro total
    if (r.paroTotal && !r.motivoParo.trim()) {
      const msg = "El motivo de paro es obligatorio";
      patch(idx, { status: "error", errorMsg: msg });
      return { ok: false, error: msg };
    }

    patch(idx, { status: "saving", errorMsg: undefined });

    const [resKpi, resAsarco] = await Promise.all([
      upsertKpiEquipo({
        equipoId:        r.equipoId,
        periodoId,
        dfm:             r.dfm,
        tmef:            r.tmef,
        tmpr:            r.tmpr,
        tiempoOperativo: r.tiempoOperativo,
        reserva:         r.reserva,
        horasAcumuladas: r.horasAcumuladas,
        paroTotal:       r.paroTotal,
        motivoParo:      r.motivoParo || null,
      }),
      upsertAsarcoEquipo({
        equipoId:         r.equipoId,
        periodoId,
        pctOperativo:     r.pctOperativo,
        pctReserva:       r.pctReserva,
        pctDetProgramada: r.pctDetProgramada,
        pctDetNoProg:     r.pctDetNoProg,
        pctPerdidaOp:     r.pctPerdidaOp,
      }),
    ]);

    if (!resKpi.ok) {
      patch(idx, { status: "error", errorMsg: resKpi.error });
      return { ok: false, error: resKpi.error };
    }
    if (!resAsarco.ok) {
      patch(idx, { status: "error", errorMsg: resAsarco.error });
      return { ok: false, error: resAsarco.error };
    }
    patch(idx, { status: "ok" });
    return { ok: true };
  }

  async function guardarTodos() {
    if (guardando) return;
    setGuardando(true);
    setGlobalMsg(null);
    const errores: string[] = [];

    try {
      for (let i = 0; i < rows.length; i++) {
        const result = await guardarFila(i);
        if (!result.ok) {
          errores.push(`${rows[i].equipoId}: ${result.error ?? "Error desconocido"}`);
        }
      }

      if (errores.length > 0) {
        setGlobalMsg({ type: "error", text: `${errores.length} error(es). Primero: ${errores[0]}` });
      } else {
        setGlobalMsg({ type: "ok", text: `${rows.length} equipos guardados correctamente.` });
      }
    } finally {
      setGuardando(false);
    }
  }

  function regenerarAlertas() {
    setGlobalMsg(null);
    startTransition(async () => {
      const r = await regenerarAlertasPeriodo(periodoId);
      if (r.ok) setGlobalMsg({ type: "ok", text: `Alertas regeneradas: ${r.data?.creadas ?? 0}.` });
      else      setGlobalMsg({ type: "error", text: r.error ?? "Error al regenerar alertas" });
    });
  }

  const periodoLabel = periodos.find((p) => p.id === periodoId)?.label ?? "—";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[13px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Admin
        </Link>
      </div>
      <SectionTitle>
        <Tooltip short="Tabla editable: edita las celdas y guarda fila por fila o todo junto" help={HELP.adminKpis}>
          Cargar KPIs — {periodoLabel}
        </Tooltip>
      </SectionTitle>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-[10px] bg-white border border-[#E4E4E7]">
        <label className="flex items-center gap-2 text-[13px] text-[#52525B]">
          Período:
          <select
            value={periodoId}
            onChange={(e) => setPeriodoId(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-[6px] bg-white border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]"
          >
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>{p.label}{p.cerrado ? " (cerrado)" : ""}</option>
            ))}
          </select>
        </label>

        <Link
          href="/admin/kpis/importar"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-white hover:bg-[#FAFAFA] border border-[#E4E4E7] text-[13px] font-semibold text-[#52525B]"
        >
          <Upload size={13} /> Importar CSV
        </Link>

        <button
          onClick={guardarTodos}
          disabled={guardando}
          className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold"
        >
          <Save size={13} /> {guardando ? "Guardando…" : "Guardar todo"}
        </button>
        <button
          onClick={regenerarAlertas}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-white hover:bg-[#FAFAFA] border border-[#E4E4E7] text-[13px] font-semibold text-[#52525B]"
        >
          <RefreshCw size={13} /> Regenerar alertas
        </button>
      </div>

      {globalMsg && (
        <div className={clsx(
          "flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] text-[13px]",
          globalMsg.type === "ok"
            ? "bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]"
            : "bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]"
        )}>
          {globalMsg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {globalMsg.text}
        </div>
      )}

      {/* Tabla editable */}
      <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
            <tr className="text-[11px] uppercase tracking-wider text-[#71717A]">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Modelo</th>
              <th className="px-2 py-2 text-right">DFM%</th>
              <th className="px-2 py-2 text-right">TMEF h</th>
              <th className="px-2 py-2 text-right">TMPR h</th>
              <th className="px-2 py-2 text-right">T.Op%</th>
              <th className="px-2 py-2 text-right">Res%</th>
              <th className="px-2 py-2 text-right">Horas</th>
              <th className="px-2 py-2 text-center">Paro</th>
              <th className="px-2 py-2 text-right">Op</th>
              <th className="px-2 py-2 text-right">Rsv</th>
              <th className="px-2 py-2 text-right">DP</th>
              <th className="px-2 py-2 text-right">DNP</th>
              <th className="px-2 py-2 text-right">PO</th>
              <th className="px-2 py-2 text-right">Σ</th>
              <th className="px-2 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const suma = sumaAsarco(r);
              const sumOk = Math.abs(suma - 100) <= 0.1;
              return (
                <>
                  <tr key={r.equipoId} className="border-t border-[#F4F4F5] hover:bg-[#FAFAFA]">
                    <td className="px-3 py-1.5 font-mono font-bold text-[#09090B]">{r.equipoId}</td>
                    <td className="px-3 py-1.5 text-[#71717A] text-[12px]">{r.modelo}</td>
                    <Num value={r.dfm} onChange={(v) => patch(idx, { dfm: v })} label={`DFM ${r.equipoId}`} />
                    <Num value={r.tmef} onChange={(v) => patch(idx, { tmef: v })} label={`TMEF ${r.equipoId}`} />
                    <Num value={r.tmpr} onChange={(v) => patch(idx, { tmpr: v })} label={`TMPR ${r.equipoId}`} />
                    <Num value={r.tiempoOperativo} onChange={(v) => patch(idx, { tiempoOperativo: v })} label={`Tiempo Op. ${r.equipoId}`} />
                    <Num value={r.reserva} onChange={(v) => patch(idx, { reserva: v })} label={`Reserva ${r.equipoId}`} />
                    <Num value={r.horasAcumuladas} onChange={(v) => patch(idx, { horasAcumuladas: v })} step={1} label={`Horas ${r.equipoId}`} />
                    <td className="px-1 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={r.paroTotal}
                        onChange={(e) => patch(idx, { paroTotal: e.target.checked, motivoParo: e.target.checked ? r.motivoParo : "" })}
                        className="cursor-pointer accent-red-600"
                        title={r.paroTotal ? "Equipo en paro total" : "Marcar paro total"}
                      />
                    </td>
                    <Num value={r.pctOperativo}     onChange={(v) => patch(idx, { pctOperativo: v })} label={`ASARCO Op. ${r.equipoId}`} />
                    <Num value={r.pctReserva}       onChange={(v) => patch(idx, { pctReserva: v })} label={`ASARCO Rsv. ${r.equipoId}`} />
                    <Num value={r.pctDetProgramada} onChange={(v) => patch(idx, { pctDetProgramada: v })} label={`ASARCO DP ${r.equipoId}`} />
                    <Num value={r.pctDetNoProg}     onChange={(v) => patch(idx, { pctDetNoProg: v })} label={`ASARCO DNP ${r.equipoId}`} />
                    <Num value={r.pctPerdidaOp}     onChange={(v) => patch(idx, { pctPerdidaOp: v })} label={`ASARCO PO ${r.equipoId}`} />
                    <td className={clsx("px-1.5 py-1.5 text-right font-mono text-[12px]", sumOk ? "text-[#15803D]" : "text-[#B91C1C] font-bold")}>
                      {suma.toFixed(1)}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => guardarFila(idx)}
                        disabled={r.status === "saving"}
                        className={clsx(
                          "inline-flex items-center justify-center w-7 h-7 rounded-[5px] text-[11px] font-bold",
                          r.status === "ok"      && "bg-[#F0FDF4] text-[#15803D]",
                          r.status === "error"   && "bg-[#FEF2F2] text-[#B91C1C]",
                          r.status === "saving"  && "bg-[#FFFBEB] text-[#B45309]",
                          r.status === "idle"    && "bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]"
                        )}
                        title={r.errorMsg ?? "Guardar fila"}
                      >
                        {r.status === "saving" ? "…" : r.status === "ok" ? "✓" : r.status === "error" ? "!" : <Save size={11} />}
                      </button>
                    </td>
                  </tr>

                  {/* Fila expandida: motivo de paro (visible solo si paroTotal = true) */}
                  {r.paroTotal && (
                    <tr key={`${r.equipoId}-paro`} className="bg-[#FEF2F2] border-t border-[#FECACA]">
                      <td colSpan={16} className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={12} className="text-[#B91C1C] shrink-0" />
                          <span className="text-[11px] font-semibold text-[#B91C1C] uppercase tracking-wider shrink-0">
                            Motivo de paro:
                          </span>
                          <input
                            type="text"
                            value={r.motivoParo}
                            onChange={(e) => patch(idx, { motivoParo: e.target.value })}
                            placeholder="Ej: Bomba hidráulica HPN-2847 — falla en sello"
                            className="flex-1 px-2.5 py-1 rounded-[4px] bg-white border border-[#FECACA] focus:border-[#B91C1C] focus:outline-none text-[12px] text-[#09090B]"
                          />
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Fila de error inline */}
                  {r.status === "error" && r.errorMsg && (
                    <tr key={`${r.equipoId}-err`} className="bg-[#FEF2F2]">
                      <td colSpan={16} className="px-3 py-1.5">
                        <p className="text-[11px] text-[#B91C1C]">{r.errorMsg}</p>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-[#A1A1AA]">
        Σ = suma de los 5 segmentos ASARCO (debe ser 100% ± 0.1). Op = Operativo, Rsv = Reserva, DP = Det. Programada,
        DNP = Det. No Programada, PO = Pérdida Operacional. El motivo de paro es obligatorio cuando se marca Paro.
      </p>
    </div>
  );
}

function Num({
  value,
  onChange,
  step = 0.1,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  label?: string;
}) {
  return (
    <td className="px-1 py-1">
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        aria-label={label}
        className="w-[58px] px-1.5 py-1 rounded-[4px] bg-white border border-[#E4E4E7] focus:border-[#B45309] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#B45309] text-right text-[12px] font-mono"
      />
    </td>
  );
}
