import type { EstadoSemaforo } from "@/lib/domain/tipos";

const COLORES: Record<EstadoSemaforo, string> = {
  verde: "#15803D",
  ambar: "#B45309",
  rojo:  "#B91C1C",
  paro:  "#B91C1C",
};

const TRACK = "rgba(0,0,0,0.06)";

interface KpiGaugeProps {
  label: string;
  valor: number;
  max?: number;
  unidad?: string;
  estado: EstadoSemaforo;
  invertido?: boolean;
  className?: string;
}

export function KpiGauge({ label, valor, max = 100, unidad = "%", estado, invertido = false, className }: KpiGaugeProps) {
  const rawPct = Math.min(Math.max(valor / max, 0), 1);
  const pct    = invertido ? 1 - rawPct : rawPct;
  const r     = 36;
  const circ  = Math.PI * r;
  const dash  = pct * circ;
  const gap   = circ - dash;
  const color = COLORES[estado];

  return (
    <div
      className={`flex flex-col items-center gap-1.5 ${className ?? ""}`}
      role="img"
      aria-label={`${label}: ${valor}${unidad} — ${estado}`}
    >
      <div className="relative w-[88px] h-[52px]">
        <svg viewBox="0 0 100 54" className="w-full h-full" aria-hidden="true">
          {/* Track */}
          <path
            d={`M 14,50 A ${r},${r} 0 0,1 86,50`}
            fill="none"
            stroke={TRACK}
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M 14,50 A ${r},${r} 0 0,1 86,50`}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            style={{
              transition: "stroke-dasharray 900ms cubic-bezier(0.16,1,0.3,1)",
              filter: `drop-shadow(0 0 4px ${color}40)`,
            }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-0.5">
          <span className="text-[17px] font-mono font-bold leading-none" style={{ color }}>
            {valor === 0 ? "—" : valor}
          </span>
          <span className="text-[9px] text-[#A1A1AA] font-medium mt-0.5">{unidad}</span>
        </div>
      </div>

      <span className="text-[10px] font-medium text-[#71717A] text-center leading-tight max-w-[80px]">
        {label}
      </span>
    </div>
  );
}
