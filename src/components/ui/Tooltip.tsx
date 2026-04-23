"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useHelpMode } from "@/contexts/HelpModeContext";
import type { HelpItem } from "@/lib/help-content";

interface TooltipProps {
  short: string;
  help?: HelpItem;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ short, help, children, className }: TooltipProps) {
  const { isActive: helpMode } = useHelpMode();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let x = r.left + r.width / 2;
    const y = r.bottom + 6;
    // Clamp to viewport
    const width = helpMode ? 304 : 200;
    x = Math.max(width / 2 + 8, Math.min(window.innerWidth - width / 2 - 8, x));
    setPos({ x, y });
  }, [helpMode]);

  const hide = useCallback(() => setPos(null), []);

  return (
    <>
      <span
        ref={ref}
        className={`inline-flex items-center gap-0.5 ${className ?? ""}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {mounted && pos && createPortal(
        <div
          className="pointer-events-none z-[9999]"
          style={{ position: "fixed", top: pos.y, left: pos.x, transform: "translateX(-50%)" }}
        >
          {helpMode && help ? (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-2xl p-4 w-[304px] text-left animate-in fade-in slide-in-from-bottom-1 duration-150">
              {/* Arrow */}
              <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] bg-white border-l border-t border-zinc-200 rotate-45" />
              <p className="font-bold text-[13px] text-zinc-900 mb-2 leading-tight">{help.titulo}</p>
              <p className="text-[12px] text-zinc-600 leading-relaxed mb-2.5">{help.que_es}</p>
              {help.como_funciona && (
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-2 border-l-2 border-zinc-200 pl-2">{help.como_funciona}</p>
              )}
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Ejemplo</p>
                <p className="text-[11px] text-amber-900 leading-relaxed">{help.ejemplo}</p>
              </div>
              {help.meta && (
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  <span className="font-semibold text-zinc-700">Meta: </span>{help.meta}
                </p>
              )}
              {help.origen && (
                <p className="text-[10px] text-zinc-400 leading-relaxed mt-1.5 border-t border-zinc-100 pt-1.5">
                  <span className="font-semibold">Origen: </span>{help.origen}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg max-w-[200px] leading-relaxed">
              {/* Arrow */}
              <div className="absolute -top-[4px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] bg-zinc-900 rotate-45" />
              {short}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
