"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Truck,
  BellRing,
  FlaskConical,
  FileText,
  BookOpen,
  X,
  Pickaxe,
  HelpCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { FLOTA } from "@/lib/data/flota";
import { useHelpMode } from "@/contexts/HelpModeContext";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";

const NAV_ITEMS = [
  { href: "/portada",   label: "Portada",     icon: Home,            description: "Bienvenida",       helpKey: "navDashboard" },
  { href: "/dashboard", label: "Dashboard",   icon: LayoutDashboard, description: "KPIs y estado",    helpKey: "navDashboard" },
  { href: "/flota",     label: "Flota",       icon: Truck,           description: `${FLOTA.length} equipos`, helpKey: "navFlota" },
  { href: "/alertas",   label: "Alertas",     icon: BellRing,        description: "Activas ahora",    helpKey: "navAlertas" },
  { href: "/apd",       label: "APD Aceites", icon: FlaskConical,    description: "Análisis aceites", helpKey: "navApd" },
  { href: "/reporte",   label: "Reporte",     icon: FileText,        description: "Informe mensual",  helpKey: "navReporte" },
  { href: "/docs",      label: "Documentacion", icon: BookOpen,       description: "Modelo y arquitectura", helpKey: "navDocs" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isActive: helpActive, toggle: toggleHelp } = useHelpMode();

  return (
    <aside
      className={clsx(
        "no-print flex-shrink-0 flex flex-col w-[240px] h-screen",
        "bg-white border-r border-[#E4E4E7]",
        "fixed top-0 left-0 z-30",
        "transition-transform duration-220 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "lg:relative lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 h-[56px] border-b border-[#E4E4E7]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 shadow-glow">
          <Pickaxe size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-bold text-[#09090B] tracking-tight">MSG</span>
          <span className="text-[10px] text-[#A1A1AA] font-medium">El Salvador · Faena</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden ml-auto flex items-center justify-center w-7 h-7 rounded text-[#71717A] hover:text-[#09090B] transition-colors"
          aria-label="Cerrar menú"
        >
          <X size={15} />
        </button>
      </div>

      {/* Nav section */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Navegación principal">
        <div className="px-2 mb-3">
          <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-[0.12em]">
            Navegación
          </span>
        </div>

        {NAV_ITEMS.map(({ href, label, icon: Icon, description, helpKey }) => {
          const activo = pathname === href || (href !== "/dashboard" && href !== "/portada" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                "group flex items-center gap-3 px-3 py-2.5 rounded-[8px]",
                "text-sm font-medium min-h-[44px]",
                "transition-all duration-150 ease-out",
                activo
                  ? "bg-[#FFFBEB] text-[#92400E] border-l-2 border-[#B45309] border-t-0 border-r-0 border-b-0"
                  : "text-[#52525B] hover:text-[#09090B] hover:bg-[#F4F4F5] border border-transparent"
              )}
            >
              <Icon
                size={16}
                strokeWidth={activo ? 2.2 : 1.7}
                className={clsx(
                  "shrink-0 transition-colors",
                  activo ? "text-[#B45309]" : "text-[#A1A1AA] group-hover:text-[#52525B]"
                )}
              />
              <Tooltip
                short={description}
                help={HELP[helpKey]}
                className="flex-1"
              >
                <div className="flex flex-col leading-tight">
                  <span>{label}</span>
                  <span className={clsx(
                    "text-[10px] font-normal transition-colors",
                    activo ? "text-[#B45309]/70" : "text-[#A1A1AA] group-hover:text-[#71717A]"
                  )}>
                    {description}
                  </span>
                </div>
              </Tooltip>
              {activo && (
                <div className="ml-auto w-1 h-4 rounded-full bg-[#B45309] opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#E4E4E7]">
        <button
          onClick={toggleHelp}
          aria-pressed={helpActive}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-3 transition-all duration-150 border text-left ${
            helpActive
              ? "bg-amber-500 border-amber-400 text-white shadow-md"
              : "bg-[#F4F4F5] border-[#E4E4E7] text-[#52525B] hover:bg-[#FFFBEB] hover:border-[#FDE68A] hover:text-[#92400E]"
          }`}
        >
          <HelpCircle
            size={15}
            className={`shrink-0 ${helpActive ? "text-white" : "text-[#A1A1AA]"}`}
            strokeWidth={helpActive ? 2.5 : 1.8}
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[12px] font-semibold">
              {helpActive ? "Ayuda activa" : "Modo Ayuda"}
            </span>
            <span className={`text-[10px] font-normal ${helpActive ? "text-amber-100" : "text-[#A1A1AA]"}`}>
              {helpActive ? "ESC para salir" : "Explica cada indicador"}
            </span>
          </div>
          {helpActive && (
            <span className="ml-auto relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-[#A1A1AA]">Sistema activo</span>
        </div>
        <p className="text-[10px] text-[#A1A1AA]">Dashboard KPI v1.0 · Abr 2025</p>
      </div>
    </aside>
  );
}
