"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, ChevronRight } from "lucide-react";

function resolverRuta(pathname: string, totalEquipos: number) {
  const RUTAS: Record<string, { titulo: string; subtitulo?: string }> = {
    "/portada":   { titulo: "Portada",       subtitulo: "Panel de bienvenida" },
    "/dashboard": { titulo: "Dashboard",     subtitulo: "Vista general" },
    "/flota":     { titulo: "Flota",         subtitulo: `${totalEquipos} equipos` },
    "/alertas":   { titulo: "Alertas",       subtitulo: "Estado en tiempo real" },
    "/apd":       { titulo: "APD Aceites",   subtitulo: "Análisis predictivo" },
    "/reporte":     { titulo: "Reporte",       subtitulo: "Informe mensual" },
    "/explorador":  { titulo: "Explorador",    subtitulo: "Vista planilla interactiva" },
  };
  if (RUTAS[pathname]) return RUTAS[pathname];
  if (pathname.startsWith("/flota/")) {
    const id = pathname.split("/flota/")[1]?.toUpperCase();
    return { titulo: `Equipo ${id ?? ""}`, subtitulo: "Detalle individual" };
  }
  return { titulo: "MSG Dashboard" };
}

function obtenerTurno() {
  const h = new Date().getHours();
  return h >= 6 && h < 18
    ? { label: "Turno Día",   color: "bg-yellow-400" }
    : { label: "Turno Noche", color: "bg-blue-400" };
}

interface TopBarProps {
  onMenuClick: () => void;
  totalEquipos: number;
}

export function TopBar({ onMenuClick, totalEquipos }: TopBarProps) {
  const pathname = usePathname();
  const { titulo, subtitulo } = resolverRuta(pathname, totalEquipos);

  const [now, setNow] = useState<Date | null>(null);
  const [turno, setTurno] = useState<{ label: string; color: string } | null>(null);
  useEffect(() => {
    setNow(new Date());
    setTurno(obtenerTurno());
    const id = setInterval(() => {
      setNow(new Date());
      setTurno(obtenerTurno());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const hoy = now?.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }) ?? "";

  const hora = now?.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }) ?? "";

  return (
    <header className="no-print flex items-center h-[56px] px-4 lg:px-6 bg-white border-b border-[#E4E4E7] gap-4 shrink-0">
      {/* Hamburger mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors min-w-[36px]"
        aria-label="Abrir menú de navegación"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb + título */}
      <div className="flex flex-col leading-tight min-w-0">
        <div className="flex items-center gap-1 text-[11px] text-[#A1A1AA] font-medium uppercase tracking-wider">
          <span>MSG</span>
          <ChevronRight size={10} className="text-[#A1A1AA]" />
          <span className="text-[#71717A]">{titulo}</span>
        </div>
        <p className="text-[17px] font-semibold text-[#09090B] tracking-tight truncate leading-snug">
          {titulo}
          {subtitulo && (
            <span className="ml-2 text-[13px] font-normal text-[#71717A]">{subtitulo}</span>
          )}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Fecha */}
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="text-[12px] font-mono text-[#A1A1AA] uppercase tracking-wider">{hoy}</span>
          <span className="text-[15px] font-mono font-semibold text-[#52525B]">{hora}</span>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-6 w-px bg-[#E4E4E7]" />

        {/* Turno activo */}
        {turno && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7]">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${turno.color} opacity-50`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${turno.color}`} />
            </span>
            <span className="text-[13px] font-medium text-[#52525B] whitespace-nowrap">{turno.label}</span>
          </div>
        )}
      </div>
    </header>
  );
}
