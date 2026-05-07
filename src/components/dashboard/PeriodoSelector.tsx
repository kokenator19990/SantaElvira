"use client";

import { useRouter } from "next/navigation";
import type { Periodo } from "@/lib/db/schema";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

interface Props {
  periodos: Periodo[];
  periodoSeleccionadoId: number | undefined;
}

export function PeriodoSelector({ periodos, periodoSeleccionadoId }: Props) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    router.push(val ? `/dashboard?periodo=${val}` : "/dashboard");
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip short="Consulta datos de cualquier período histórico" help={HELP.periodoSelector}>
        <select
          value={periodoSeleccionadoId ?? ""}
          onChange={handleChange}
          className="px-2.5 py-1.5 rounded-[6px] bg-white border border-[#E4E4E7] text-[13px] text-[#3F3F46] focus:outline-none focus:border-[#B45309] transition-colors cursor-pointer"
          aria-label="Seleccionar período histórico"
        >
          {periodos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
              {!p.cerrado ? " (actual)" : ""}
            </option>
          ))}
        </select>
      </Tooltip>
      {periodoSeleccionadoId != null && (
        <button
          onClick={() => router.push("/dashboard")}
          className="px-2 py-1 rounded-[5px] text-[11px] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
          title="Volver al período más reciente"
        >
          Actual
        </button>
      )}
    </div>
  );
}
