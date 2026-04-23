import { clsx } from "clsx";
import type { EstadoSemaforo } from "@/lib/domain/tipos";

const ESTILOS: Record<EstadoSemaforo, string> = {
  verde: "text-[#14532D]  bg-[#F0FDF4]  border-[#BBF7D0]",
  ambar: "text-[#92400E]  bg-[#FFFBEB]  border-[#FDE68A]",
  rojo:  "text-[#991B1B]  bg-[#FEF2F2]  border-[#FECACA]",
  paro:  "text-[#991B1B]  bg-[#FEF2F2]  border-[#FECACA]  font-bold tracking-wider",
};

const TEXTOS: Record<EstadoSemaforo, string> = {
  verde: "OK",
  ambar: "Advertencia",
  rojo:  "Crítico",
  paro:  "PARO",
};

interface StatusBadgeProps {
  estado: EstadoSemaforo;
  label?: string;
  className?: string;
}

export function StatusBadge({ estado, label, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px]",
        "text-[11px] font-semibold uppercase tracking-wide border",
        ESTILOS[estado],
        className
      )}
    >
      {label ?? TEXTOS[estado]}
    </span>
  );
}
