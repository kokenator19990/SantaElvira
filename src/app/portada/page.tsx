"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Truck,
  BellRing,
  FlaskConical,
  FileText,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ArrowRight,
  MonitorCheck,
  Pickaxe,
} from "lucide-react";
import { FLOTA } from "@/lib/data/flota";
import { ALERTAS } from "@/lib/data/alertas";

// ─── Datos derivados ──────────────────────────────────────────────────────────
const paros    = FLOTA.filter((e) => e.paroTotal).length;
const criticos = FLOTA.filter((e) => !e.paroTotal && e.semaforo.general === "rojo").length;
const advertencias = ALERTAS.filter((a) => a.estado === "ambar").length;

// ─── Secciones del sistema ────────────────────────────────────────────────────
const SECCIONES = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    titulo: "Dashboard",
    descripcion: "Estado general de toda la flota: semáforos, disponibilidad y tendencias por mes.",
    color: "#B45309",
    bg: "#FFFBEB",
  },
  {
    href: "/flota",
    icon: Truck,
    titulo: "Flota",
    descripcion: "Ficha individual de cada equipo: KPIs, distribución ASARCO y detalle de fallas.",
    color: "#1D4ED8",
    bg: "#EFF6FF",
  },
  {
    href: "/alertas",
    icon: BellRing,
    titulo: "Alertas",
    descripcion: "Lista de equipos fuera de umbral ordenados por criticidad. Paros primero.",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  {
    href: "/apd",
    icon: FlaskConical,
    titulo: "APD Aceites",
    descripcion: "Sube un CSV del laboratorio y el sistema detecta parámetros fuera de rango.",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    href: "/reporte",
    icon: FileText,
    titulo: "Reporte",
    descripcion: "Genera el informe mensual PDF listo para imprimir. Compara períodos anteriores.",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
] as const;

// ─── Glosario ─────────────────────────────────────────────────────────────────
const GLOSARIO = [
  {
    sigla: "DFM",
    nombre: "Disponibilidad Física Mecánica",
    definicion: "Porcentaje del turno en que el equipo está mecánicamente listo para trabajar.",
    ejemplo: "DFM 88% → De 100 horas, el equipo estuvo disponible 88h y solo 12h en reparación.",
    meta: "Meta: ≥ 85% (verde) · 75–85% (ámbar) · < 75% (rojo)",
  },
  {
    sigla: "TMEF",
    nombre: "Tiempo Medio Entre Fallas",
    definicion: "Promedio de horas que opera un equipo sin sufrir ninguna falla.",
    ejemplo: "TMEF 80h → El equipo falla en promedio cada 80 horas de operación.",
    meta: "Meta: ≥ 80h (verde) · 50–80h (ámbar) · < 50h (rojo)",
  },
  {
    sigla: "TMPR",
    nombre: "Tiempo Medio de Parada por Reparación",
    definicion: "Promedio de horas que dura cada reparación desde la falla hasta que el equipo vuelve a operar.",
    ejemplo: "TMPR 4h → En promedio, cada reparación tarda 4 horas.",
    meta: "Meta: ≤ 5h (verde) · 5–15h (ámbar) · > 15h (rojo)",
  },
  {
    sigla: "ASARCO",
    nombre: "Distribución ASARCO",
    definicion: "Método estándar minero que divide el tiempo del equipo en: Operativo, Reserva, Detención Programada, Detención No Programada y Pérdida Operacional.",
    ejemplo: "Un equipo con 83% Operativo, 6% Reserva y 6% Det. Programada tiene una distribución saludable.",
    meta: "Objetivo: maximizar Operativo y minimizar Detención No Programada.",
  },
  {
    sigla: "APD",
    nombre: "Análisis Predictivo de Aceites",
    definicion: "Análisis de laboratorio de muestras de aceite de los compartimentos del equipo para detectar desgaste antes de una falla.",
    ejemplo: "Nivel de hierro > 120 ppm en el motor indica desgaste acelerado → inspeccionar antes de la próxima guardia.",
    meta: "Cada parámetro tiene límites mínimo y máximo definidos por el fabricante.",
  },
] as const;

export default function PortadaPage() {
  const [glosarioAbierto, setGlosarioAbierto] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 max-w-[900px] mx-auto animate-fade-in-up">

      {/* ── HERO STRIP ─────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-[#E4E4E7] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500 shrink-0">
            <Pickaxe size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-[#09090B] leading-tight">
              Panel de Control MSG
            </h1>
            <p className="text-[12px] text-[#71717A] mt-0.5">Faena El Salvador — Estado del turno</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {paros > 0 && (
            <Link
              href="/alertas"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[13px] font-semibold hover:bg-[#FEE2E2] transition-colors"
            >
              <XCircle size={14} />
              {paros} {paros === 1 ? "Paro" : "Paros"}
            </Link>
          )}
          {criticos > 0 && (
            <Link
              href="/alertas"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[13px] font-semibold hover:bg-[#FEE2E2] transition-colors"
            >
              <AlertTriangle size={14} />
              {criticos} {criticos === 1 ? "Crítico" : "Críticos"}
            </Link>
          )}
          {advertencias > 0 && (
            <Link
              href="/alertas"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[13px] font-semibold hover:bg-[#FEF3C7] transition-colors"
            >
              <AlertTriangle size={14} />
              {advertencias} {advertencias === 1 ? "Advertencia" : "Advertencias"}
            </Link>
          )}
          {paros === 0 && criticos === 0 && advertencias === 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[13px] font-semibold">
              <MonitorCheck size={14} />
              Flota sin alertas críticas
            </span>
          )}
        </div>
      </section>

      {/* ── GUÍA RÁPIDA ────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-[13px] font-bold text-[#09090B] uppercase tracking-[0.08em] mb-3">
          ¿Cómo usar este sistema?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              n: "1",
              titulo: "Al inicio del turno",
              desc: "Abre este panel y revisa los chips de estado. Si hay paros o críticos, ve directamente a Alertas.",
            },
            {
              n: "2",
              titulo: "Revisa la flota",
              desc: "En 'Flota' puedes ver el estado individual de cada equipo: qué tan bien está disponible y cuánto tarda en repararse.",
            },
            {
              n: "3",
              titulo: "Sigue las alertas",
              desc: "Las alertas muestran qué equipos están fuera de los límites normales. Los paros siempre aparecen primero.",
            },
            {
              n: "4",
              titulo: "Al cierre del mes",
              desc: "Genera el reporte en 'Reporte', elige el período, y usa 'Imprimir / PDF' para enviarlo a supervisión.",
            },
          ].map(({ n, titulo, desc }) => (
            <div key={n} className="flex gap-3 p-4 rounded-xl border border-[#E4E4E7] bg-white">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#09090B] text-white text-[12px] font-bold shrink-0">
                {n}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#09090B]">{titulo}</p>
                <p className="text-[12px] text-[#71717A] mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIONES DEL SISTEMA ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-[13px] font-bold text-[#09090B] uppercase tracking-[0.08em] mb-3">
          Secciones del sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SECCIONES.map(({ href, icon: Icon, titulo, descripcion, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 p-4 rounded-xl border border-[#E4E4E7] bg-white hover:border-[#D4D4D8] hover:shadow-sm transition-all duration-150"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ backgroundColor: bg }}
              >
                <Icon size={20} style={{ color }} strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#09090B]">{titulo}</p>
                <p className="text-[12px] text-[#71717A] mt-1 leading-relaxed">{descripcion}</p>
              </div>
              <div
                className="flex items-center gap-1 text-[12px] font-semibold group-hover:gap-2 transition-all duration-150"
                style={{ color }}
              >
                Ir <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── GLOSARIO RÁPIDO ────────────────────────────────────────────────── */}
      <section className="mb-4">
        <h2 className="text-[13px] font-bold text-[#09090B] uppercase tracking-[0.08em] mb-3">
          Glosario rápido
        </h2>
        <div className="rounded-xl border border-[#E4E4E7] bg-white divide-y divide-[#F4F4F5]">
          {GLOSARIO.map(({ sigla, nombre, definicion, ejemplo, meta }) => {
            const abierto = glosarioAbierto === sigla;
            return (
              <div key={sigla}>
                <button
                  onClick={() => setGlosarioAbierto(abierto ? null : sigla)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#FAFAFA] transition-colors"
                  aria-expanded={abierto}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded font-mono tracking-wider">
                      {sigla}
                    </span>
                    <span className="text-[13px] font-medium text-[#09090B]">{nombre}</span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-[#A1A1AA] shrink-0 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
                  />
                </button>
                {abierto && (
                  <div className="px-4 pb-4 pt-1 space-y-2 bg-[#FAFAFA]">
                    <p className="text-[13px] text-[#3F3F46] leading-relaxed">{definicion}</p>
                    <div className="flex items-start gap-2 rounded-lg bg-[#F4F4F5] px-3 py-2">
                      <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mt-0.5 shrink-0">Ej.</span>
                      <p className="text-[12px] text-[#52525B] leading-relaxed">{ejemplo}</p>
                    </div>
                    <p className="text-[11px] text-[#71717A]">{meta}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
