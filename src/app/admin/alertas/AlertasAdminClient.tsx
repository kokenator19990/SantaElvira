"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import type { Periodo } from "@/lib/db/schema";
import { regenerarAlertasPeriodo } from "@/lib/db/actions/kpis";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

export function AlertasAdminClient({ periodos }: { periodos: Periodo[] }) {
  const [periodoId, setPeriodoId] = useState(periodos[0]?.id ?? 0);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function regenerar() {
    setMsg(null);
    startTransition(async () => {
      const r = await regenerarAlertasPeriodo(periodoId);
      if (r.ok) setMsg({ type: "ok", text: `Alertas regeneradas: ${r.data?.creadas ?? 0}.` });
      else setMsg({ type: "error", text: r.error });
    });
  }

  return (
    <div className="flex flex-col gap-5 max-w-[700px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[13px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Admin
        </Link>
      </div>
      <SectionTitle>
        <Tooltip short="Recalcula alertas según KPIs y umbrales vigentes" help={HELP.adminAlertas}>
          Regenerar Alertas
        </Tooltip>
      </SectionTitle>

      <div className="p-4 rounded-[10px] bg-white border border-[#E4E4E7] flex flex-col gap-3">
        <p className="text-[13px] text-[#52525B] leading-relaxed">
          Recalcula las alertas del período según los KPIs cargados y los umbrales actuales.
          Borra las alertas anteriores del período y reinserta. Útil después de:
        </p>
        <ul className="text-[13px] text-[#71717A] list-disc pl-5 space-y-1">
          <li>Cargar KPIs nuevos (auto se regenera al guardar, pero puedes forzarlo)</li>
          <li>Cambiar los umbrales en la tabla <code className="text-[11px] font-mono bg-[#F4F4F5] px-1 rounded">umbral_kpi</code></li>
          <li>Marcar/desmarcar paros</li>
        </ul>

        <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-[#F4F4F5]">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#71717A] uppercase">Período</span>
            <select
              value={periodoId}
              onChange={(e) => setPeriodoId(Number(e.target.value))}
              className="px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[13px]"
            >
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <button
            onClick={regenerar}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] disabled:opacity-50 text-white text-[13px] font-semibold"
          >
            <RefreshCw size={13} className={pending ? "animate-spin" : ""} /> Regenerar
          </button>
        </div>
      </div>

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
    </div>
  );
}
