"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { clsx } from "clsx";
import type { Equipo, TipoFlota } from "@/lib/domain/tipos";
import { crearEquipo, actualizarEquipo, darDeBajaEquipo, reactivarEquipo } from "@/lib/db/actions/equipos";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

type Msg = { type: "ok" | "error"; text: string } | null;

const TIPOS: TipoFlota[] = ["785D", "777F", "992", "PC2000"];

export function EquiposAdminClient({ flota }: { flota: Equipo[] }) {
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [, startTransition] = useTransition();

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

  function handleAction(p: Promise<{ ok: boolean; error?: string }>, okText: string) {
    setMsg(null);
    startTransition(async () => {
      const r = await p;
      if (r.ok) setMsg({ type: "ok", text: okText });
      else setMsg({ type: "error", text: r.error ?? "Error desconocido" });
    });
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[12px] text-[#71717A] hover:text-[#09090B] inline-flex items-center gap-1">
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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[7px] bg-[#09090B] hover:bg-[#27272A] text-white text-[12px] font-semibold"
        >
          {showNew ? <X size={13} /> : <Plus size={13} />}
          {showNew ? "Cerrar" : "Nuevo equipo"}
        </button>
      </div>

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

      {showNew && (
        <div className="p-4 rounded-[10px] bg-white border border-[#FDE68A] flex flex-wrap gap-3 items-end">
          <Field label="ID (formato CH-01, CE-04, …)">
            <input
              value={nuevo.id}
              onChange={(e) => setNuevo({ ...nuevo, id: e.target.value.toUpperCase() })}
              placeholder="CH-09"
              className="w-[110px] px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[12px] font-mono uppercase"
            />
          </Field>
          <Field label="Tipo">
            <select
              value={nuevo.tipoFlotaId}
              onChange={(e) => setNuevo({ ...nuevo, tipoFlotaId: e.target.value })}
              className="px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[12px]"
            >
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Modelo">
            <input
              value={nuevo.modelo}
              onChange={(e) => setNuevo({ ...nuevo, modelo: e.target.value })}
              className="w-[180px] px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[12px]"
            />
          </Field>
          <Field label="Año">
            <input
              type="number"
              value={nuevo.anio}
              onChange={(e) => setNuevo({ ...nuevo, anio: parseInt(e.target.value) || 0 })}
              className="w-[80px] px-2 py-1.5 rounded-[5px] bg-white border border-[#E4E4E7] text-[12px] font-mono"
            />
          </Field>
          <button
            onClick={() => handleAction(
              crearEquipo({ id: nuevo.id, tipoFlotaId: nuevo.tipoFlotaId, modelo: nuevo.modelo, anioFabricacion: nuevo.anio }),
              `Equipo ${nuevo.id} creado.`
            )}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#15803D] hover:bg-[#166534] text-white text-[12px] font-semibold"
          >
            <Save size={12} /> Crear
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
            <tr className="text-[10px] uppercase tracking-wider text-[#71717A]">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Modelo</th>
              <th className="px-3 py-2 text-right">Año</th>
              <th className="px-3 py-2 text-right">Horas</th>
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
                        className="px-1.5 py-0.5 rounded-[4px] bg-white border border-[#E4E4E7] text-[11px]"
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
                        className="px-1.5 py-0.5 rounded-[4px] bg-white border border-[#E4E4E7] text-[11px]"
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
                        onChange={(ev) => setDraft({ ...draft, anio: parseInt(ev.target.value) || 0 })}
                        className="w-[70px] px-1.5 py-0.5 rounded-[4px] bg-white border border-[#E4E4E7] text-[11px] font-mono text-right"
                      />
                    ) : (
                      <span className="font-mono text-[#71717A]">{e.anio}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[#71717A]">{e.horasAcumuladas.toLocaleString("es-CL")}</td>
                  <td className="px-3 py-2 text-center">
                    {e.paroTotal ? (
                      <span className="text-[10px] font-bold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded">PARO</span>
                    ) : (
                      <span className="text-[10px] font-medium text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded">Activo</span>
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
                                `${e.id} actualizado.`
                              );
                              setEditing(null);
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
                            className="px-2 py-0.5 rounded-[4px] bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[10px] font-medium text-[#52525B]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Dar de baja ${e.id}? (no se elimina, queda enServicio=false)`)) {
                                handleAction(darDeBajaEquipo(e.id), `${e.id} dado de baja.`);
                              }
                            }}
                            className="px-2 py-0.5 rounded-[4px] bg-[#FEF2F2] hover:bg-[#FECACA] text-[10px] font-medium text-[#B91C1C]"
                          >
                            Baja
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

      <p className="text-[10px] text-[#A1A1AA]">
        Total: {flota.length} equipos. Los cambios se reflejan en el dashboard tras la próxima carga (revalidate).
      </p>

      {/* Helper: reactivar (escondido — entry by id manual). En el futuro listar también equipos enServicio=false en otra pestaña. */}
      <details className="text-[11px] text-[#71717A]">
        <summary className="cursor-pointer">Reactivar un equipo dado de baja</summary>
        <ReactivarForm onSubmit={(id) => handleAction(reactivarEquipo(id), `${id} reactivado.`)} />
      </details>
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
        className="px-2 py-1 rounded-[4px] bg-white border border-[#E4E4E7] text-[11px] font-mono uppercase w-[100px]"
      />
      <button
        onClick={() => id && onSubmit(id)}
        disabled={!id}
        className="px-2.5 py-1 rounded-[4px] bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[11px] disabled:opacity-50"
      >
        Reactivar
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}
