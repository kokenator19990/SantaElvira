"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { CheckCheck, AlertTriangle, X } from "lucide-react";
import { resolverTodasPorEstado } from "@/lib/db/actions/alertas";

interface Props {
  estado: "paro" | "rojo" | "ambar";
  cantidad: number;
  tituloSeccion: string;
}

const ESTADO_COLOR: Record<string, string> = {
  paro:  "bg-[#FEF2F2]",
  rojo:  "bg-[#FEF2F2]",
  ambar: "bg-[#FFFBEB]",
};

export function ResolverTodasButton({ estado, cantidad, tituloSeccion }: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const [accionTomada, setAccionTomada] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const result = await resolverTodasPorEstado(estado, {
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
      <button
        type="button"
        onClick={() => {
          setAccionTomada("");
          setError("");
          setShowDialog(true);
        }}
        disabled={pending}
        className="flex items-center gap-1 px-2 py-1 rounded-[4px] bg-white/10 hover:bg-white/20 text-[11px] text-white/80 transition-colors disabled:opacity-50"
        title={`Resolver todas las alertas de ${tituloSeccion}`}
      >
        <CheckCheck size={11} />
        <span className="hidden sm:inline">
          {pending ? "Resolviendo…" : "Resolver todas"}
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-auto w-[90vw] max-w-[420px] rounded-xl border border-[#E4E4E7] bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
        onCancel={(e) => { e.preventDefault(); handleCancel(); }}
        aria-modal="true"
        aria-labelledby="resolver-todas-title"
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${ESTADO_COLOR[estado] ?? "bg-[#FFFBEB]"}`}>
              <AlertTriangle size={18} className={estado === "ambar" ? "text-[#B45309]" : "text-[#B91C1C]"} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 id="resolver-todas-title" className="text-[15px] font-bold text-[#09090B] leading-tight">
                Resolver {cantidad} alerta{cantidad !== 1 ? "s" : ""}
              </h3>
              <p className="text-[13px] text-[#52525B] mt-1 leading-relaxed">
                Vas a marcar como resueltas <strong>todas</strong> las alertas en estado
                {" "}<span className="font-semibold">&quot;{tituloSeccion}&quot;</span>.
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

          <p className="text-[12px] text-[#92400E] leading-relaxed bg-[#FFFBEB] border border-[#FDE68A] rounded-[6px] px-3 py-2">
            Las alertas pasarán al <strong>historial de resolución</strong> con la misma acción registrada.
            Puedes <strong>reabrir</strong> alertas individuales desde el historial si fue un error.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="accion-todas" className="text-[12px] font-semibold text-[#09090B]">
              ¿Qué acción se tomó? <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              ref={inputRef}
              id="accion-todas"
              type="text"
              value={accionTomada}
              onChange={(e) => {
                setAccionTomada(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ej: Revisión general completada — turno día"
              maxLength={500}
              className="w-full text-[13px] px-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#B45309]/30 focus:border-[#B45309]"
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
              className={`px-3.5 py-2 rounded-[7px] text-[13px] font-semibold text-white transition-colors disabled:opacity-50 ${
                estado === "ambar"
                  ? "bg-[#B45309] hover:bg-[#92400E]"
                  : "bg-[#B91C1C] hover:bg-[#991B1B]"
              }`}
            >
              {pending ? "Resolviendo…" : "Resolver todas"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
