import Link from "next/link";
import { ChevronLeft, Calendar, Clock, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import type { Equipo } from "@/lib/domain/tipos";

interface EquipoHeaderProps {
  equipo: Equipo;
}

export function EquipoHeader({ equipo }: EquipoHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/flota"
        className="flex items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-[#52525B] transition-colors w-fit"
      >
        <ChevronLeft size={13} />
        <span>Volver a Flota</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 rounded-[10px] bg-white border border-[#E4E4E7]">
        <div className="flex items-start gap-3">
          <SemaforoDot estado={equipo.semaforo.general} size="lg" className="mt-1" />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[22px] font-mono font-bold text-[#09090B]">{equipo.id}</h1>
              <StatusBadge estado={equipo.semaforo.general} />
            </div>
            <p className="text-[13px] text-[#71717A] mt-0.5">{equipo.modelo}</p>
            {equipo.paroTotal && (
              <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] w-fit">
                <AlertTriangle size={12} className="text-[#B91C1C] shrink-0" />
                <p className="text-[12px] text-[#991B1B] font-medium">{equipo.motivoParo}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 text-[12px] text-[#71717A]">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-[#A1A1AA]" />
            <span className="font-mono">{equipo.anio}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#A1A1AA]" />
            <span className="font-mono">{equipo.horasAcumuladas.toLocaleString("es-CL")} h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
