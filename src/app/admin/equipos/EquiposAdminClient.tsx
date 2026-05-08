"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { clsx } from "clsx";
import type { Equipo, TipoFlota } from "@/lib/domain/tipos";
import { crearEquipo, actualizarEquipo, darDeBajaEquipo, reactivarEquipo } from "@/lib/db/actions/equipos";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HELP } from "@/lib/help-content";

type Msg = { type: "ok" | "error"; text: string } | null;

const TIPOS: TipoFlota[] = ["785D", "777F", "992", "PC2000"];

interface EquipoInactivo {
  id: string;
  modelo: string;
  tipoFlota: string;
  anio: number;
}

export function EquiposAdminClient({ flota, inactivos = [] }: { flota: Equipo[]; inactivos?: EquipoInactivo[] }) {
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [, startTransition] = useTransition();
  const [confirmBaja, setConfirmBaja] = useState<Equipo | null>(null);

  // Edición inline
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ modelo: string; anio: number; tipoFlotaId: string }>({
    modelo: "", anio: 2020, tipoFlotaId: "785D",
  });

  // Form de creación
  const [nuevo, setNuevo] = useState({ id: "", modelo: "CAT 785D", anio: 2025, tipoFlotaId: "785D" });

  function openEdit(e: Equipo) {
    setEditing(e.id);
    setDraft({ modelo: e.modelo, anio: e.anio, tipoFlotaId: e.tipoFlota });
  }

  function handleAction(p: Promise<{ ok: boolean; error?: string }>, okText: string, onSuccess?: () => void) {
    setMsg(null);
    startTransition(async () => {
      const r = await p;
      if (r.ok) {
        setMsg({ type: "ok", text: okText });
        onSuccess?.();
      } else {
        setMsg({ type: "error", text: r.error ?? "Error desconocido" });
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[13px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Admin
        </Link>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SectionTitle>
          <Tooltip short="CRUD de equipos de la flota" help={HELP.adminEquipos}>
            Gestionar Flota
          </Tooltip>
        </SectionTitle>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] text-white text-[13px] font-semibold"
        >
          {showNew ? <X size={13} /> : <Plus size={13} />}
          {showNew ? "Cerrar" : "Nuevo equipo"}
        </button>
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

      {showNew && (
        <div className="p-4 rounded-[10px] bg-white border border-[#FDE68A] flex flex-wrap gap-3 items-end">
          <Field label="ID (formato CH-01, CE-04, …)" helpKey="columnaId">
            <input
              value={nuevo.id}
              onChange={(e) => setNuevo({ ...nuevo, id: e.target.value.toUpperCase().slice(0, 10) })}
              placeholder="CH-09"
              maxLength={10}
              className="w-[110px] px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[13px] font-mono uppercase"
            />
          </Field>
          <Field label="Tipo" helpKey="tipoFlota">
            <select
              value={nuevo.tipoFlotaId}
              onChange={(e) => setNuevo({ ...nuevo, tipoFlotaId: e.target.value })}
              className="px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[13px]"
            >
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Modelo" helpKey="modelo">
            <input
              value={nuevo.modelo}
              onChange={(e) => setNuevo({ ...nuevo, modelo: e.target.value })}
              className="w-[180px] px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[13px]"
            />
          </Field>
          <Field label="Año" helpKey="columnaAnio">
            <input
              type="number"
              value={nuevo.anio}
              onChange={(e) => { const v = parseInt(e.target.value); setNuevo({ ...nuevo, anio: Number.isFinite(v) && v >= 1990 && v <= 2099 ? v : nuevo.anio }); }}
              className="w-[80px] px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[13px] font-mono"
            />
          </Field>
          <button
            onClick={() => handleAction(
              crearEquipo({ id: nuevo.id, tipoFlotaId: nuevo.tipoFlotaId, modelo: nuevo.modelo, anioFabricacion: nuevo.anio }),
              `Equipo ${nuevo.id} creado.`
            )}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#15803D] hover:bg-[#166534] text-white text-[13px] font-semibold"
          >
            <Save size={12} /> Crear
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
            <tr className="text-[11px] uppercase tracking-wider text-[#71717A]">
              <th className="px-3 py-2 text-left"><Tooltip short={HELP.columnaId.titulo} help={HELP.columnaId}><span className="cursor-help">ID</span></Tooltip></th>
              <th className="px-3 py-2 text-left"><Tooltip short={HELP.tipoFlota.titulo} help={HELP.tipoFlota}><span className="cursor-help">Tipo</span></Tooltip></th>
              <th className="px-3 py-2 text-left"><Tooltip short={HELP.modelo.titulo} help={HELP.modelo}><span className="cursor-help">Modelo</span></Tooltip></th>
              <th className="px-3 py-2 text-right"><Tooltip short={HELP.columnaAnio.titulo} help={HELP.columnaAnio}><span className="cursor-help">Año</span></Tooltip></th>
              <th className="px-3 py-2 text-right"><Tooltip short={HELP.equipoHoras.titulo} help={HELP.equipoHoras}><span className="cursor-help">Horas</span></Tooltip></th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {flota.map((e) => {
              const isEditing = editing === e.id;
              return (
                <tr key={e.id} className="border-t border-[#F4F4F5]">
                  <td className="px-3 py-2 font-mono font-bold text-[#09090B]">{e.id}</td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <select
                        value={draft.tipoFlotaId}
                        onChange={(ev) => setDraft({ ...draft, tipoFlotaId: ev.target.value })}
                        className="px-1.5 py-0.5 rounded-[4px] bg-white border border-[#E4E4E7] text-[12px]"
                      >
                        {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <span className="text-[#71717A]">{e.tipoFlota}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        value={draft.modelo}
                        onChange={(ev) => setDraft({ ...draft, modelo: ev.target.value })}
                        className="px-1.5 py-0.5 rounded-[4px] bg-white border border-[#E4E4E7] text-[12px]"
                      />
                    ) : (
                      <span className="text-[#52525B]">{e.modelo}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={draft.anio}
                        onChange={(ev) => { const v = parseInt(ev.target.value); setDraft({ ...draft, anio: Number.isFinite(v) && v >= 1990 && v <= 2099 ? v : draft.anio }); }}
                        className="w-[70px] px-1.5 py-0.5 rounded-[4px] bg-white border border-[#E4E4E7] text-[12px] font-mono text-right"
                      />
                    ) : (
                      <span className="font-mono text-[#71717A]">{e.anio}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[#71717A]">{e.horasAcumuladas.toLocaleString("es-CL")}</td>
                  <td className="px-3 py-2 text-center">
                    {e.paroTotal ? (
                      <span className="text-[11px] font-bold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded">PARO</span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded">Activo</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => {
                              handleAction(
                                actualizarEquipo(e.id, { modelo: draft.modelo, anioFabricacion: draft.anio, tipoFlotaId: draft.tipoFlotaId }),
                                `${e.id} actualizado.`,
                                () => setEditing(null),
                              );
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] bg-[#15803D] text-white"
                            title="Guardar"
                          >
                            <Save size={11} />
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] bg-[#F4F4F5] text-[#52525B]"
                            title="Cancelar"
                          >
                            <X size={11} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(e)}
                            className="px-2 py-0.5 rounded-[4px] bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[11px] font-medium text-[#52525B]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmBaja(e)}
                            className="px-2 py-0.5 rounded-[4px] bg-[#FEF2F2] hover:bg-[#FECACA] text-[11px] font-medium text-[#B91C1C]"
                          >
                            Dar de baja
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-[#A1A1AA]">
        Total: {flota.length} equipos. Los cambios se reflejan en el dashboard tras la próxima carga (revalidate).
      </p>

      {/* Equipos dados de baja */}
      {inactivos.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold text-[#71717A] uppercase tracking-[0.1em]">
            Equipos dados de baja ({inactivos.length})
          </h3>
          <div className="overflow-x-auto rounded-[10px] border border-[#FECACA] bg-[#FEF2F2]">
            <table className="w-full text-[13px]">
              <thead className="bg-[#FEF2F2] border-b border-[#FECACA]">
                <tr className="text-[11px] uppercase tracking-wider text-[#B91C1C]">
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Modelo</th>
                  <th className="px-3 py-2 text-right">Año</th>
                  <th className="px-3 py-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {inactivos.map((e) => (
                  <tr key={e.id} className="border-t border-[#FECACA]/50">
                    <td className="px-3 py-2 font-mono font-bold text-[#991B1B]">{e.id}</td>
                    <td className="px-3 py-2 text-[#71717A]">{e.tipoFlota}</td>
                    <td className="px-3 py-2 text-[#52525B]">{e.modelo}</td>
                    <td className="px-3 py-2 text-right font-mono text-[#71717A]">{e.anio}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleAction(reactivarEquipo(e.id), `${e.id} reactivado.`)}
                        className="px-2.5 py-1 rounded-[5px] bg-white hover:bg-[#F0FDF4] border border-[#E4E4E7] hover:border-[#BBF7D0] text-[11px] font-semibold text-[#15803D] transition-colors"
                      >
                        Reactivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reactivar equipo manualmente (por ID) */}
      <details className="text-[12px] text-[#71717A]">
        <summary className="cursor-pointer hover:text-[#09090B] transition-colors">Reactivar por ID manualmente</summary>
        <ReactivarForm onSubmit={(id) => handleAction(reactivarEquipo(id), `${id} reactivado.`)} />
      </details>

      <ConfirmDialog
        open={confirmBaja !== null}
        titulo={`Dar de baja ${confirmBaja?.id ?? ""}`}
        mensaje={`El equipo ${confirmBaja?.id} (${confirmBaja?.modelo}) dejará de aparecer en reportes y cálculos de KPIs futuros. Los datos históricos se conservan. Puedes reactivarlo después si es necesario.`}
        textoConfirmar="Dar de baja"
        variante="advertencia"
        onConfirm={() => {
          if (!confirmBaja) return;
          handleAction(darDeBajaEquipo(confirmBaja.id), `${confirmBaja.id} dado de baja.`);
          setConfirmBaja(null);
        }}
        onCancel={() => setConfirmBaja(null)}
      />
    </div>
  );
}

function ReactivarForm({ onSubmit }: { onSubmit: (id: string) => void }) {
  const [id, setId] = useState("");
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        value={id}
        onChange={(e) => setId(e.target.value.toUpperCase())}
        placeholder="CE-13"
        className="px-2 py-1 rounded-[4px] bg-white border border-[#E4E4E7] text-[12px] font-mono uppercase w-[100px]"
      />
      <button
        onClick={() => id && onSubmit(id)}
        disabled={!id}
        className="px-2.5 py-1 rounded-[4px] bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[12px] disabled:opacity-50"
      >
        Reactivar
      </button>
    </div>
  );
}

function Field({ label, children, helpKey }: { label: string; children: React.ReactNode; helpKey?: string }) {
  return (
    <label className="flex flex-col gap-1">
      {helpKey && HELP[helpKey] ? (
        <Tooltip short={HELP[helpKey].titulo} help={HELP[helpKey]}>
          <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider cursor-help">{label}</span>
        </Tooltip>
      ) : (
        <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">{label}</span>
      )}
      {children}
    </label>
  );
}
