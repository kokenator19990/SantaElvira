import { clsx } from "clsx";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import type { ParametroApd } from "@/lib/domain/tipos";

function agrupar(datos: ParametroApd[]): Record<string, ParametroApd[]> {
  return datos.reduce<Record<string, ParametroApd[]>>((acc, p) => {
    const key = `${p.equipo} — ${p.compartimento}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
}

export function ApdParameterTable({ datos }: { datos: ParametroApd[] }) {
  const grupos = agrupar(datos);

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(grupos).map(([grupo, params]) => {
        const hayProblemas = params.some((p) => p.estado !== "verde");
        return (
          <div key={grupo} className={clsx(
            "rounded-[10px] overflow-hidden border",
            hayProblemas ? "border-[#FECACA]" : "border-[#E4E4E7]"
          )}>
            <div className={clsx(
              "px-4 py-2.5 flex items-center gap-2 border-b border-[#E4E4E7]",
              hayProblemas ? "bg-[#FEF2F2]" : "bg-[#FAFAFA]"
            )}>
              {hayProblemas && <SemaforoDot estado="ambar" size="sm" />}
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-[0.1em]">
                {grupo}
              </span>
              <span className="ml-auto text-[10px] font-mono text-[#A1A1AA]">
                {params.length} parámetros
              </span>
            </div>
            <table className="w-full text-sm bg-white">
              <thead>
                <tr className="border-b border-[#F4F4F5]">
                  <th className="px-4 py-2 text-left text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">Parámetro</th>
                  <th className="px-4 py-2 text-right text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">Valor</th>
                  <th className="px-4 py-2 text-right text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">Mín</th>
                  <th className="px-4 py-2 text-right text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">Máx</th>
                  <th className="px-4 py-2 text-center text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {params.map((p, i) => (
                  <tr
                    key={i}
                    className={clsx(
                      "border-t border-[#F4F4F5]",
                      p.estado === "rojo" && "bg-[#FEF9F9]"
                    )}
                  >
                    <td className="px-4 py-2.5 text-[#52525B] text-[12px]">{p.parametro}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={clsx(
                        "font-mono font-bold text-[13px]",
                        p.estado === "rojo"  ? "text-[#B91C1C]" :
                        p.estado === "ambar" ? "text-[#B45309]" : "text-[#15803D]"
                      )}>
                        {p.valor}
                      </span>
                      <span className="text-[10px] text-[#A1A1AA] ml-1">{p.unidad}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[11px] text-[#A1A1AA]">
                      {p.limiteMinimo ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[11px] text-[#A1A1AA]">
                      {p.limiteMaximo ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-center">
                        <SemaforoDot estado={p.estado} size="md" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
