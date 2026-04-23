"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Truck, BellRing, FileText } from "lucide-react";
import { clsx } from "clsx";
import { ALERTAS } from "@/lib/data/alertas";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/portada",   label: "Inicio",    icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/flota",     label: "Flota",     icon: Truck },
  { href: "/alertas",   label: "Alertas",   icon: BellRing, badge: true },
  { href: "/reporte",   label: "Reporte",   icon: FileText },
];

const alertasRojas = ALERTAS.filter((a) => a.estado === "paro" || a.estado === "rojo").length;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="no-print lg:hidden fixed bottom-0 inset-x-0 z-40 flex"
      aria-label="Navegación inferior"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="w-full flex items-stretch bg-white/95 backdrop-blur-md border-t border-[#E4E4E7]">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const activo =
            pathname === href ||
            (href !== "/dashboard" && href !== "/portada" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]",
                "transition-colors duration-150",
                activo ? "text-[#B45309]" : "text-[#71717A]"
              )}
              aria-label={label}
              aria-current={activo ? "page" : undefined}
            >
              {/* Badge de alertas */}
              {badge && alertasRojas > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-8px)] flex items-center justify-center w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-bold leading-none z-10">
                  {alertasRojas > 9 ? "9+" : alertasRojas}
                </span>
              )}

              <Icon
                size={20}
                strokeWidth={activo ? 2.2 : 1.7}
                className="shrink-0"
              />
              <span className="text-[10px] font-medium leading-none">{label}</span>

              {/* Dot activo */}
              {activo && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#B45309]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
