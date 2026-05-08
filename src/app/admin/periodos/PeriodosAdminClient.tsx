"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Lock, Unlock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import type { Periodo } from "@/lib/db/schema";
import { crearPeriodo, cerrarPeriodo } from "@/lib/db/actions/kpis";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HELP } from "@/lib/help-content";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function PeriodosAdminClient({ periodos }: { periodos: Periodo[] }) {
  const now = new Date();
  const [anio, setAnio] = useState(now.getFullYear());
  const [mes, setMes]   = useState(now.getMonth() + 1);
  const [msg, setMsg]   = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<{ periodo: Periodo; accion: "cerrar" | "reabrir" } | null>(null);

  function handle(p: Promise<{ ok: boolean; error?: string }>, okText: string) {
    setMsg(null);
    startTransition(async () => {
      const r = await p;
      if (r.ok) setMsg({ type: "ok", text: okText });
      else setMsg({ type: "error", text: r.error ?? "Error" });
    });
  }

  return (
    <div className="flex flex-col gap-5 max-w-[800px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[13px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Admin
        </Link>
      </div>
      <SectionTitle>
        <Tooltip short="Calendario de meses con datos" help={HELP.adminPeriodos}>
          Períodos
        </Tooltip>
      </SectionTitle>

      {msg && (
        <div className={clsx(
          "flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] text-[13px]",
          msg.type === "ok"
            ? "bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]"
            : "bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]"
        )}>
          {msg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {msg.text}
        </div>
      )}

      <div className="p-4 rounded-[10px] bg-white border border-[#E4E4E7]">
        <p className="text-[13px] font-semibold text-[#09090B] mb-3">Crear nuevo período</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#71717A] uppercase">Año</span>
            <input
              type="number"
              value={anio}
              onChange={(e) => { const v = parseInt(e.target.value); if (Number.isFinite(v) && v >= 1990 && v <= 2099) setAnio(v); }}
              className="w-[90px] px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[13px] font-mono"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#71717A] uppercase">Mes</span>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[13px]"
            >
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </label>
          <button
            onClick={() => handle(crearPeriodo({ anio, mes }), `Período ${MESES[mes - 1]} ${anio} creado.`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#09090B] hover:bg-[#27272A] text-white text-[13px] font-semibold"
          >
            <Plus size={12} /> Crear
          </button>
        </div>
      </div>

      <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
            <tr className="text-[11px] uppercase tracking-wider text-[#71717A]">
              <th className="px-3 py-2 text-left">Período</th>
              <th className="px-3 py-2 text-right">Año / Mes</th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((p) => (
              <tr key={p.id} className="border-t border-[#F4F4F5]">
                <td className="px-3 py-2 font-medium text-[#09090B]">{p.label}</td>
                <td className="px-3 py-2 text-right font-mono text-[#71717A]">{p.anio}-{String(p.mes).padStart(2, "0")}</td>
                <td className="px-3 py-2 text-center">
                  {p.cerrado ? (
                    <span className="text-[11px] font-bold text-[#71717A] bg-[#F4F4F5] px-2 py-0.5 rounded inline-flex items-center gap-1">
                      <Lock size={10} /> Cerrado
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded inline-flex items-center gap-1">
                      <Unlock size={10} /> Abierto
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => setConfirmAction({ periodo: p, accion: p.cerrado ? "reabrir" : "cerrar" })}
                    className="px-2 py-0.5 rounded-[4px] bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[11px] font-medium text-[#52525B]"
                  >
                    {p.cerrado ? "Reabrir" : "Cerrar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        titulo={confirmAction?.accion === "cerrar" ? "Cerrar período" : "Reabrir período"}
        mensaje={
          confirmAction?.accion === "cerrar"
            ? `Al cerrar "${confirmAction.periodo.label}" no se podrán editar KPIs ni registros de ese mes. Puedes reabrirlo después si es necesario.`
            : `Al reabrir "${confirmAction?.periodo.label}" se permitirá editar los datos de ese período nuevamente. Las alertas ya generadas permanecerán sin cambios — recuerda regenerarlas desde la página de KPIs después de modificar datos.`
        }
        textoConfirmar={confirmAction?.accion === "cerrar" ? "Cerrar período" : "Reabrir período"}
        variante={confirmAction?.accion === "cerrar" ? "advertencia" : "advertencia"}
        onConfirm={() => {
          if (!confirmAction) return;
          handle(
            cerrarPeriodo(confirmAction.periodo.id, !confirmAction.periodo.cerrado),
            `${confirmAction.periodo.label} ${confirmAction.accion === "cerrar" ? "cerrado" : "reabierto"}.`
          );
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
