import { clsx } from "clsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import type { EstadoSemaforo } from "@/lib/domain/tipos";

interface KpiCardProps {
  label: string;
  valor: number | string;
  unidad?: string;
  objetivo?: number;
  delta?: number;      // % cambio vs mes anterior
  estado: EstadoSemaforo;
  className?: string;
}

export function KpiCard({ label, valor, unidad, objetivo, delta, estado, className }: KpiCardProps) {
  const deltaPositivo = delta !== undefined && delta > 0;
  const deltaNegativo = delta !== undefined && delta < 0;

  return (
    <div
      className={clsx(
        "flex flex-col gap-2 p-4 rounded-xl bg-white border border-[#E4E4E7]",
        "motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-[1.01]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#71717A] font-medium uppercase tracking-wider">{label}</span>
        <SemaforoDot estado={estado} size="md" />
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-mono font-bold text-[#09090B]">{valor}</span>
        {unidad && <span className="text-sm text-[#A1A1AA]">{unidad}</span>}
      </div>

      <div className="flex items-center justify-between text-xs">
        {objetivo !== undefined && (
          <span className="text-[#71717A]">
            Obj: <span className="text-[#52525B]">{objetivo}{unidad}</span>
          </span>
        )}
        {delta !== undefined && (
          <span className={clsx(
            "flex items-center gap-0.5 font-medium",
            deltaPositivo ? "text-green-700" : deltaNegativo ? "text-red-700" : "text-[#71717A]"
          )}>
            {deltaPositivo && <TrendingUp size={12} />}
            {deltaNegativo && <TrendingDown size={12} />}
            {!deltaPositivo && !deltaNegativo && <Minus size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
