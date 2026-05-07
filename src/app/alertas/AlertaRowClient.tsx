"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import { resolverAlerta } from "@/lib/db/actions/alertas";
import { CheckCircle2, ArrowRight, AlertTriangle, FlaskConical, X } from "lucide-react";
import type { Alerta } from "@/lib/domain/tipos";

const KPI_LABEL: Record<string, string> = {
  dfm:             "Disponibilidad",
  tmef:            "Tiempo entre Fallas",
  tmpr:            "Tiempo de Reparación",
  tiempoOperativo: "Tiempo Productivo",
  reserva:         "Reserva",
  apd:             "Análisis de Aceite",
};

const KPI_UNIDAD: Record<string, string> = {
  dfm: "%", tmef: "h", tmpr: "h", tiempoOperativo: "%", reserva: "%", apd: "",
};

const KPI_CAUSA: Record<string, string> = {
  dfm:             "Este equipo pasa demasiado tiempo detenido. Coordina con el taller para priorizar su reparación.",
  tmef:            "El equipo se descompone con frecuencia. Pide al área de mantenimiento un plan de intervención preventiva.",
  tmpr:            "Las reparaciones toman demasiado tiempo. Verifica si hay repuestos pendientes o falta de personal en el taller.",
  tiempoOperativo: "El equipo no está siendo utilizado suficientemente. Revisa con operaciones si hay problemas de asignación de frentes.",
  reserva:         "Hay equipos disponibles sin tarea. Coordina con planificación si sobra dotación o faltan frentes de trabajo.",
  apd:             "Los análisis de aceite muestran desgaste anormal. Programa una inspección antes de que falle.",
};

export function AlertaRowClient({ alerta }: { alerta: Alerta }) {
  const [showDialog, setShowDialog] = useState(false);
  const [accionTomada, setAccionTomada] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const esApd = alerta.kpi === "apd";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showDialog && !dialog.open) {
      dialog.showModal();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (!showDialog && dialog.open) {
      dialog.close();
    }
  }, [showDialog]);

  function handleOpen() {
    setAccionTomada("");
    setError("");
    setShowDialog(true);
  }

  function handleCancel() {
    if (pending) return;
    setShowDialog(false);
    setAccionTomada("");
    setError("");
  }

  function handleConfirm() {
    if (!accionTomada.trim()) {
      setError("Debes indicar qué acción se tomó");
      inputRef.current?.focus();
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await resolverAlerta(Number(alerta.id), {
        accionTomada: accionTomada.trim(),
      });
      if (result.ok) {
        setShowDialog(false);
        setAccionTomada("");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col border-t border-[#F4F4F5] first:border-t-0">
        <div className="flex items-center gap-3 px-4 py-3.5 min-h-[52px]">
          {esApd ? (
            <FlaskConical size={16} className="text-[#B45309] shrink-0" />
          ) : (
            <SemaforoDot estado={alerta.estado} size="md" />
          )}

          <Link
            href={esApd ? "/apd" : `/flota/${alerta.equipoId}`}
            className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-[15px] text-[#09090B]">{alerta.equipoId}</span>
              <span className="text-[12px] text-[#71717A]">{alerta.modelo}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#F4F4F5] text-[#71717A] font-mono">
                {alerta.tipoFlota}
              </span>
              {esApd && (
                <Tooltip short="Alerta generada por Análisis Predictivo de Aceites (APD)" help={HELP.navApd}>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#FFFBEB] text-[#B45309] font-semibold cursor-help">
                    Predictivo
                  </span>
                </Tooltip>
              )}
            </div>
            <p className="text-[13px] text-[#71717A] mt-0.5 truncate">{alerta.mensaje}</p>
            {KPI_CAUSA[alerta.kpi] && (
              <p className="text-[11px] text-[#B45309] mt-1 leading-tight flex gap-1">
                <span className="font-bold shrink-0">Qué hacer:</span>
                <span>{KPI_CAUSA[alerta.kpi]}</span>
              </p>
            )}
          </Link>

          <div className="text-right shrink-0 ml-2">
            <p className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">
              {KPI_LABEL[alerta.kpi] ?? alerta.kpi}
            </p>
            <p className="font-mono font-bold text-[20px] text-[#09090B] leading-none mt-0.5">
              {alerta.valorActual === 0 ? "—" : `${alerta.valorActual}${KPI_UNIDAD[alerta.kpi] ?? ""}`}
            </p>
            {alerta.valorActual > 0 && !esApd && (
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                Umbral: <span className="text-[#71717A]">{alerta.umbralCritico}{KPI_UNIDAD[alerta.kpi] ?? ""}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-1 shrink-0">
            <button
              onClick={handleOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] text-[12px] font-semibold transition-colors"
            >
              <CheckCircle2 size={13} />
              Resolver
            </button>
            <Link
              href={esApd ? "/apd" : `/flota/${alerta.equipoId}`}
              className="flex items-center justify-center w-8 h-8 rounded-[6px] text-[#A1A1AA] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-all duration-150"
              aria-label="Ver detalle"
            >
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Dialog de resolución con confirmación y acción obligatoria */}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-auto w-[90vw] max-w-[480px] rounded-xl border border-[#E4E4E7] bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
        onCancel={(e) => { e.preventDefault(); handleCancel(); }}
        aria-modal="true"
        aria-labelledby={`resolver-dialog-${alerta.id}`}
      >
        <div className="flex flex-col gap-4 p-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-[#F0FDF4]">
              <CheckCircle2 size={18} className="text-[#15803D]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 id={`resolver-dialog-${alerta.id}`} className="text-[15px] font-bold text-[#09090B] leading-tight">
                Resolver alerta
              </h3>
              <p className="text-[13px] text-[#52525B] mt-1">
                Confirma la resolución de esta alerta:
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={pending}
              className="flex items-center justify-center w-7 h-7 rounded text-[#A1A1AA] hover:text-[#09090B] transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>

          {/* Detalle de la alerta */}
          <div className="flex flex-col gap-2 p-3 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]">
            <div className="flex items-center gap-2">
              {esApd ? (
                <FlaskConical size={14} className="text-[#B45309]" />
              ) : (
                <SemaforoDot estado={alerta.estado} size="sm" />
              )}
              <span className="font-mono font-bold text-[14px] text-[#09090B]">{alerta.equipoId}</span>
              <span className="text-[12px] text-[#71717A]">{alerta.modelo}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
              <span className="text-[#A1A1AA]">KPI</span>
              <span className="text-[#09090B] font-medium">{KPI_LABEL[alerta.kpi] ?? alerta.kpi}</span>
              <span className="text-[#A1A1AA]">Valor actual</span>
              <span className="font-mono font-bold text-[#B91C1C]">
                {alerta.valorActual === 0 ? "—" : `${alerta.valorActual}${KPI_UNIDAD[alerta.kpi] ?? ""}`}
              </span>
              {!esApd && alerta.umbralCritico > 0 && (
                <>
                  <span className="text-[#A1A1AA]">Umbral</span>
                  <span className="font-mono text-[#71717A]">
                    {alerta.umbralCritico}{KPI_UNIDAD[alerta.kpi] ?? ""}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Nota informativa sobre trazabilidad */}
          <p className="text-[12px] text-[#92400E] leading-relaxed bg-[#FFFBEB] border border-[#FDE68A] rounded-[6px] px-3 py-2">
            La alerta pasará al <strong>historial de resolución</strong> con la acción que registres.
            Si cometes un error, puedes <strong>reabrir</strong> la alerta desde el historial.
          </p>

          {/* Campo de acción obligatorio */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`accion-${alerta.id}`} className="text-[12px] font-semibold text-[#09090B]">
              ¿Qué acción se tomó? <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              ref={inputRef}
              id={`accion-${alerta.id}`}
              type="text"
              value={accionTomada}
              onChange={(e) => {
                setAccionTomada(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ej: Se coordinó reparación con taller — OT #1234"
              maxLength={500}
              className="w-full text-[13px] px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#15803D]/30 focus:border-[#15803D]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && accionTomada.trim()) handleConfirm();
              }}
              disabled={pending}
            />
            {error && (
              <p className="text-[12px] text-[#B91C1C] flex items-center gap-1">
                <AlertTriangle size={12} /> {error}
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleCancel}
              disabled={pending}
              className="px-3.5 py-2 rounded-[7px] bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[13px] font-medium text-[#52525B] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={pending || !accionTomada.trim()}
              className="px-3.5 py-2 rounded-[7px] bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 text-[13px] font-semibold text-white transition-colors"
            >
              {pending ? "Resolviendo…" : "Confirmar resolución"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
