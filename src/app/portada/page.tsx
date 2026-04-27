export const revalidate = 300;

import Link from "next/link";
import {
  AlertTriangle,
  XCircle,
  ArrowRight,
  MonitorCheck,
  Pickaxe,
  Sun,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { getFlota } from "@/lib/db/queries/flota";
import { getAlertas } from "@/lib/db/queries/alertas";
import { GlosarioRapido } from "@/components/portada/GlosarioRapido";

export default async function PortadaPage() {
  const [flota, alertas] = await Promise.all([getFlota(), getAlertas()]);
  const paros        = flota.filter((e) => e.paroTotal).length;
  const criticos     = flota.filter((e) => !e.paroTotal && e.semaforo.general === "rojo").length;
  const advertencias = alertas.filter((a) => a.estado === "ambar").length;

  const sinAlertas = paros === 0 && criticos === 0 && advertencias === 0;
  const proximoPaso = paros > 0 || criticos > 0
    ? { titulo: "Equipos en estado crítico requieren atención inmediata", url: "/alertas", color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" }
    : advertencias > 0
    ? { titulo: "Revisión de advertencias activas", url: "/alertas", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" }
    : { titulo: "Flota estable — consultar KPIs operacionales del día", url: "/dashboard", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" };

  return (
    <div className="flex flex-col gap-10 max-w-[960px] mx-auto animate-fade-in-up pb-8">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-[#E4E4E7] bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 shrink-0 shadow-glow">
            <Pickaxe size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-[25px] font-bold text-[#09090B] leading-tight tracking-tight">
              Dashboard MSG El Salvador
            </h1>
            <p className="text-[16px] text-[#52525B] mt-1.5">
              Sistema de gestión de KPIs · 28 equipos · Postgres en Supabase
            </p>
          </div>
        </div>

        {/* Estado actual */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          {paros > 0 && (
            <Link href="/alertas" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[16px] font-semibold hover:bg-[#FEE2E2] transition-colors">
              <XCircle size={16} />
              {paros} {paros === 1 ? "Paro" : "Paros"}
            </Link>
          )}
          {criticos > 0 && (
            <Link href="/alertas" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[16px] font-semibold hover:bg-[#FEE2E2] transition-colors">
              <AlertTriangle size={16} />
              {criticos} {criticos === 1 ? "Crítico" : "Críticos"}
            </Link>
          )}
          {advertencias > 0 && (
            <Link href="/alertas" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[16px] font-semibold hover:bg-[#FEF3C7] transition-colors">
              <AlertTriangle size={16} />
              {advertencias} {advertencias === 1 ? "Advertencia" : "Advertencias"}
            </Link>
          )}
          {sinAlertas && (
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[16px] font-semibold">
              <MonitorCheck size={16} />
              Flota sin alertas críticas
            </span>
          )}
        </div>

        {/* Próximo paso recomendado */}
        <Link
          href={proximoPaso.url}
          className="flex items-center gap-3 p-4 rounded-xl border-2 hover:shadow-md transition-all group"
          style={{ backgroundColor: proximoPaso.bg, borderColor: proximoPaso.border }}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shrink-0 shadow-sm">
            <Sparkles size={17} style={{ color: proximoPaso.color }} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: proximoPaso.color, opacity: 0.8 }}>
              Acción recomendada
            </p>
            <p className="text-[17px] font-semibold mt-0.5" style={{ color: proximoPaso.color }}>
              {proximoPaso.titulo}
            </p>
          </div>
          <ArrowRight size={18} style={{ color: proximoPaso.color }} className="shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* ── GUÍA OPERATIVA ───────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-[20px] font-bold text-[#09090B] tracking-tight">
            Procedimiento operativo recomendado
          </h2>
          <span className="text-[13px] text-[#A1A1AA]">— pasos al iniciar la sesión</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Paso
            n="1"
            titulo="Revisar indicadores de estado"
            desc="Verificar la presencia de paros o equipos críticos en los indicadores superiores. En caso afirmativo, dirigirse al Panel de Alertas. De lo contrario, continuar al paso 2."
            url="/alertas"
            urlLabel="Acceder al Panel de Alertas"
            color="#B91C1C"
          />
          <Paso
            n="2"
            titulo="Análisis del panorama operacional"
            desc="El Dashboard presenta los KPIs promedio de la flota (DFM, TMEF, TMPR), el semáforo por tipo de equipo y la tendencia histórica de los últimos 6 meses."
            url="/dashboard"
            urlLabel="Acceder al Dashboard"
            color="#B45309"
          />
          <Paso
            n="3"
            titulo="Análisis individual de equipos"
            desc="En la sección Flota es posible filtrar por tipo de equipo (785D, 777F, 992, PC-2000) y seleccionar una fila para acceder al detalle individual con KPIs y distribución ASARCO."
            url="/flota"
            urlLabel="Acceder a Flota"
            color="#1D4ED8"
          />
          <Paso
            n="4"
            titulo="Generación del reporte mensual"
            desc="Seleccionar el período correspondiente y ejecutar la acción 'Imprimir / PDF'. El reporte se exporta sin sidebar ni controles, listo para distribución a supervisión."
            url="/reporte"
            urlLabel="Acceder a Reporte"
            color="#7C3AED"
          />
        </div>
      </section>

      {/* ── DOS RUTINAS: DIARIA Y CIERRE DE MES ─────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Rutina
          icon={Sun}
          color="#B45309"
          bg="#FFFBEB"
          titulo="Procedimiento diario"
          subtitulo="Al inicio del turno"
          items={[
            { url: "/portada", text: "Acceder al panel de portada — los indicadores de paros y críticos se muestran en la parte superior" },
            { url: "/alertas", text: "Ante alertas críticas: revisar la lista priorizada de paros y equipos en estado rojo" },
            { url: "/dashboard", text: "Consultar los KPIs de flota y la tendencia histórica de 6 meses" },
            { url: "/flota", text: "Realizar análisis detallado de los equipos con desviaciones" },
          ]}
        />
        <Rutina
          icon={CalendarCheck}
          color="#15803D"
          bg="#F0FDF4"
          titulo="Cierre mensual"
          subtitulo="Carga de datos del período"
          items={[
            { url: "/admin/periodos", text: "Crear el período correspondiente al mes (año y mes)" },
            { url: "/admin/kpis", text: "Ingresar los KPIs DFM, TMEF, TMPR, T.Op, Reserva y la distribución ASARCO de cada equipo" },
            { url: "/admin/alertas", text: "Regenerar las alertas (cálculo automático según KPIs y umbrales)" },
            { url: "/apd", text: "Cargar el archivo CSV del análisis de aceites y persistirlo en base de datos" },
            { url: "/reporte", text: "Generar el informe mensual en formato PDF" },
          ]}
        />
      </section>

      {/* ── GLOSARIO ─────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-[17px] font-bold text-[#09090B] uppercase tracking-[0.08em] mb-3">
          Glosario de términos técnicos
        </h2>
        <p className="text-[15px] text-[#52525B] mb-3 leading-relaxed">
          Definiciones de los indicadores y conceptos operacionales utilizados en el sistema.
          Cada KPI del dashboard cuenta con tooltip explicativo. El <strong>Modo Ayuda</strong>{" "}
          (panel inferior del sidebar) habilita las definiciones detalladas en cada métrica.
        </p>
        <GlosarioRapido />
      </section>
    </div>
  );
}

/* ─── helpers visuales ──────────────────────────────────────────────────── */

function Paso({
  n,
  titulo,
  desc,
  url,
  urlLabel,
  color,
}: {
  n: string;
  titulo: string;
  desc: string;
  url: string;
  urlLabel: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-[#E4E4E7] bg-white">
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full text-white text-[16px] font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          {n}
        </span>
        <div className="flex-1">
          <p className="text-[16px] font-semibold text-[#09090B] leading-tight">{titulo}</p>
          <p className="text-[15px] text-[#52525B] mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
      <Link
        href={url}
        className="self-start inline-flex items-center gap-1.5 text-[13px] font-semibold hover:gap-2 transition-all"
        style={{ color }}
      >
        {urlLabel} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

function Rutina({
  icon: Icon,
  color,
  bg,
  titulo,
  subtitulo,
  items,
}: {
  icon: React.ElementType;
  color: string;
  bg: string;
  titulo: string;
  subtitulo: string;
  items: { url: string; text: string }[];
}) {
  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-[#F4F4F5]" style={{ backgroundColor: bg }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shrink-0 shadow-sm">
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="text-[17px] font-bold" style={{ color }}>{titulo}</p>
          <p className="text-[13px]" style={{ color: `${color}cc` }}>{subtitulo}</p>
        </div>
      </div>
      <ol className="flex flex-col">
        {items.map((item, i) => (
          <li key={item.url + i} className="border-t border-[#F4F4F5] first:border-t-0">
            <Link href={item.url} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAFAFA] transition-colors group">
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-mono font-bold shrink-0"
                style={{ backgroundColor: bg, color }}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-[15px] text-[#3F3F46] leading-snug">{item.text}</span>
              <ArrowRight size={13} className="text-[#A1A1AA] group-hover:text-[#52525B] group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

