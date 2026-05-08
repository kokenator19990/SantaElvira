import type { Metadata } from "next";
export const metadata: Metadata = { title: "Admin" };
export const revalidate = 0;

import Link from "next/link";
import { Activity, Truck, Calendar, ShieldAlert, ArrowRight, Sliders, Upload, LogOut, ClipboardList, Wrench, Calculator } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import { getPeriodoActual } from "@/lib/db/queries/periodos";
import { logout } from "@/lib/db/actions/auth";

// Orden: sigue el flujo operativo recomendado (1→5), luego herramientas secundarias
const SECCIONES = [
  {
    href: "/admin/periodos",
    icon: Calendar,
    titulo: "1. Gestión de Períodos",
    descripcion: "Crear el período mensual antes de cargar datos. Cerrar períodos consolidados para evitar modificaciones posteriores.",
    helpKey: "adminPeriodos",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    href: "/admin/registro-diario",
    icon: ClipboardList,
    titulo: "2. Registro Diario de Horas",
    descripcion: "Ingreso diario de horas por equipo en las 5 categorías ASARCO. Este es el dato crudo que reemplaza la planilla Excel.",
    helpKey: "registroDiario",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    href: "/admin/fallas",
    icon: Wrench,
    titulo: "3. Registro de Fallas",
    descripcion: "Registro de eventos de falla con fecha, componente y horas de reparación. Alimenta el cálculo de TMEF y TMPR.",
    helpKey: "registroFallas",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  {
    href: "/admin/calcular-kpis",
    icon: Calculator,
    titulo: "4. Calcular KPIs desde Datos",
    descripcion: "Genera automáticamente los KPIs del período a partir de los registros diarios y las fallas. Reemplaza el cálculo manual en Excel.",
    helpKey: "calcularKpis",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    href: "/admin/equipos",
    icon: Truck,
    titulo: "Gestión de Flota",
    descripcion: "Alta de equipos nuevos, baja de equipos existentes y modificación de metadatos operacionales (modelo, año de fabricación, tipo de flota).",
    helpKey: "adminEquipos",
    color: "#1D4ED8",
    bg: "#EFF6FF",
  },
  {
    href: "/admin/kpis",
    icon: Activity,
    titulo: "Carga Manual de KPIs",
    descripcion: "Registro manual de KPIs (DFM, TMEF, TMPR) y distribución ASARCO de cada equipo. Usar solo si los KPIs ya están calculados externamente.",
    helpKey: "adminKpis",
    color: "#B45309",
    bg: "#FFFBEB",
  },
  {
    href: "/admin/kpis/importar",
    icon: Upload,
    titulo: "Importar KPIs desde CSV",
    descripcion: "Carga masiva de KPIs y ASARCO desde un archivo CSV. Útil para importar desde planillas Excel exportadas. Incluye validación y previsualización.",
    helpKey: "adminImportarCsv",
    color: "#0891B2",
    bg: "#ECFEFF",
  },
  {
    href: "/admin/alertas",
    icon: ShieldAlert,
    titulo: "Regeneración de Alertas",
    descripcion: "Recálculo de las alertas activas según los KPIs vigentes y los umbrales operacionales definidos. Operación recomendada tras cada carga de datos.",
    helpKey: "adminAlertas",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  {
    href: "/admin/umbrales",
    icon: Sliders,
    titulo: "Configurar Umbrales",
    descripcion: "Modificar los valores de referencia verde/ámbar/rojo para cada KPI. Los cambios aplican al próximo recálculo de alertas y semáforos.",
    helpKey: "adminUmbrales",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
];

export default async function AdminPage() {
  const periodoActual = await getPeriodoActual();

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
        <SectionTitle>
          <Tooltip short="Panel de carga manual de datos" help={HELP.navAdmin}>
            Administración
          </Tooltip>
        </SectionTitle>
        <p className="text-[13px] text-[#52525B] mt-2 max-w-2xl leading-relaxed">
          Módulo de carga de datos operacionales. Registra horas diarias y fallas para que el sistema
          calcule los KPIs automáticamente — o carga KPIs directamente si ya están calculados.
          Cada operación se persiste en base de datos y se refleja en el dashboard.
        </p>
        {periodoActual && (
          <p className="text-[13px] text-[#52525B] mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
            Período activo: <strong className="text-[#92400E]">{periodoActual.label}</strong>
            {periodoActual.cerrado && <span className="text-[#71717A]">· cerrado (solo lectura)</span>}
          </p>
        )}
        </div>

        {/* Cerrar sesión */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white border border-[#E4E4E7] text-[12px] text-[#71717A] hover:text-[#B91C1C] hover:border-[#FECACA] transition-colors"
          >
            <LogOut size={12} />
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Flujo operativo recomendado */}
      <div className="flex flex-col gap-2 px-4 py-3 rounded-[10px] bg-[#F5F3FF] border border-[#DDD6FE]">
        <span className="text-[11px] font-bold text-[#5B21B6] uppercase tracking-wider">Flujo operativo recomendado</span>
        <div className="flex items-center gap-1.5 flex-wrap text-[12px]">
          {[
            { label: "1. Crear período", href: "/admin/periodos" },
            { label: "2. Registrar horas diarias", href: "/admin/registro-diario" },
            { label: "3. Registrar fallas", href: "/admin/fallas" },
            { label: "4. Calcular KPIs", href: "/admin/calcular-kpis" },
            { label: "5. Verificar dashboard", href: "/dashboard" },
          ].map((paso, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ArrowRight size={10} className="text-[#A78BFA]" />}
              <Link href={paso.href} className="px-2 py-1 rounded-[5px] bg-white border border-[#DDD6FE] text-[#5B21B6] hover:bg-[#EDE9FE] transition-colors font-medium">
                {paso.label}
              </Link>
            </span>
          ))}
        </div>
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
                <p className="text-[16px] font-semibold text-[#09090B]">{titulo}</p>
              </Tooltip>
              <p className="text-[13px] text-[#71717A] mt-1 leading-relaxed">{descripcion}</p>
            </div>
            <div
              className="flex items-center gap-1 text-[13px] font-semibold group-hover:gap-2 transition-all duration-150"
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
