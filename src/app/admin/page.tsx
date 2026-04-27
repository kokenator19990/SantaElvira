export const revalidate = 300;

import Link from "next/link";
import { Activity, Truck, Calendar, ShieldAlert, ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import { getPeriodoActual } from "@/lib/db/queries/periodos";

const SECCIONES = [
  {
    href: "/admin/kpis",
    icon: Activity,
    titulo: "Cargar KPIs Mensuales",
    descripcion: "Ingresa los DFM, TMEF, TMPR y ASARCO de cada equipo del mes seleccionado. Los datos se guardan al instante en la base de datos.",
    helpKey: "adminKpis",
    color: "#B45309",
    bg: "#FFFBEB",
  },
  {
    href: "/admin/equipos",
    icon: Truck,
    titulo: "Gestionar Flota",
    descripcion: "Agrega un equipo nuevo, da de baja uno existente, o corrige metadata (modelo, año de fabricación).",
    helpKey: "adminEquipos",
    color: "#1D4ED8",
    bg: "#EFF6FF",
  },
  {
    href: "/admin/periodos",
    icon: Calendar,
    titulo: "Períodos",
    descripcion: "Crea el período del próximo mes antes de cargar sus KPIs. Cierra meses que ya no se editan.",
    helpKey: "adminPeriodos",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    href: "/admin/alertas",
    icon: ShieldAlert,
    titulo: "Regenerar Alertas",
    descripcion: "Recalcula las alertas activas según los KPIs y umbrales vigentes. Útil tras cargar nuevos datos.",
    helpKey: "adminAlertas",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
];

export default async function AdminPage() {
  const periodoActual = await getPeriodoActual();

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
      <div>
        <SectionTitle>
          <Tooltip short="Panel de carga manual de datos" help={HELP.navAdmin}>
            Administración
          </Tooltip>
        </SectionTitle>
        <p className="text-[12px] text-[#71717A] mt-2 max-w-2xl leading-relaxed">
          Carga manual de datos. Si ya están los KPIs del mes en una planilla Excel,
          aquí los pasas al sistema. Cada cambio se guarda directamente en Postgres y
          se refleja en el dashboard.
        </p>
        {periodoActual && (
          <p className="text-[11px] text-[#52525B] mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
            Último período con datos: <strong className="text-[#92400E]">{periodoActual.label}</strong>
            {periodoActual.cerrado && <span className="text-[#71717A]">· cerrado</span>}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECCIONES.map(({ href, icon: Icon, titulo, descripcion, helpKey, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 p-5 rounded-xl border border-[#E4E4E7] bg-white hover:border-[#D4D4D8] hover:shadow-sm transition-all duration-150"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: bg }}
            >
              <Icon size={20} style={{ color }} strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <Tooltip short={descripcion} help={HELP[helpKey]}>
                <p className="text-[14px] font-semibold text-[#09090B]">{titulo}</p>
              </Tooltip>
              <p className="text-[12px] text-[#71717A] mt-1 leading-relaxed">{descripcion}</p>
            </div>
            <div
              className="flex items-center gap-1 text-[12px] font-semibold group-hover:gap-2 transition-all duration-150"
              style={{ color }}
            >
              Abrir <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
