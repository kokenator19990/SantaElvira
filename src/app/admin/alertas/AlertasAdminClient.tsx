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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function AlertasAdminClient({ periodos }: { periodos: Periodo[] }) {
  const [periodoId, setPeriodoId] = useState(periodos[0]?.id ?? 0);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function regenerar() {
    setShowConfirm(false);
    setMsg(null);
    startTransition(async () => {
      const r = await regenerarAlertasPeriodo(periodoId);
      if (r.ok) {
        const n = r.data?.creadas ?? 0;
        setMsg({ type: "ok", text: n > 0 ? `Se generaron ${n} alerta${n !== 1 ? "s" : ""} para el período seleccionado.` : "No se generaron alertas — todos los equipos están dentro de los umbrales." });
      }
      else setMsg({ type: "error", text: r.error });
    });
  }

  const periodoLabel = periodos.find((p) => p.id === periodoId)?.label ?? "seleccionado";

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
          Recalcula las alertas del período seleccionado comparando los KPIs de cada equipo contra los umbrales vigentes.
          Las alertas anteriores no resueltas se reemplazan con las nuevas. Usa esta función después de:
        </p>
        <ul className="text-[13px] text-[#71717A] list-disc pl-5 space-y-1">
          <li>Cargar o recalcular KPIs (normalmente se regeneran automáticamente, pero puedes forzarlo)</li>
          <li>Modificar los umbrales desde <Link href="/admin/umbrales" className="text-[#B45309] hover:underline">Configurar Umbrales</Link></li>
          <li>Marcar o desmarcar equipos en paro total</li>
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
            onClick={() => setShowConfirm(true)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] disabled:opacity-50 text-white text-[13px] font-semibold"
          >
            <RefreshCw size={13} className={pending ? "animate-spin" : ""} /> {pending ? "Regenerando..." : "Regenerar"}
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

      <ConfirmDialog
        open={showConfirm}
        titulo="Regenerar alertas"
        mensaje={`Se recalcularán las alertas del período "${periodoLabel}". Las alertas no resueltas actuales de KPIs se reemplazarán con las nuevas según los umbrales vigentes. Las alertas ya resueltas se conservan.`}
        textoConfirmar="Regenerar"
        variante="advertencia"
        onConfirm={regenerar}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
