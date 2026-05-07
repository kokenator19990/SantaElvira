"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertTriangle, Info, Wrench, Download, FileDown, Upload } from "lucide-react";
import { clsx } from "clsx";
import { crearEventoFalla, eliminarEventoFalla, importarFallasLote } from "@/lib/db/actions/fallas";
import { exportarCsv, descargarCsv } from "@/lib/utils/export-csv";
import { analizarFallasPorComponente } from "@/lib/domain/analisis-fallas";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HELP } from "@/lib/help-content";

interface Equipo {
  id: string;
  modelo: string;
  tipoFlotaId: string;
}

interface Falla {
  id: number;
  equipoId: string;
  fecha: string;
  descripcion: string;
  componente: string | null;
  hrsReparacion: number;
  resuelta: boolean;
}

const COMPONENTES = [
  "Motor",
  "Transmisión",
  "Sistema Hidráulico",
  "Sistema Eléctrico",
  "Chasis / Estructura",
  "Neumáticos",
  "Frenos",
  "Dirección",
  "Otro",
];

export function FallasClient({ equipos, fallasIniciales }: { equipos: Equipo[]; fallasIniciales: Falla[] }) {
  const [fallas, setFallas] = useState(fallasIniciales);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [confirmEliminar, setConfirmEliminar] = useState<Falla | null>(null);

  // Form para nueva falla
  const [equipoId, setEquipoId] = useState(equipos[0]?.id ?? "");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 16));
  const [descripcion, setDescripcion] = useState("");
  const [componente, setComponente] = useState("");
  const [hrsReparacion, setHrsReparacion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  function parseCsvFallas(text: string): { equipoId: string; fecha: string; descripcion: string; componente: string | null; hrsReparacion: number }[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    // Soporta separador ; o ,
    const sep = lines[0].includes(";") ? ";" : ",";
    const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/["\u00ef\u00bb\u00bf]/g, ""));
    const idxEquipo = headers.findIndex((h) => h.includes("equipo"));
    const idxFecha = headers.findIndex((h) => h.includes("fecha"));
    const idxDesc = headers.findIndex((h) => h.includes("descrip"));
    const idxComp = headers.findIndex((h) => h.includes("componente"));
    const idxHrs = headers.findIndex((h) => h.includes("hrs") || h.includes("horas") || h.includes("reparacion"));

    if (idxEquipo < 0 || idxFecha < 0 || idxDesc < 0) return [];

    const result: { equipoId: string; fecha: string; descripcion: string; componente: string | null; hrsReparacion: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
      if (!cols[idxEquipo] || !cols[idxFecha]) continue;
      result.push({
        equipoId: cols[idxEquipo].toUpperCase(),
        fecha: cols[idxFecha],
        descripcion: cols[idxDesc] ?? "",
        componente: idxComp >= 0 ? (cols[idxComp] || null) : null,
        hrsReparacion: idxHrs >= 0 ? (parseFloat(cols[idxHrs]) || 0) : 0,
      });
    }
    return result;
  }

  async function handleImportCsv(file: File) {
    if (file.size > 512_000) {
      setMsg({ type: "error", text: "Archivo demasiado grande (máx. 500 KB)" });
      return;
    }
    setImporting(true);
    setMsg(null);
    const text = await file.text();
    const parsed = parseCsvFallas(text);
    if (parsed.length === 0) {
      setMsg({ type: "error", text: "No se encontraron filas válidas. Verifica que el CSV tenga columnas: equipoId, fecha, descripcion" });
      setImporting(false);
      return;
    }
    const result = await importarFallasLote(parsed);
    if (result.ok) {
      const data = result.data!;
      const msgText = `${data.insertadas} falla${data.insertadas !== 1 ? "s" : ""} importada${data.insertadas !== 1 ? "s" : ""}` +
        (data.errores.length > 0 ? `. ${data.errores.length} fila${data.errores.length !== 1 ? "s" : ""} con error: ${data.errores.slice(0, 3).join("; ")}` : "");
      setMsg({ type: "ok", text: msgText });
      // Recargar la página para traer las fallas nuevas desde el server
      window.location.reload();
    } else {
      setMsg({ type: "error", text: result.error });
    }
    setImporting(false);
  }

  async function handleCrear() {
    setSaving(true);
    setMsg(null);

    const result = await crearEventoFalla({
      equipoId,
      fecha,
      descripcion,
      componente: componente || null,
      hrsReparacion,
    });

    if (!result.ok) {
      setMsg({ type: "error", text: result.error });
    } else {
      setMsg({ type: "ok", text: `Falla registrada para ${equipoId}` });
      setFallas((prev) => [
        {
          id: result.data!.id,
          equipoId,
          fecha: new Date(fecha).toISOString(),
          descripcion,
          componente: componente || null,
          hrsReparacion,
          resuelta: false,
        },
        ...prev,
      ]);
      setDescripcion("");
      setHrsReparacion(0);
    }
    setSaving(false);
  }

  async function handleEliminar(id: number) {
    const result = await eliminarEventoFalla(id);
    if (result.ok) {
      setFallas((prev) => prev.filter((f) => f.id !== id));
      setMsg({ type: "ok", text: "Falla eliminada" });
    } else {
      setMsg({ type: "error", text: result.error });
    }
    setConfirmEliminar(null);
  }

  return (
    <div className="flex flex-col gap-5 max-w-[900px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[13px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Admin
        </Link>
      </div>

      <SectionTitle>
        <Tooltip short="Registro de fallas y reparaciones de equipos" help={HELP.registroFallas}>
          Registro de Fallas
        </Tooltip>
      </SectionTitle>

      {/* Formulario nueva falla */}
      <div className="p-4 rounded-[10px] bg-white border border-[#E4E4E7]">
        <div className="flex items-center gap-2 mb-3">
          <Plus size={14} className="text-[#B91C1C]" />
          <span className="text-[14px] font-semibold text-[#09090B]">Registrar nueva falla</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Equipo</label>
            <select
              value={equipoId}
              onChange={(e) => setEquipoId(e.target.value)}
              className="px-2.5 py-2 rounded-[6px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]"
            >
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>{e.id} — {e.modelo}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Fecha y hora</label>
            <input
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="px-2.5 py-2 rounded-[6px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Tooltip short="Sistema o parte del equipo donde ocurrió la falla" help={HELP.componenteFalla}>
              <label className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider cursor-help">Componente</label>
            </Tooltip>
            <select
              value={componente}
              onChange={(e) => setComponente(e.target.value)}
              className="px-2.5 py-2 rounded-[6px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]"
            >
              <option value="">— Sin especificar</option>
              {COMPONENTES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Tooltip short="Tiempo que tomó reparar la falla (horas decimales)" help={HELP.hrsReparacion}>
              <label className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider cursor-help">Horas reparación</label>
            </Tooltip>
            <input
              type="number"
              step="0.5"
              min="0"
              value={hrsReparacion}
              onChange={(e) => setHrsReparacion(parseFloat(e.target.value) || 0)}
              className="px-2.5 py-2 rounded-[6px] border border-[#E4E4E7] text-[13px] font-mono focus:outline-none focus:border-[#B45309]"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Descripción de la falla</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Fuga en bomba hidráulica principal — requirió reemplazo de sello"
              className="px-2.5 py-2 rounded-[6px] border border-[#E4E4E7] text-[13px] focus:outline-none focus:border-[#B45309]"
            />
          </div>
        </div>

        <button
          onClick={handleCrear}
          disabled={saving || !descripcion.trim()}
          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#B91C1C] hover:bg-[#991B1B] disabled:opacity-50 text-white text-[13px] font-semibold"
        >
          <Wrench size={13} /> {saving ? "Registrando…" : "Registrar falla"}
        </button>
      </div>

      {msg && (
        <div className={clsx(
          "flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] text-[13px]",
          msg.type === "ok" ? "bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]" : "bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]"
        )}>
          {msg.type === "ok" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {msg.text}
        </div>
      )}

      {/* Lista de fallas existentes */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-bold text-[#71717A] uppercase tracking-[0.1em]">
            Fallas registradas ({fallas.length})
          </h3>
          <div className="flex items-center gap-2">
            <label className={clsx(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-[#E4E4E7] bg-white hover:bg-[#FFFBEB] hover:border-[#FDE68A] text-[11px] font-semibold text-[#52525B] transition-colors cursor-pointer",
              importing && "opacity-50 pointer-events-none"
            )}>
              <Upload size={11} />
              {importing ? "Importando…" : "Importar CSV"}
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportCsv(file);
                  e.target.value = "";
                }}
                disabled={importing}
              />
            </label>
            {fallas.length > 0 && (
              <button
                onClick={() => exportarCsv(fallas, [
                  { header: "Equipo",       value: (f) => f.equipoId },
                  { header: "Fecha",        value: (f) => new Date(f.fecha).toISOString().slice(0, 16) },
                  { header: "Descripción",  value: (f) => f.descripcion },
                  { header: "Componente",   value: (f) => f.componente ?? "" },
                  { header: "Hrs Reparación", value: (f) => f.hrsReparacion },
                  { header: "Resuelta",     value: (f) => f.resuelta ? "Sí" : "No" },
                ], `MSG_Fallas_${new Date().toISOString().slice(0, 10)}.csv`)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[11px] font-semibold text-[#52525B] transition-colors"
              >
                <Download size={11} /> Exportar Excel
              </button>
            )}
          </div>
        </div>

        {fallas.length === 0 ? (
          <div className="flex items-center justify-center h-[100px] rounded-[10px] bg-white border border-[#E4E4E7]">
            <p className="text-[13px] text-[#A1A1AA]">Sin fallas registradas</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {fallas.map((f) => (
              <div key={f.id} className="flex items-start gap-3 p-3 rounded-[10px] bg-white border border-[#E4E4E7]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FEF2F2] shrink-0">
                  <Wrench size={14} className="text-[#B91C1C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-bold text-[13px] text-[#09090B]">{f.equipoId}</span>
                    {f.componente && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-[3px] bg-[#F4F4F5] text-[#71717A]">
                        {f.componente}
                      </span>
                    )}
                    <span className="text-[11px] text-[#A1A1AA]">
                      {new Date(f.fecha).toLocaleDateString("es-CL")} · {f.hrsReparacion}h
                    </span>
                  </div>
                  <p className="text-[13px] text-[#52525B]">{f.descripcion}</p>
                </div>
                <button
                  onClick={() => setConfirmEliminar(f)}
                  className="flex items-center justify-center w-7 h-7 rounded-[5px] text-[#A1A1AA] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors shrink-0"
                  title="Eliminar falla"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Análisis de componentes */}
      {fallas.length >= 1 && (() => {
        const equipoMap = new Map(equipos.map((e) => [e.id, e.tipoFlotaId]));
        const analisis = analizarFallasPorComponente(
          fallas.map((f) => ({
            equipoId: f.equipoId,
            componente: f.componente,
            hrsReparacion: f.hrsReparacion,
            tipoFlota: equipoMap.get(f.equipoId) ?? "Desconocido",
          }))
        );

        return (
          <div className="flex flex-col gap-2">
            <Tooltip short="Agrupación de fallas por componente para detectar patrones" help={HELP.analisisComponente}>
              <h3 className="text-[12px] font-bold text-[#71717A] uppercase tracking-[0.1em] cursor-help">
                Análisis por Componente
              </h3>
            </Tooltip>
            <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA]">
                    <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                      <Tooltip short="Sistema o parte del equipo afectado" help={HELP.componenteFalla}><span className="cursor-help">Componente</span></Tooltip>
                    </th>
                    <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">Fallas</th>
                    <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#B45309]">
                      <Tooltip short="Suma de horas de reparación de todas las fallas del componente" help={HELP.hrsReparacion}><span className="cursor-help">Hrs Rep. Total</span></Tooltip>
                    </th>
                    <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                      <Tooltip short="TMPR por componente: promedio de horas por reparación" help={HELP.tmpr}><span className="cursor-help">Hrs Prom.</span></Tooltip>
                    </th>
                    <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]">Equipos</th>
                    <th className="text-left px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                      <Tooltip short="Tipos de flota con fallas en este componente" help={HELP.tipoFlota}><span className="cursor-help">Flotas afectadas</span></Tooltip>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F4F5]">
                  {analisis.map((a) => (
                    <tr key={a.componente} className={clsx(a.totalFallas >= 5 && "bg-[#FEF2F2]")}>
                      <td className="px-3 py-2 font-semibold text-[#09090B]">{a.componente}</td>
                      <td className="px-2 py-2 text-center font-mono font-bold text-[#B91C1C]">{a.totalFallas}</td>
                      <td className="px-2 py-2 text-center font-mono text-[#B45309]">{a.hrsReparacionTotal}</td>
                      <td className="px-2 py-2 text-center font-mono text-[#52525B]">{a.hrsReparacionPromedio}</td>
                      <td className="px-2 py-2 text-center font-mono text-[#1D4ED8]">{a.equiposAfectados}</td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          {a.porTipoFlota.map((tf) => (
                            <span key={tf.tipo} className="text-[10px] px-1.5 py-0.5 rounded-[3px] bg-[#F4F4F5] text-[#52525B]">
                              {tf.tipo} ({tf.fallas})
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Componentes con 5+ fallas se resaltan en rojo. Usa esta tabla para priorizar mantenimiento preventivo.
            </p>
          </div>
        );
      })()}

      <div className="flex items-start justify-between gap-3 text-[11px] text-[#A1A1AA]">
        <div className="flex items-start gap-2">
          <Info size={12} className="shrink-0 mt-0.5" />
          <p>
            Cada falla alimenta el cálculo de{" "}
            <Tooltip short="Promedio de horas entre fallas consecutivas" help={HELP.tmef}><span className="font-semibold cursor-help">TMEF</span></Tooltip>
            {" "}(Tiempo Medio Entre Fallas) y{" "}
            <Tooltip short="Promedio de horas por reparación" help={HELP.tmpr}><span className="font-semibold cursor-help">TMPR</span></Tooltip>
            {" "}(Tiempo Medio de Parada por Reparación).
            A más fallas registradas en un período, menor será el TMEF del equipo.
          </p>
        </div>
        <button
          onClick={() => {
            const csv = "equipoId;fecha;descripcion;componente;hrsReparacion\nCH-01;2026-01-15T08:30;Fuga en bomba hidráulica;Sistema Hidráulico;4.5\nCE-04;2026-01-15T14:00;Falla sensor temperatura;Sistema Eléctrico;2.0";
            descargarCsv(csv, "MSG_Plantilla_Fallas.csv");
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-[5px] border border-[#E4E4E7] hover:bg-[#F4F4F5] text-[#52525B] transition-colors shrink-0"
          title="Descargar plantilla CSV para carga masiva de fallas"
        >
          <FileDown size={11} /> Plantilla CSV
        </button>
      </div>

      <ConfirmDialog
        open={confirmEliminar !== null}
        titulo="Eliminar falla"
        mensaje={confirmEliminar ? `Se eliminará la falla de ${confirmEliminar.equipoId}: "${confirmEliminar.descripcion}". Esta acción no se puede deshacer y afectará el cálculo de TMEF y TMPR.` : ""}
        textoConfirmar="Eliminar"
        variante="peligro"
        onConfirm={() => confirmEliminar && handleEliminar(confirmEliminar.id)}
        onCancel={() => setConfirmEliminar(null)}
      />
    </div>
  );
}
