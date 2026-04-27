"use client";

import { useState, useTransition } from "react";
import { CsvUploader } from "@/components/apd/CsvUploader";
import { ApdParameterTable } from "@/components/apd/ApdParameterTable";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useCsvApd } from "@/hooks/useCsvApd";
import { AlertTriangle, Info, Database, Trash2, History, CheckCircle2 } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import type { Periodo } from "@/lib/db/schema";
import type { AnalisisApdResumen } from "@/lib/db/queries/apd";
import { subirAnalisisApd, eliminarAnalisisApd } from "@/lib/db/actions/apd";
import { clsx } from "clsx";

export function ApdClient({
  periodos,
  analisis,
}: {
  periodos: Periodo[];
  analisis: AnalisisApdResumen[];
}) {
  const { estado, datos, nombreArchivo, contenidoRaw, error, procesarArchivo, limpiar } = useCsvApd();
  const [periodoId, setPeriodoId] = useState<number>(periodos[0]?.id ?? 0);
  const [fechaAnalisis, setFechaAnalisis] = useState(new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const criticos     = datos.filter((p) => p.estado === "rojo").length;
  const advertencias = datos.filter((p) => p.estado === "ambar").length;

  function guardarEnBD() {
    if (!nombreArchivo || !contenidoRaw || !periodoId) return;
    setMsg(null);
    startTransition(async () => {
      const r = await subirAnalisisApd({
        periodoId,
        fechaAnalisis,
        archivoOrigen: nombreArchivo,
        csvContent:    contenidoRaw,
        creadoPor:     "admin",
      });
      if (r.ok) {
        setMsg({ type: "ok", text: `Análisis guardado: ${r.data?.muestras} muestras (${r.data?.estados.rojo} en rojo, ${r.data?.estados.ambar} en ámbar).` });
        limpiar();
      } else {
        setMsg({ type: "error", text: r.error });
      }
    });
  }

  function borrarAnalisis(id: number) {
    if (!confirm("¿Eliminar este análisis y todas sus muestras?")) return;
    startTransition(async () => {
      const r = await eliminarAnalisisApd(id);
      if (r.ok) setMsg({ type: "ok", text: "Análisis eliminado." });
      else      setMsg({ type: "error", text: r.error });
    });
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto">
      <SectionTitle>
        <Tooltip short="Análisis Predictivo por Aceites — detecta desgaste antes de la falla" help={HELP.navApd}>
          APD — Análisis Predictivo de Aceites
        </Tooltip>
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        <div className="flex flex-col gap-4">
          <CsvUploader
            onArchivo={procesarArchivo}
            nombreArchivo={nombreArchivo}
            onLimpiar={limpiar}
            estado={estado}
          />

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-[9px] bg-[#FEF2F2] border border-[#FECACA]">
              <AlertTriangle size={15} className="text-[#B91C1C] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#991B1B] leading-relaxed">{error}</p>
            </div>
          )}

          {estado === "done" && (
            <div className="flex flex-col gap-2.5 p-4 rounded-[10px] bg-[#FAFAFA] border border-[#E4E4E7]">
              <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em] mb-1">
                Resumen del análisis
              </p>
              {[
                { label: "Total parámetros", valor: datos.length,   color: "#09090B" },
                { label: "Fuera de rango",   valor: criticos,        color: "#B91C1C" },
                { label: "En advertencia",   valor: advertencias,    color: "#B45309" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#71717A]">{s.label}</span>
                  <span className="font-mono font-bold text-[15px]" style={{ color: s.color }}>{s.valor}</span>
                </div>
              ))}
            </div>
          )}

          {estado === "done" && (
            <div className="flex flex-col gap-2.5 p-4 rounded-[10px] bg-[#FFFBEB] border border-[#FDE68A]">
              <p className="text-[10px] font-bold text-[#92400E] uppercase tracking-[0.08em] inline-flex items-center gap-1.5">
                <Database size={11} /> Guardar en base de datos
              </p>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717A]">Período</span>
                <select
                  value={periodoId}
                  onChange={(e) => setPeriodoId(Number(e.target.value))}
                  className="px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[12px]"
                >
                  {periodos.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717A]">Fecha del análisis</span>
                <input
                  type="date"
                  value={fechaAnalisis}
                  onChange={(e) => setFechaAnalisis(e.target.value)}
                  className="px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[12px]"
                />
              </label>
              <button
                onClick={guardarEnBD}
                disabled={pending}
                className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#27272A] disabled:opacity-50 text-white text-[12px] font-semibold"
              >
                <Database size={13} /> {pending ? "Guardando…" : "Guardar análisis"}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 p-4 rounded-[10px] bg-[#FAFAFA] border border-[#E4E4E7]">
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-[#A1A1AA]" />
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.08em]">
                Formato CSV esperado
              </span>
            </div>
            <pre className="text-[10px] text-[#52525B] font-mono whitespace-pre-wrap leading-relaxed">
{`Equipo,Compartimento,Parámetro,Valor,Unidad,LimMin,LimMax
CH-01,Motor,Fe,18,ppm,,30
CH-01,Motor,Cu,5,ppm,,20
CH-01,Transmisión,Fe,25,ppm,,40`}
            </pre>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {msg && (
            <div className={clsx(
              "flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] text-[12px]",
              msg.type === "ok"
                ? "bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]"
                : "bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]"
            )}>
              {msg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {msg.text}
            </div>
          )}

          {estado === "idle" && (
            <div className="flex flex-col items-center justify-center h-64 rounded-[10px] bg-white border border-dashed border-[#E4E4E7] gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                <Info size={18} className="text-[#A1A1AA]" />
              </div>
              <p className="text-[12px] text-[#A1A1AA] text-center max-w-[260px] leading-relaxed">
                Sube un CSV para previsualizar y guardar en la base de datos
              </p>
            </div>
          )}
          {estado === "parsing" && (
            <div className="flex flex-col items-center justify-center h-64 rounded-[10px] bg-white border border-[#FDE68A] gap-3">
              <div className="w-8 h-8 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-[#B45309]/80">Procesando archivo…</p>
            </div>
          )}
          {estado === "done" && <ApdParameterTable datos={datos} />}
          {estado === "error" && (
            <div className="flex items-center justify-center h-64 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA]">
              <p className="text-[13px] text-[#991B1B]">No se pudo procesar el archivo</p>
            </div>
          )}

          {/* Histórico */}
          {analisis.length > 0 && (
            <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
              <div className="px-4 py-2.5 bg-[#FAFAFA] border-b border-[#E4E4E7] inline-flex items-center gap-2 w-full">
                <History size={13} className="text-[#71717A]" />
                <span className="text-[11px] font-bold text-[#52525B] uppercase tracking-wider">Análisis cargados</span>
                <span className="ml-auto text-[10px] font-mono text-[#A1A1AA]">{analisis.length}</span>
              </div>
              <table className="w-full text-[11px]">
                <thead className="bg-white border-b border-[#F4F4F5]">
                  <tr className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">
                    <th className="px-3 py-1.5 text-left">Fecha</th>
                    <th className="px-3 py-1.5 text-left">Período</th>
                    <th className="px-3 py-1.5 text-left">Archivo</th>
                    <th className="px-3 py-1.5 text-right">Muestras</th>
                    <th className="px-3 py-1.5 text-right">Rojas / Ámbar</th>
                    <th className="px-3 py-1.5 text-right">Por</th>
                    <th className="px-3 py-1.5 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {analisis.map((a) => (
                    <tr key={a.id} className="border-t border-[#F4F4F5]">
                      <td className="px-3 py-1.5 font-mono text-[#52525B]">{a.fechaAnalisis}</td>
                      <td className="px-3 py-1.5 text-[#71717A]">{a.periodoLabel}</td>
                      <td className="px-3 py-1.5 text-[#52525B] font-medium truncate max-w-[180px]">{a.archivoOrigen}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{a.totalMuestras}</td>
                      <td className="px-3 py-1.5 text-right font-mono">
                        <span className="text-[#B91C1C]">{a.enRojo}</span>
                        <span className="text-[#A1A1AA] mx-1">/</span>
                        <span className="text-[#B45309]">{a.enAmbar}</span>
                      </td>
                      <td className="px-3 py-1.5 text-right text-[#A1A1AA]">{a.creadoPor ?? "—"}</td>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          onClick={() => borrarAnalisis(a.id)}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-[4px] text-[#A1A1AA] hover:text-[#B91C1C] hover:bg-[#FEF2F2]"
                          title="Eliminar"
                        >
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
