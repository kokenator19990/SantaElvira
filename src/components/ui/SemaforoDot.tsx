"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { EstadoSemaforo } from "@/lib/domain/tipos";

const COLOR_BASE: Record<EstadoSemaforo, string> = {
  verde: "#16A34A",
  ambar: "#D97706",
  rojo:  "#DC2626",
  paro:  "#991B1B",
};
const COLOR_BG: Record<EstadoSemaforo, string> = {
  verde: "rgba(22,163,74,0.15)",
  ambar: "rgba(217,119,6,0.15)",
  rojo:  "rgba(220,38,38,0.15)",
  paro:  "rgba(153,27,27,0.2)",
};

const SIZES = {
  sm: 6,
  md: 8,
  lg: 11,
};

const LABEL: Record<EstadoSemaforo, string> = {
  verde: "OK",
  ambar: "Advertencia",
  rojo:  "Crítico",
  paro:  "Paro Total",
};

interface SemaforoDotProps {
  estado: EstadoSemaforo;
  size?: keyof typeof SIZES;
  className?: string;
}

export function SemaforoDot({ estado, size = "md", className }: SemaforoDotProps) {
  const px = SIZES[size];
  const shouldPulse = estado === "rojo" || estado === "paro";
  const color = COLOR_BASE[estado];
  const bg = COLOR_BG[estado];

  return (
    <span
      className={clsx("relative inline-flex shrink-0", className)}
      style={{ width: px, height: px }}
      role="img"
      aria-label={`Estado: ${LABEL[estado]}`}
    >
      {shouldPulse && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-50"
          style={{ backgroundColor: color }}
        />
      )}
      <motion.span
        className="relative inline-flex rounded-full w-full h-full"
        animate={{ backgroundColor: color }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
        style={{ boxShadow: `0 0 0 2.5px ${bg}, 0 0 6px ${color}40` }}
      />
    </span>
  );
}
