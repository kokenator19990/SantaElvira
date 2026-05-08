"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle2, AlertTriangle, FileText, Save } from "lucide-react";
import { clsx } from "clsx";
import type { Periodo } from "@/lib/db/schema";
import { upsertKpiYAsarcoEquipo, regenerarAlertasPeriodo } from "@/lib/db/actions/kpis";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

/**
 * Formato del CSV esperado (con cabecera):
 * equipoId,dfm,tmef,tmpr,tiempoOperativo,reserva,horasAcumuladas,paroTotal,motivoParo,
 * pctOperativo,pctReserva,pctDetProgramada,pctDetNoProg,pctPerdidaOp
 */

interface FilaParseada {
  equipoId: string;
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
  // Estado UI
  status: "pendiente" | "ok" | "error";
  errorMsg?: string;
}

interface ErrorLinea {
  linea: number;
  msg: string;
}

function parsearCsv(texto: string, equiposValidos: Set<string>): { filas: FilaParseada[]; errores: ErrorLinea[] } {
  const lineas = texto.trim().split(/\r?\n/);
  const filas: FilaParseada[] = [];
  const errores: ErrorLinea[] = [];

  // Saltar cabecera
  const inicio = lineas[0]?.toLowerCase().startsWith("equipoid") ? 1 : 0;

  for (let i = inicio; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    if (!linea) continue;

    const cols = linea.split(",").map((c) => c.trim());
    if (cols.length < 14) {
      errores.push({ linea: i + 1, msg: `Solo ${cols.length} columnas (se esperan 14)` });
      continue;
    }

    const [
      equipoId, dfmS, tmefS, tmprS, topS, resS, horasS,
      paroS, motivo, opS, rsvS, dpS, dnpS, poS,
    ] = cols;

    if (!equiposValidos.has(equipoId)) {
      errores.push({ linea: i + 1, msg: `Equipo "${equipoId}" no existe en la BD` });
      continue;
    }

    const n = (s: string, campo: string): number | null => {
      const v = parseFloat(s);
      if (isNaN(v)) { errores.push({ linea: i + 1, msg: `"${campo}" no es un número: "${s}"` }); return null; }
      return v;
    };

    const dfm             = n(dfmS,  "dfm");
    const tmef            = n(tmefS, "tmef");
    const tmpr            = n(tmprS, "tmpr");
    const tiempoOperativo = n(topS,  "tiempoOperativo");
    const reserva         = n(resS,  "reserva");
    const horasAcumuladas = n(horasS,"horasAcumuladas");
    const pctOperativo    = n(opS,   "pctOperativo");
    const pctReserva      = n(rsvS,  "pctReserva");
    const pctDetProg      = n(dpS,   "pctDetProgramada");
    const pctDetNoProg    = n(dnpS,  "pctDetNoProg");
    const pctPerdidaOp    = n(poS,   "pctPerdidaOp");

    if ([dfm, tmef, tmpr, tiempoOperativo, reserva, horasAcumuladas, pctOperativo, pctReserva, pctDetProg, pctDetNoProg, pctPerdidaOp].some((v) => v === null)) continue;

    const paroTotal = paroS?.toLowerCase() === "true" || paroS === "1";
    if (paroTotal && !motivo?.trim()) {
      errores.push({ linea: i + 1, msg: `paroTotal=true pero motivoParo está vacío` });
      continue;
    }

    const suma = (pctOperativo! + pctReserva! + pctDetProg! + pctDetNoProg! + pctPerdidaOp!);
    if (Math.abs(suma - 100) > 0.5) {
      errores.push({ linea: i + 1, msg: `ASARCO suma ${suma.toFixed(1)}% (debe ser 100%)` });
      continue;
    }

    filas.push({
      equipoId,
      dfm: dfm!, tmef: tmef!, tmpr: tmpr!, tiempoOperativo: tiempoOperativo!, reserva: reserva!,
      horasAcumuladas: Math.round(horasAcumuladas!),
      paroTotal, motivoParo: motivo ?? "",
      pctOperativo: pctOperativo!, pctReserva: pctReserva!, pctDetProgramada: pctDetProg!,
      pctDetNoProg: pctDetNoProg!, pctPerdidaOp: pctPerdidaOp!,
      status: "pendiente",
    });
  }

  return { filas, errores };
}

const CABECERA_CSV = "equipoId,dfm,tmef,tmpr,tiempoOperativo,reserva,horasAcumuladas,paroTotal,motivoParo,pctOperativo,pctReserva,pctDetProgramada,pctDetNoProg,pctPerdidaOp";
const EJEMPLO_CSV  = `${CABECERA_CSV}
CH-01,88.5,82,4.2,85.3,6.5,1250,false,,72.1,5.5,12.3,8.1,2.0
CH-02,87.0,80,4.5,84.0,7.0,1180,false,,71.0,6.0,12.5,8.5,2.0
CE-04,0,0,0,0,0,0,true,Bomba hidráulica HPN-2847,0,0,0,0,0`;

export function KpisImportarClient({
  periodos,
  equipoIdsValidos,
}: {
  periodos: Periodo[];
  equipoIdsValidos: string[];
}) {
  const primerAbierto = periodos.find((p) => !p.cerrado);
  const [periodoId, setPeriodoId]   = useState(primerAbierto?.id ?? periodos[0]?.id ?? 0);
  const [filas, setFilas]           = useState<FilaParseada[]>([]);
  const [errores, setErrores]       = useState<ErrorLinea[]>([]);
  const [globalMsg, setGlobalMsg]   = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [guardando, setGuardando]   = useState(false);
  const inputRef                    = useRef<HTMLInputElement>(null);

  const equiposSet = new Set(equipoIdsValidos);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const texto = ev.target?.result as string;
      const { filas: parsed, errores: errs } = parsearCsv(texto, equiposSet);
      setFilas(parsed);
      setErrores(errs);
      setGlobalMsg(null);
    };
    reader.readAsText(file, "utf-8");
  }

  async function guardarTodo() {
    if (filas.length === 0) return;
    setGuardando(true);
    setGlobalMsg(null);

    const erroresGuardado: string[] = [];

    for (let i = 0; i < filas.length; i++) {
      const r = filas[i];
      // upsertKpiYAsarcoEquipo garantiza atomicidad: KPI + ASARCO en una sola transacción
      const res = await upsertKpiYAsarcoEquipo(
        {
          equipoId: r.equipoId, periodoId,
          dfm: r.dfm, tmef: r.tmef, tmpr: r.tmpr,
          tiempoOperativo: r.tiempoOperativo, reserva: r.reserva,
          horasAcumuladas: r.horasAcumuladas,
          paroTotal: r.paroTotal, motivoParo: r.motivoParo || null,
        },
        {
          equipoId: r.equipoId, periodoId,
          pctOperativo: r.pctOperativo, pctReserva: r.pctReserva,
          pctDetProgramada: r.pctDetProgramada, pctDetNoProg: r.pctDetNoProg,
          pctPerdidaOp: r.pctPerdidaOp,
        },
      );

      const ok  = res.ok;
      const err = res.ok ? undefined : res.error;
      setFilas((prev) => prev.map((f, j) => j === i ? { ...f, status: ok ? "ok" : "error", errorMsg: err } : f));
      if (!ok) erroresGuardado.push(`${r.equipoId}: ${err ?? "Error desconocido"}`);
    }

    if (erroresGuardado.length === 0) {
      const rAlertas = await regenerarAlertasPeriodo(periodoId);
      if (rAlertas.ok) {
        setGlobalMsg({ type: "ok", text: `${filas.length} equipos importados y alertas regeneradas.` });
      } else {
        setGlobalMsg({ type: "ok", text: `${filas.length} equipos importados. Alertas: regeneración fallida — ve a KPIs para regenerar manualmente.` });
      }
    } else {
      setGlobalMsg({ type: "error", text: `${erroresGuardado.length} error(es). Primero: ${erroresGuardado[0]}` });
    }
    setGuardando(false);
  }

  function descargarPlantilla() {
    const blob = new Blob([EJEMPLO_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_kpis_msg.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const periodoLabel = periodos.find((p) => p.id === periodoId)?.label ?? "—";

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin/kpis" className="text-[13px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Volver a KPIs
        </Link>
      </div>

      <SectionTitle>
        <Tooltip short="Carga masiva de KPIs y ASARCO desde archivo CSV" help={HELP.adminImportarCsv}>
          Importar KPIs desde CSV — {periodoLabel}
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

        <button
          onClick={descargarPlantilla}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white border border-[#E4E4E7] text-[13px] text-[#52525B] hover:bg-[#FAFAFA]"
        >
          <FileText size={13} /> Descargar plantilla
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-white border border-[#E4E4E7] text-[13px] font-semibold text-[#52525B] hover:bg-[#FAFAFA]"
        >
          <Upload size={13} /> Seleccionar CSV
        </button>

        {filas.length > 0 && (
          <button
            onClick={guardarTodo}
            disabled={guardando}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] disabled:opacity-50 text-white text-[13px] font-semibold"
          >
            <Save size={13} /> {guardando ? "Guardando…" : `Guardar ${filas.length} equipos`}
          </button>
        )}
      </div>

      {/* Errores de parseo */}
      {errores.length > 0 && (
        <div className="flex flex-col gap-1.5 p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA]">
          <p className="text-[12px] font-semibold text-[#B91C1C] flex items-center gap-1.5">
            <AlertTriangle size={13} /> {errores.length} error{errores.length !== 1 ? "es" : ""} en el CSV
          </p>
          {errores.slice(0, 5).map((e, i) => (
            <p key={i} className="text-[11px] text-[#B91C1C] font-mono">Línea {e.linea}: {e.msg}</p>
          ))}
          {errores.length > 5 && <p className="text-[11px] text-[#B91C1C]">…y {errores.length - 5} más</p>}
        </div>
      )}

      {/* Mensaje global */}
      {globalMsg && (
        <div className={clsx(
          "flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] text-[13px]",
          globalMsg.type === "ok" ? "bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]" : "bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]"
        )}>
          {globalMsg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {globalMsg.text}
        </div>
      )}

      {/* Preview de filas */}
      {filas.length > 0 && (
        <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
          <table className="w-full text-[12px]">
            <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
              <tr className="text-[10px] uppercase tracking-wider text-[#71717A]">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-2 py-2 text-right">DFM%</th>
                <th className="px-2 py-2 text-right">TMEF h</th>
                <th className="px-2 py-2 text-right">TMPR h</th>
                <th className="px-2 py-2 text-right">T.Op%</th>
                <th className="px-2 py-2 text-right">Res%</th>
                <th className="px-2 py-2 text-right">Horas</th>
                <th className="px-2 py-2 text-center">Paro</th>
                <th className="px-2 py-2 text-right">Σ ASARCO</th>
                <th className="px-2 py-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((r, i) => {
                const suma = r.pctOperativo + r.pctReserva + r.pctDetProgramada + r.pctDetNoProg + r.pctPerdidaOp;
                return (
                  <tr key={i} className="border-t border-[#F4F4F5]">
                    <td className="px-3 py-1.5 font-mono font-bold text-[#09090B]">{r.equipoId}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{r.dfm}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{r.tmef}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{r.tmpr}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{r.tiempoOperativo}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{r.reserva}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{r.horasAcumuladas.toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-center">
                      {r.paroTotal ? (
                        <span className="text-[#B91C1C] font-bold" title={r.motivoParo}>PARO</span>
                      ) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-[#15803D]">{suma.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-center">
                      {r.status === "ok"       && <CheckCircle2 size={13} className="text-[#15803D] mx-auto" />}
                      {r.status === "error"    && <AlertTriangle size={13} className="text-[#B91C1C] mx-auto" aria-label={r.errorMsg} />}
                      {r.status === "pendiente"&& <span className="text-[#A1A1AA] text-[10px]">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Estado vacío */}
      {filas.length === 0 && errores.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 h-48 rounded-[10px] bg-white border border-[#E4E4E7] border-dashed">
          <Upload size={24} className="text-[#A1A1AA]" />
          <p className="text-[13px] text-[#A1A1AA]">Selecciona un archivo CSV para previsualizar los datos</p>
          <p className="text-[11px] text-[#A1A1AA]">Descarga la plantilla de ejemplo para ver el formato esperado</p>
        </div>
      )}

      <div className="text-[11px] text-[#A1A1AA] leading-relaxed">
        <strong>Formato del CSV:</strong> {CABECERA_CSV}<br />
        Los campos ASARCO deben sumar 100% ± 0.5%. Si paroTotal=true, el campo motivoParo es obligatorio.
      </div>
    </div>
  );
}
