"use client";

import { useHelpMode } from "@/contexts/HelpModeContext";
import { HelpCircle, X } from "lucide-react";

export function HelpModeBanner() {
  const { isActive, deactivate } = useHelpMode();
  if (!isActive) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-500 shadow-lg">
      <div className="flex items-center gap-2">
        <HelpCircle size={15} className="text-white shrink-0" />
        <span className="text-[12px] font-bold text-white tracking-wide">
          MODO AYUDA ACTIVO
        </span>
        <span className="hidden sm:inline text-[11px] text-amber-100 font-normal">
          · Pasa el cursor sobre cualquier indicador o sección para ver su explicación detallada
        </span>
      </div>
      <div className="flex items-center gap-3">
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-600/60 text-white text-[10px] font-mono border border-white/20">
          ESC
        </kbd>
        <span className="hidden sm:inline text-[10px] text-amber-100">para salir</span>
        <button
          onClick={deactivate}
          className="flex items-center justify-center w-6 h-6 rounded bg-amber-600/60 hover:bg-amber-700 text-white transition-colors"
          aria-label="Cerrar modo ayuda"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
