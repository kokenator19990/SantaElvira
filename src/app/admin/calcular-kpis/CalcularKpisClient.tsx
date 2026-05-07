"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Save, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { clsx } from "clsx";
import { previewKpisDesdeRegistros, guardarKpisDesdeRegistros } from "@/lib/db/actions/calcular-kpis";
import type { KpiCalculado } from "@/lib/domain/calcular-kpis";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import type { Periodo } from "@/lib/db/schema";

interface Props {
  periodos: Periodo[];
}

export function CalcularKpisClient({ periodos }: Props) {
  const [periodoId, setPeriodoId] = useState(periodos[0]?.id ?? 0);
  const [preview, setPreview] = useState<KpiCalculado[] | null>(null);
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [diasEnMes, setDiasEnMes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error" | "warn"; text: string } | null>(null);

  async function handlePreview() {
    setLoading(true);
    setMsg(null);
    setPreview(null);

    const result = await previewKpisDesdeRegistros(periodoId);
    if (!result.ok) {
      setMsg({ type: "error", text: result.error });
      setAdvertencias([]);
      setDiasEnMes(0);
    } else {
      setPreview(result.data!.kpis);
      setAdvertencias(result.data!.advertencias);
      setDiasEnMes(result.data!.diasEnMes);
    }
    setLoading(false);
  }

  async function handleGuardar() {
    setSaving(true);
    setMsg(null);

    const result = await guardarKpisDesdeRegistros(periodoId);
    if (!result.ok) {
      setMsg({ type: "error", text: result.error });
    } else {
      setMsg({
        type: "ok",
        text: `${result.data!.equiposGuardados} equipo(s) actualizados, ${result.data!.alertasCreadas} alerta(s) generadas.`,
      });
    }
    setSaving(false);
  }

  const periodoLabel = periodos.find((p) => p.id === periodoId)?.label ?? "";

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[13px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Admin
        </Link>
      </div>

      <SectionTitle>
        <Tooltip short="Genera KPIs automáticamente desde los registros diarios y fallas" help={HELP.calcularKpis}>
          Calcular KPIs desde Datos Crudos
        </Tooltip>
      </SectionTitle>

      <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-[8px] bg-[#F5F3FF] border border-[#DDD6FE]">
        <Info size={14} className="text-[#7C3AED] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#5B21B6]">
          Este módulo toma los registros diarios de horas y los eventos de falla del período seleccionado,
          y calcula automáticamente DFM, TMEF, TMPR, Tiempo Operativo, Reserva y la distribución ASARCO.
          Los resultados se guardan en las mismas tablas que la carga manual — no hay diferencia para el dashboard.
        </p>
      </div>

      {/* Selector de período + botón */}
      <div className="flex items-center gap-3 p-3 rounded-[10px] bg-white border border-[#E4E4E7] flex-wrap">
        <select
          value={periodoId}
          onChange={(e) => { setPeriodoId(Number(e.target.value)); setPreview(null); setMsg(null); }}
          className="px-2.5 py-2 rounded-[6px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#7C3AED]"
        >
          {periodos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}{!p.cerrado ? " (actual)" : ""}
            </option>
          ))}
        </select>

        <button
          onClick={handlePreview}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-[13px] font-semibold"
        >
          <Calculator size={13} /> {loading ? "Calculando…" : "Vista previa"}
        </button>

        {preview && (
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] disabled:opacity-50 text-white text-[13px] font-semibold"
          >
            <Save size={13} /> {saving ? "Guardando…" : "Guardar KPIs + Alertas"}
          </button>
        )}
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

      {/* Advertencias */}
      {advertencias.length > 0 && (
        <div className="flex flex-col gap-1 px-3.5 py-2.5 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A]">
          <span className="text-[12px] font-semibold text-[#92400E]">Advertencias ({advertencias.length})</span>
          {advertencias.map((a, i) => (
            <p key={i} className="text-[12px] text-[#92400E]">• {a}</p>
          ))}
        </div>
      )}

      {/* Tabla de preview */}
      {preview && (
        <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA]">
                <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">Equipo</th>
                <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">Días</th>
                <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#15803D]">DFM %</th>
                <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]">TMEF h</th>
                <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">TMPR h</th>
                <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#B45309]">T.Op %</th>
                <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Res %</th>
                <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">Fallas</th>
                <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5]">
              {preview.map((k) => (
                <tr key={k.equipoId} className={clsx(k.paroTotal && "bg-[#FEF2F2]")}>
                  <td className="px-3 py-2 font-mono font-bold text-[#09090B]">{k.equipoId}</td>
                  <td className="px-2 py-2 text-center">
                    <span className={clsx(
                      "font-mono",
                      k.diasConRegistro < diasEnMes * 0.8 ? "text-[#B45309]" : "text-[#52525B]"
                    )}>
                      {k.diasConRegistro}/{diasEnMes}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center font-mono font-bold text-[#15803D]">{k.dfm}</td>
                  <td className="px-2 py-2 text-center font-mono font-bold text-[#1D4ED8]">{k.tmef}</td>
                  <td className="px-2 py-2 text-center font-mono font-bold text-[#B91C1C]">{k.tmpr}</td>
                  <td className="px-2 py-2 text-center font-mono font-bold text-[#B45309]">{k.tiempoOperativo}</td>
                  <td className="px-2 py-2 text-center font-mono font-bold text-[#71717A]">{k.reserva}</td>
                  <td className="px-2 py-2 text-center font-mono text-[#52525B]">{k.totalFallas}</td>
                  <td className="px-2 py-2 text-center">
                    {k.paroTotal ? (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-[3px] bg-[#FEF2F2] text-[#B91C1C] font-semibold">PARO</span>
                    ) : (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-[3px] bg-[#F0FDF4] text-[#15803D] font-semibold">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-start gap-2 text-[11px] text-[#A1A1AA]">
        <Info size={12} className="shrink-0 mt-0.5" />
        <p>
          Al guardar, los KPIs calculados se escriben en las mismas tablas que la carga manual ({periodoLabel}).
          Las alertas se regeneran automáticamente según los umbrales configurados.
          El dashboard se actualiza en la próxima carga de página.
        </p>
      </div>
    </div>
  );
}
