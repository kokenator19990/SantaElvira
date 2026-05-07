"use client";

import { useRef, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: "peligro" | "advertencia";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  variante = "peligro",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      confirmRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Focus trap: mantener el foco dentro del diálogo mientras está abierto
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  const esPeligro = variante === "peligro";

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-[90vw] max-w-[420px] rounded-xl border border-[#E4E4E7] bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      onClose={onCancel}
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${esPeligro ? "bg-[#FEF2F2]" : "bg-[#FFFBEB]"}`}>
            <AlertTriangle size={18} className={esPeligro ? "text-[#B91C1C]" : "text-[#B45309]"} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-[15px] font-bold text-[#09090B] leading-tight">{titulo}</h3>
            <p id="confirm-dialog-desc" className="text-[13px] text-[#52525B] mt-1 leading-relaxed">{mensaje}</p>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-7 h-7 rounded text-[#A1A1AA] hover:text-[#09090B] transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-[7px] bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[13px] font-medium text-[#52525B] transition-colors"
          >
            {textoCancelar}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`px-3.5 py-2 rounded-[7px] text-[13px] font-semibold text-white transition-colors ${
              esPeligro
                ? "bg-[#B91C1C] hover:bg-[#991B1B]"
                : "bg-[#B45309] hover:bg-[#92400E]"
            }`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
