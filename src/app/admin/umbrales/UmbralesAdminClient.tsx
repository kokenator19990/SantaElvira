"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { clsx } from "clsx";
import { actualizarUmbral } from "@/lib/db/actions/umbrales";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const KPI_META: Record<string, { label: string; unidad: string; descripcion: string }> = {
  dfm:             { label: "DFM",             unidad: "%", descripcion: "Disponibilidad Física Mecánica. Mayor es mejor." },
  tmef:            { label: "TMEF",            unidad: "h", descripcion: "Tiempo Medio Entre Fallas. Mayor es mejor." },
  tmpr:            { label: "TMPR",            unidad: "h", descripcion: "Tiempo Medio de Parada. Menor es mejor (invertido)." },
  tiempoOperativo: { label: "Tiempo Operativo",unidad: "%", descripcion: "Porcentaje del turno en operación. Mayor es mejor." },
  reserva:         { label: "Reserva",         unidad: "%", descripcion: "Porcentaje del turno en reserva. Menor es mejor (invertido)." },
};

interface UmbralRow {
  kpi: string;
  nivelVerde: number;
  nivelAmbar: number;
  invertido: boolean;
  status: "idle" | "saving" | "ok" | "error";
  errorMsg?: string;
}

interface Props {
  umbrales: { kpi: string; nivelVerde: string; nivelAmbar: string; invertido: boolean }[];
  hayDatosBd: boolean;
}

export function UmbralesAdminClient({ umbrales, hayDatosBd }: Props) {
  const [rows, setRows] = useState<UmbralRow[]>(() =>
    umbrales.map((u) => {
      const nv = parseFloat(u.nivelVerde);
      const na = parseFloat(u.nivelAmbar);
      return {
        kpi:        u.kpi,
        nivelVerde: Number.isFinite(nv) ? nv : 0,
        nivelAmbar: Number.isFinite(na) ? na : 0,
        invertido:  u.invertido,
        status:     "idle" as const,
      };
    })
  );
  const [globalMsg, setGlobalMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function patch(idx: number, p: Partial<UmbralRow>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...p } : r)));
  }

  async function guardarFila(idx: number): Promise<{ ok: boolean; error?: string }> {
    const r = rows[idx];
    patch(idx, { status: "saving", errorMsg: undefined });

    const result = await actualizarUmbral({
      kpi:        r.kpi,
      nivelVerde: r.nivelVerde,
      nivelAmbar: r.nivelAmbar,
      invertido:  r.invertido,
    });

    if (!result.ok) {
      patch(idx, { status: "error", errorMsg: result.error });
      return { ok: false, error: result.error };
    }
    patch(idx, { status: "ok" });
    return { ok: true };
  }

  async function guardarTodo() {
    setGlobalMsg(null);
    const errores: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const result = await guardarFila(i);
      if (!result.ok) errores.push(`${rows[i].kpi}: ${result.error ?? "Error"}`);
    }
    if (errores.length > 0) {
      setGlobalMsg({ type: "error", text: `${errores.length} error(es): ${errores[0]}` });
    } else {
      setGlobalMsg({ type: "ok", text: "Umbrales guardados. Los cambios aplican al próximo cálculo de alertas." });
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-[800px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[13px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Admin
        </Link>
      </div>

      <SectionTitle>
        <Tooltip short="Modificar los valores de referencia para cada KPI" help={HELP.adminUmbrales}>
          Configurar Umbrales de KPI
        </Tooltip>
      </SectionTitle>

      {!hayDatosBd && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A]">
          <Info size={14} className="text-[#B45309] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#92400E]">
            No hay umbrales guardados en base de datos. Se muestran los valores del código.
            Al guardar, estos valores se persistirán en la tabla <code className="font-mono">umbral_kpi</code>.
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 rounded-[10px] bg-white border border-[#E4E4E7]">
        <button
          onClick={guardarTodo}
          className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] text-white text-[13px] font-semibold"
        >
          <Save size={13} /> Guardar todos
        </button>
      </div>

      {globalMsg && (
        <div className={clsx(
          "flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] text-[13px]",
          globalMsg.type === "ok" ? "bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]" : "bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]"
        )}>
          {globalMsg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {globalMsg.text}
        </div>
      )}

      {/* Tabla de umbrales */}
      <div className="flex flex-col gap-3">
        {rows.map((r, idx) => {
          const meta = KPI_META[r.kpi] ?? { label: r.kpi, unidad: "", descripcion: "" };
          return (
            <div key={r.kpi} className={clsx(
              "p-4 rounded-[10px] bg-white border transition-colors",
              r.status === "ok"    ? "border-[#BBF7D0]" :
              r.status === "error" ? "border-[#FECACA]" : "border-[#E4E4E7]"
            )}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Tooltip short={HELP[r.kpi === "tiempoOperativo" ? "tiempoOperativo" : r.kpi]?.titulo ?? meta.label} help={HELP[r.kpi === "tiempoOperativo" ? "tiempoOperativo" : r.kpi]}>
                      <span className="text-[14px] font-bold text-[#09090B] cursor-help">{meta.label}</span>
                    </Tooltip>
                    {r.invertido && (
                      <Tooltip short="KPI invertido: el valor más bajo es el deseado" help={HELP.invertido}>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-[3px] bg-[#F4F4F5] text-[#71717A] font-mono cursor-help">invertido</span>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-[12px] text-[#71717A]">{meta.descripcion}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Umbral Verde */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-[#15803D] uppercase tracking-wider">Verde {r.invertido ? "≤" : "≥"}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={r.nivelVerde}
                        onChange={(e) => patch(idx, { nivelVerde: parseFloat(e.target.value) || 0, status: "idle" })}
                        className="w-[70px] px-2 py-1.5 rounded-[6px] border border-[#BBF7D0] bg-[#F0FDF4] focus:border-[#15803D] focus:outline-none text-right text-[13px] font-mono font-bold text-[#15803D]"
                      />
                      <span className="text-[11px] text-[#71717A]">{meta.unidad}</span>
                    </div>
                  </div>

                  {/* Umbral Ámbar */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-[#B45309] uppercase tracking-wider">Ámbar {r.invertido ? "≤" : "≥"}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={r.nivelAmbar}
                        onChange={(e) => patch(idx, { nivelAmbar: parseFloat(e.target.value) || 0, status: "idle" })}
                        className="w-[70px] px-2 py-1.5 rounded-[6px] border border-[#FDE68A] bg-[#FFFBEB] focus:border-[#B45309] focus:outline-none text-right text-[13px] font-mono font-bold text-[#B45309]"
                      />
                      <span className="text-[11px] text-[#71717A]">{meta.unidad}</span>
                    </div>
                  </div>

                  {/* Botón guardar fila */}
                  <button
                    onClick={() => guardarFila(idx)}
                    disabled={r.status === "saving"}
                    className={clsx(
                      "flex items-center justify-center w-8 h-8 rounded-[6px] self-end transition-colors",
                      r.status === "ok"     ? "bg-[#F0FDF4] text-[#15803D]" :
                      r.status === "error"  ? "bg-[#FEF2F2] text-[#B91C1C]" :
                      r.status === "saving" ? "bg-[#FFFBEB] text-[#B45309]" :
                      "bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]"
                    )}
                    title={r.errorMsg ?? "Guardar umbral"}
                  >
                    {r.status === "saving" ? "…" : r.status === "ok" ? "✓" : r.status === "error" ? "!" : <Save size={12} />}
                  </button>
                </div>
              </div>

              {r.status === "error" && r.errorMsg && (
                <p className="text-[11px] text-[#B91C1C] mt-2">{r.errorMsg}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 text-[11px] text-[#A1A1AA]">
        <Info size={12} className="shrink-0 mt-0.5" />
        <p>
          Los cambios se guardan con versionado. El historial de umbrales anteriores se conserva en base de datos.
          Después de cambiar umbrales, ve a Admin → KPIs → Regenerar alertas para que el semáforo refleje los nuevos valores.
        </p>
      </div>
    </div>
  );
}
