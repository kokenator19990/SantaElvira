import { notFound } from "next/navigation";
import { getEquipoPorId } from "@/lib/db/queries/flota";
import { getTendenciaPorTipo } from "@/lib/db/queries/tendencias";
import { EquipoHeader } from "@/components/equipo/EquipoHeader";
import { EquipoKpiPanel } from "@/components/equipo/EquipoKpiPanel";
import { EquipoAsarcoBar } from "@/components/equipo/EquipoAsarcoBar";
import { TendenciaSeisMeses } from "@/components/charts/lazy";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface Props {
  params: { equipoId: string };
}

export default async function EquipoPage({ params }: Props) {
  const equipo = await getEquipoPorId(params.equipoId.toUpperCase());
  if (!equipo) notFound();

  const tendencia = await getTendenciaPorTipo(equipo.tipoFlota);

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      <EquipoHeader equipo={equipo} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Columna izquierda — KPIs + ASARCO */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <section>
            <SectionTitle className="mb-3">KPIs del Equipo</SectionTitle>
            <EquipoKpiPanel equipo={equipo} />
          </section>

          <section>
            <SectionTitle className="mb-3">Distribución ASARCO</SectionTitle>
            <div className="p-4 rounded-xl bg-white border border-[#E4E4E7]">
              <EquipoAsarcoBar asarco={equipo.asarco} />
            </div>
          </section>

          {/* Detalles del equipo */}
          <section>
            <SectionTitle className="mb-3">Datos del Equipo</SectionTitle>
            <div className="flex flex-col divide-y divide-[#F4F4F5] rounded-xl bg-white border border-[#E4E4E7] overflow-hidden">
              {[
                { label: "Modelo", valor: equipo.modelo },
                { label: "Tipo flota", valor: equipo.tipoFlota },
                { label: "Año", valor: String(equipo.anio) },
                { label: "Horas acumuladas", valor: `${equipo.horasAcumuladas.toLocaleString("es-CL")} h` },
                { label: "Última actualización", valor: new Date(equipo.ultimaActualizacion).toLocaleDateString("es-CL") },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center px-4 py-2.5 text-sm">
                  <span className="text-[#71717A]">{item.label}</span>
                  <span className="font-medium text-[#09090B]">{item.valor}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Columna derecha — Tendencia */}
        <div className="lg:col-span-3">
          <SectionTitle className="mb-3">Tendencia 6 Meses — {equipo.modelo}</SectionTitle>
          {tendencia ? (
            <TendenciaSeisMeses datos={tendencia.datos} titulo={`Flota ${tendencia.modelo}`} />
          ) : (
            <p className="text-sm text-[#71717A]">Sin datos de tendencia disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}
