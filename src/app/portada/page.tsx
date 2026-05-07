export const revalidate = 300;

import Link from "next/link";
import {
  ArrowRight,
  Pickaxe,
  Sun,
  CalendarCheck,
  Sparkles,
  Eye,
  BellRing,
  TrendingUp,
  Truck,
  FileText,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { getFlota } from "@/lib/db/queries/flota";
import { getAlertas } from "@/lib/db/queries/alertas";
import { clasificarDfm } from "@/lib/domain/semaforo";
import type { EstadoSemaforo } from "@/lib/domain/tipos";
import { GlosarioRapido } from "@/components/portada/GlosarioRapido";
import { Tooltip } from "@/components/ui/Tooltip";
import { HELP } from "@/lib/help-content";
import { round1 } from "@/lib/utils/safe-parse";

const ESTADO_COLOR: Record<EstadoSemaforo, string> = {
  verde: "#15803D",
  ambar: "#B45309",
  rojo:  "#B91C1C",
  paro:  "#991B1B",
};

export default async function PortadaPage() {
  const [flota, alertas] = await Promise.all([getFlota(), getAlertas()]);
  const paros        = flota.filter((e) => e.paroTotal).length;
  const criticos     = flota.filter((e) => !e.paroTotal && e.semaforo.general === "rojo").length;
  const advertencias = alertas.filter((a) => a.estado === "ambar").length;

  const activos     = flota.filter((e) => !e.paroTotal);
  const estables    = activos.length - criticos;
  const dfmPromedio = activos.length > 0
    ? round1(activos.reduce((a, e) => a + e.kpis.dfm, 0) / activos.length)
    : 0;
  const estadoDfm   = clasificarDfm(dfmPromedio);

  const proximoPaso = paros > 0
    ? {
        titulo: `${paros} equipo${paros > 1 ? "s" : ""} detenido${paros > 1 ? "s" : ""} — ve a Alertas para coordinar reparación`,
        url: "/alertas",
        color: "#B91C1C",
        bg: "#FEF2F2",
        border: "#FECACA",
      }
    : criticos > 0
    ? {
        titulo: `${criticos} equipo${criticos > 1 ? "s" : ""} con indicadores críticos — revisa el detalle en Alertas`,
        url: "/alertas",
        color: "#B91C1C",
        bg: "#FEF2F2",
        border: "#FECACA",
      }
    : advertencias > 0
    ? {
        titulo: `${advertencias} advertencia${advertencias > 1 ? "s" : ""} — revisa antes de que se conviertan en problemas`,
        url: "/alertas",
        color: "#92400E",
        bg: "#FFFBEB",
        border: "#FDE68A",
      }
    : {
        titulo: "Todo en orden — consulta los indicadores del período en el Dashboard",
        url: "/dashboard",
        color: "#15803D",
        bg: "#F0FDF4",
        border: "#BBF7D0",
      };

  return (
    <div className="flex flex-col gap-6 sm:gap-10 max-w-[960px] mx-auto animate-fade-in-up pb-20 lg:pb-8">

      {/* ── CENTRO DE COMANDO ──────────────────────────────────────────────── */}
      <section className="rounded-xl border border-[#E4E4E7] bg-white p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500 shrink-0 shadow-glow">
            <Pickaxe size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#09090B] leading-tight tracking-tight">
              Centro de Comando
            </h1>
            <p className="text-[13px] text-[#71717A]">
              Faena El Salvador — {flota.length} equipos
            </p>
          </div>
        </div>

        {/* 3 números grandes: Paros / Críticos / Estables */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="flex flex-col items-center p-3 sm:p-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
            <span className="text-[40px] sm:text-[48px] md:text-[64px] font-mono font-black text-[#B91C1C] leading-none">
              {paros}
            </span>
            <span className="text-[13px] sm:text-[16px] font-bold text-[#991B1B] mt-2">
              {paros === 1 ? "Paro" : "Paros"}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#B91C1C]/60 mt-1 text-center leading-tight">
              Detenidos completamente
            </span>
          </div>

          <div className="flex flex-col items-center p-3 sm:p-6 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
            <span className="text-[40px] sm:text-[48px] md:text-[64px] font-mono font-black text-[#B45309] leading-none">
              {criticos}
            </span>
            <span className="text-[13px] sm:text-[16px] font-bold text-[#92400E] mt-2">
              {criticos === 1 ? "Crítico" : "Críticos"}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#B45309]/60 mt-1 text-center leading-tight">
              Operan con problemas
            </span>
          </div>

          <div className="flex flex-col items-center p-3 sm:p-6 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
            <span className="text-[40px] sm:text-[48px] md:text-[64px] font-mono font-black text-[#15803D] leading-none">
              {estables}
            </span>
            <span className="text-[13px] sm:text-[16px] font-bold text-[#15803D] mt-2">
              Estables
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#15803D]/60 mt-1 text-center leading-tight">
              Operando normalmente
            </span>
          </div>
        </div>

        {/* Acción recomendada */}
        <Link
          href={proximoPaso.url}
          className="flex items-center gap-3 p-4 rounded-xl border-2 hover:shadow-md transition-all group"
          style={{ backgroundColor: proximoPaso.bg, borderColor: proximoPaso.border }}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shrink-0 shadow-sm">
            <Sparkles size={17} style={{ color: proximoPaso.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: proximoPaso.color, opacity: 0.7 }}>
              Qué hacer ahora
            </p>
            <p className="text-[15px] sm:text-[17px] font-semibold mt-0.5 leading-snug" style={{ color: proximoPaso.color }}>
              {proximoPaso.titulo}
            </p>
          </div>
          <ArrowRight size={18} style={{ color: proximoPaso.color }} className="shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Links rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {[
            { href: "/alertas",   label: "Alertas",     icon: BellRing,        color: "#B45309" },
            { href: "/dashboard", label: "Dashboard",   icon: LayoutDashboard, color: "#1D4ED8" },
            { href: "/flota",     label: "Flota",       icon: Truck,           color: "#52525B" },
            { href: "/reporte",   label: "Reporte PDF", icon: FileText,        color: "#7C3AED" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] transition-colors"
            >
              <link.icon size={15} style={{ color: link.color }} />
              <span className="text-[13px] font-semibold text-[#3F3F46]">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FLOTA EN UN VISTAZO ──────────────────────────────────────────────── */}
      {flota.length > 0 && (
        <section>
          <Tooltip short="Resumen de las métricas operacionales más importantes" help={HELP.flotaVistazo}>
            <h2 className="text-[12px] font-bold text-[#71717A] uppercase tracking-[0.1em] mb-3 cursor-help">
              Flota en un vistazo
            </h2>
          </Tooltip>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label="Equipos registrados"
              valor={String(flota.length)}
              color="#09090B"
              help={HELP.totalEquipos}
              shortTip="Total de equipos en la faena"
            />
            <MetricCard
              label="Operando"
              valor={String(activos.length)}
              subtext={paros > 0 ? `${paros} en paro` : undefined}
              color={paros > 0 ? "#B91C1C" : "#15803D"}
              help={HELP.paroTotal}
              shortTip="Equipos que no están en paro total"
            />
            <MetricCard
              label="Disponibilidad"
              valor={`${dfmPromedio}%`}
              subtext="Meta: 85%"
              color={ESTADO_COLOR[estadoDfm]}
              help={HELP.dfm}
              shortTip="% del tiempo que la flota está lista para operar"
            />
            <MetricCard
              label="Alertas activas"
              valor={String(alertas.length)}
              color={alertas.length > 0 ? "#B45309" : "#15803D"}
              help={HELP.alertasActivas}
              shortTip="Indicadores fuera de umbral en el período actual"
            />
          </div>
        </section>
      )}

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
            titulo="Revisar estado general"
            desc="Mira los 3 números de arriba: paros, críticos y estables. Si hay paros o críticos, ve a Alertas para coordinar la acción con el taller."
            url="/alertas"
            urlLabel="Ir a Alertas"
            color="#B91C1C"
          />
          <Paso
            n="2"
            titulo="Consultar indicadores de flota"
            desc="El Dashboard muestra la disponibilidad, frecuencia de fallas y tiempo de reparación de toda la flota, con tendencia de 6 meses."
            url="/dashboard"
            urlLabel="Ir al Dashboard"
            color="#B45309"
          />
          <Paso
            n="3"
            titulo="Revisar equipos individuales"
            desc="En Flota puedes filtrar por tipo de equipo y ver el detalle de cada uno: sus indicadores, distribución de tiempo y estado actual."
            url="/flota"
            urlLabel="Ir a Flota"
            color="#1D4ED8"
          />
          <Paso
            n="4"
            titulo="Generar reporte mensual"
            desc="En Reporte puedes ver el informe del mes actual con todos los indicadores y exportarlo como PDF para distribuir a supervisión."
            url="/reporte"
            urlLabel="Ir a Reporte"
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
          titulo="Revisión diaria"
          subtitulo="Al inicio del turno"
          items={[
            { url: "/portada", text: "Revisar los 3 números de estado: paros, críticos, estables" },
            { url: "/alertas", text: "Si hay alertas: revisar la lista y coordinar con el taller" },
            { url: "/dashboard", text: "Consultar disponibilidad de flota y tendencia de 6 meses" },
            { url: "/flota", text: "Revisar en detalle los equipos con problemas" },
          ]}
        />
        <Rutina
          icon={CalendarCheck}
          color="#15803D"
          bg="#F0FDF4"
          titulo="Cierre mensual"
          subtitulo="Carga de datos del período"
          items={[
            { url: "/admin/periodos", text: "Crear el período correspondiente al mes" },
            { url: "/admin/registro-diario", text: "Registrar horas diarias y fallas del mes" },
            { url: "/admin/alertas", text: "Regenerar alertas automáticas según indicadores" },
            { url: "/apd", text: "Cargar el archivo CSV de análisis de aceites" },
            { url: "/reporte", text: "Generar y exportar el informe mensual" },
          ]}
        />
      </section>

      {/* ── SECCIONES INFORMATIVAS (colapsables) ──────────────────────────── */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-[14px] font-semibold text-[#71717A] hover:text-[#09090B] transition-colors py-2">
          <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
          Más información sobre el sistema
        </summary>
        <div className="flex flex-col gap-10 mt-4">

          {/* POR QUÉ ESTE SISTEMA */}
          <section>
            <h2 className="text-[20px] font-bold text-[#09090B] tracking-tight mb-1">
              ¿Por qué este sistema y no una planilla?
            </h2>
            <p className="text-[14px] text-[#71717A] mb-4">
              Un equipo detenido sin detectar cuesta horas de producción perdida.
              La diferencia está en la velocidad de reacción.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ValueCard
                icon={Eye}
                color="#1D4ED8"
                titulo="Detección en segundos"
                desc="En Excel hay que buscar entre columnas para encontrar qué cambió. Aquí, un semáforo por equipo y KPI muestra los problemas al instante."
                impacto="Tiempo de detección: segundos vs. minutos"
              />
              <ValueCard
                icon={BellRing}
                color="#B45309"
                titulo="Alertas sin intervención"
                desc="El sistema compara cada KPI contra umbrales y genera alertas automáticamente. No hay que revisar 28 filas buscando desviaciones."
                impacto="Cero revisiones manuales de planillas"
              />
              <ValueCard
                icon={TrendingUp}
                color="#15803D"
                titulo="Tendencias que revelan deterioro"
                desc="Cada período queda registrado. La tendencia de 6 meses muestra si un equipo mejora o empeora — una planilla no muestra eso sin gráficos manuales."
                impacto="Anticipar fallas antes de que ocurran"
              />
            </div>
          </section>

          {/* EXCEL vs DASHBOARD */}
          <section className="rounded-xl border border-[#E4E4E7] bg-white p-5 sm:p-6">
            <h2 className="text-[17px] font-bold text-[#09090B] tracking-tight mb-1">
              De planillas Excel a decisiones en tiempo real
            </h2>
            <p className="text-[13px] text-[#71717A] mb-4">
              El sistema no reemplaza la planilla de carga — la complementa. Los datos se cargan
              una vez al mes y el dashboard los transforma en visibilidad operacional continua.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#E4E4E7]">
                    <th className="text-left py-2.5 pr-4 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">Operación</th>
                    <th className="text-left py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">Con planilla Excel</th>
                    <th className="text-left py-2.5 pl-4 text-[11px] font-bold uppercase tracking-wider text-[#15803D]">Con este sistema</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F4F5]">
                  {[
                    { op: "Detectar equipo crítico",   excel: "Revisar 28 filas, buscar valores rojos",                  sistema: "Semáforo automático por equipo y KPI" },
                    { op: "Comparar mes a mes",        excel: "Copiar datos entre hojas, armar gráfico manual",          sistema: "Tendencia de 6 meses generada automáticamente" },
                    { op: "Saber si DFM mejoró",       excel: "Calcular promedio, comparar con el mes anterior",         sistema: "Delta con flecha: +2.1% vs período anterior" },
                    { op: "Generar informe mensual",   excel: "Copiar tablas a Word/PPT, dar formato",                   sistema: "Reporte PDF listo para imprimir" },
                    { op: "Analizar aceites (APD)",     excel: "Tabla con 120 muestras, buscar fuera de rango",           sistema: "Alertas por parámetro con color según umbral" },
                    { op: "Definir umbrales de alerta", excel: "Criterio informal, cambia según quién revise",           sistema: "Umbrales configurables, versionados, auditables" },
                  ].map((row) => (
                    <tr key={row.op}>
                      <td className="py-2.5 pr-4 font-semibold text-[#09090B]">{row.op}</td>
                      <td className="py-2.5 px-4 text-[#71717A]">{row.excel}</td>
                      <td className="py-2.5 pl-4 text-[#15803D] font-medium">{row.sistema}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* GLOSARIO */}
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
      </details>
    </div>
  );
}

/* ─── helpers visuales ──────────────────────────────────────────────────── */

function MetricCard({
  label,
  valor,
  subtext,
  color,
  help,
  shortTip,
}: {
  label: string;
  valor: string;
  subtext?: string;
  color: string;
  help?: import("@/lib/help-content").HelpItem;
  shortTip?: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white border border-[#E4E4E7]">
      <Tooltip short={shortTip ?? label} help={help}>
        <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-[0.08em] cursor-help">{label}</span>
      </Tooltip>
      <span className="text-[32px] font-mono font-bold leading-none tabular-nums" style={{ color }}>
        {valor}
      </span>
      {subtext && (
        <span className="text-[11px] font-semibold mt-0.5" style={{ color }}>{subtext}</span>
      )}
    </div>
  );
}

function ValueCard({
  icon: Icon,
  color,
  titulo,
  desc,
  impacto,
}: {
  icon: React.ElementType;
  color: string;
  titulo: string;
  desc: string;
  impacto?: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-[#E4E4E7] bg-white">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#F4F4F5] shrink-0">
        <Icon size={17} style={{ color }} />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-[#09090B] mb-1">{titulo}</p>
        <p className="text-[13px] text-[#52525B] leading-relaxed">{desc}</p>
        {impacto && (
          <p className="text-[12px] font-semibold mt-2" style={{ color }}>{impacto}</p>
        )}
      </div>
    </div>
  );
}

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
