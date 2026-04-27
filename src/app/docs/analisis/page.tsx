import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Target,
  AlertTriangle,
  ListChecks,
  Workflow,
  Layers,
  Wrench,
  CheckCircle2,
  Info,
  Folder,
  Image as ImageIcon,
  Hammer,
  Brain,
  CircleAlert,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const revalidate = 3600;

export default function DocsAnalisisPage() {
  return (
    <div className="max-w-[960px] mx-auto flex flex-col gap-12 pb-12">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/docs"
          className="mt-1 inline-flex items-center justify-center w-10 h-10 rounded-[8px] border border-[#E4E4E7] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
          aria-label="Volver a documentación"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <SectionTitle>Análisis Estratégico — Origen del proyecto</SectionTitle>
          <p className="text-[16px] text-[#3F3F46] mt-3 leading-relaxed max-w-2xl">
            El dashboard MSG es el resultado de un análisis exhaustivo sobre aproximadamente
            100 páginas de documentación operacional de Santa Elvira S.A., aplicando cuatro
            metodologías profesionales (Think Tank, RICE, MoSCoW, DDD). Esta sección detalla
            <strong> el material analizado, las decisiones de implementación adoptadas y la
            justificación de cada una</strong>.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Pill text="Faena El Salvador" />
            <Pill text="Cliente: CODELCO" />
            <Pill text="Flota: 28 equipos CAT/Komatsu" />
            <Pill text="Confidencial — uso interno" />
          </div>
        </div>
      </div>

      {/* ── 1. Documentos analizados ─────────────────────────────────────── */}
      <Section
        n={1}
        icon={Folder}
        title="Documentos analizados"
        intro="El directorio original /StaElvira/ contenía tres fuentes documentales: PDFs estratégicos de alto nivel, documentación operacional histórica (Word/Excel/PDF del período 2014–2015) y capturas del sistema EBSYS legacy. A continuación, el resumen de cada una."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Carpeta
            icon={FileText}
            color="#1A5276"
            bg="#EBF5FB"
            titulo="Raíz /StaElvira/"
            descripcion="3 PDFs estratégicos generados como entregables del análisis. Son la salida pulida del trabajo de consultoría."
            archivos={[
              "Reporte_MSG_Analisis_Procesos.pdf · 17 páginas · análisis con metodologías",
              "MSG_Tecnico.pdf · 25 KB · resumen técnico para gerencia",
              "RFinal.pdf · 15 KB · informe final ejecutivo",
            ]}
          />
          <Carpeta
            icon={Hammer}
            color="#CA6F1E"
            bg="#FDF2E9"
            titulo="/StaElvira/Documentos/"
            descripcion="Documentación operacional histórica: cómo opera la mantención hoy en MSG. La fuente real del conocimiento de dominio."
            archivos={[
              "ASARCO.docx, ASARCO2/3 + ESTANDARES ASARCO 24.02.15 · clasificación de tiempos",
              "INDICADORES DE GESTION 19 03 14.docx · KPIs originales",
              "Informe NOVIEMBRE 2014 MSG.pdf · ~100 páginas · informe mensual ejemplo",
              "Producto Mínimo Viable.docx · MVP EBSYS especificación 13 págs.",
              "Modelo de Datos OT V1/V2/V3/V3.0.1.PNG · evolución del modelo ER",
              "Modelo de Perfiles.PNG · roles y permisos del sistema legacy",
              "FORMULAS PARA PLATAFORMA.xlsx · cálculos de DFM, TMEF, TMPR",
              "TurnoActividad / STATUS DIARIO 09 / Datos para modelar.xlsx",
            ]}
          />
          <Carpeta
            icon={ImageIcon}
            color="#7D3C98"
            bg="#F4ECF7"
            titulo="/StaElvira/Presentacion/"
            descripcion="24 screenshots numerados (Captura.PNG → Captura24.PNG) del sistema EBSYS legacy en uso. Mostraban cada pantalla del MVP existente."
            archivos={[
              "24 capturas del MVP web EBSYS (2014–2015)",
              "Producto Mínimo Viable.pdf",
              "Mostraron: pantallas de OT, KPIs, ASARCO, perfiles, dashboards",
              "Permitieron entender qué ya existía y qué reemplazar/extender",
            ]}
          />
        </div>
        <Note tone="info">
          <strong>Decisión de alcance:</strong> el dashboard no reemplaza al sistema EBSYS
          (gestión de OT y planificación). Lo <em>complementa</em> con la capa de visibilidad
          y reportería previamente inexistente. Cada KPI, umbral y categoría ASARCO se deriva
          directamente de los documentos del directorio original. La interfaz adopta patrones
          de diseño contemporáneos manteniendo la terminología operacional del negocio (DFM,
          TMEF, TMPR, Reserva, Operativo, Detención Programada, entre otros).
        </Note>
      </Section>

      {/* ── 2. North Star Metric ──────────────────────────────────────────── */}
      <Section
        n={2}
        icon={Target}
        title="North Star Metric — la métrica que guía todo"
        intro="Previo a cualquier definición funcional, el análisis estableció el indicador único que captura el valor entregado por MSG a CODELCO. Los demás indicadores actúan como leading indicators que alimentan esta métrica principal."
      >
        <div className="rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#1A5276] text-white p-8 text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/70 mb-3">
            North Star Metric
          </p>
          <h3 className="text-[36px] font-bold tracking-tight mb-2">% Tiempo Operativo de Flota</h3>
          <p className="text-[14px] text-white/80 max-w-xl mx-auto leading-relaxed">
            Total de horas mensuales en que la flota genera valor productivo para CODELCO.
            Estado actual: 40–65%. Objetivo: 85%. Cada punto porcentual adicional equivale a
            USD 2–3 M/año en capacidad productiva.
          </p>
        </div>
        <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
              <tr className="text-[11px] uppercase tracking-wider text-[#71717A]">
                <th className="px-3 py-2 text-left">Leading Indicator</th>
                <th className="px-3 py-2 text-right">Actual</th>
                <th className="px-3 py-2 text-right">Target</th>
                <th className="px-3 py-2 text-left">Por qué importa</th>
              </tr>
            </thead>
            <tbody>
              {LEADING_INDICATORS.map((li) => (
                <tr key={li.kpi} className="border-t border-[#F4F4F5]">
                  <td className="px-3 py-2.5 font-semibold text-[#09090B]">{li.kpi}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-[#B91C1C] font-bold">{li.actual}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-[#15803D] font-bold">{li.target}</td>
                  <td className="px-3 py-2.5 text-[#52525B]">{li.razon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 3. Las 6 brechas detectadas ───────────────────────────────────── */}
      <Section
        n={3}
        icon={CircleAlert}
        title="Seis brechas operacionales detectadas"
        intro="El análisis identificó seis problemáticas concretas con evidencia cuantitativa y, en varios casos, estimación de impacto financiero. Estas brechas constituyen el fundamento de cada decisión de producto."
      >
        <div className="flex flex-col gap-3">
          {BRECHAS.map((b) => (
            <Brecha key={b.n} {...b} />
          ))}
        </div>
        <Note tone="warn">
          <strong>Hallazgo clave (Theory of Constraints, Goldratt):</strong> el TMPR de 127 horas
          en la flota 777F no representa el tiempo de reparación efectivo del equipo de
          mantención. Refleja el tiempo que el equipo <em>permanece detenido a la espera de
          componentes</em>. La restricción se localiza en la cadena logística, no en la
          capacidad técnica del taller. Por esta razón, el dashboard mide y expone el TMPR
          mediante semáforo, para visibilizar dicha fricción operacional.
        </Note>
      </Section>

      {/* ── 4. Metodologías aplicadas ─────────────────────────────────────── */}
      <Section
        n={4}
        icon={Brain}
        title="Metodologías aplicadas"
        intro="El análisis se condujo mediante un proceso explícito y reproducible. La priorización de iniciativas se sustenta en evidencia cuantitativa, no en juicios subjetivos."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Metodologia
            color="#1A5276"
            titulo="Virtual Think Tank"
            desc="Debate estructurado entre cinco expertos para mitigar el sesgo de perspectiva única."
            puntos={[
              "Peter Drucker — moderador (Management por Objetivos)",
              "Eliyahu Goldratt — Theory of Constraints",
              "W. Edwards Deming — Calidad Total y Datos",
              "Martin Fowler — Arquitectura Pragmática",
              "Taiichi Ohno (wildcard) — Toyota Production System",
            ]}
          />
          <Metodologia
            color="#15803D"
            titulo="Opportunity Solution Tree"
            desc="Mapeo desde el outcome (North Star) hacia oportunidades raíz y soluciones candidatas."
            puntos={[
              "Outcome: % Tiempo Operativo > 85%",
              "4 oportunidades raíz (críticas, altas, media)",
              "11 soluciones candidatas con evidencia de impacto",
              "Solo se priorizan soluciones que mueven el North Star",
            ]}
          />
          <Metodologia
            color="#92400E"
            titulo="RICE Framework"
            desc="Priorización cuantitativa mediante la fórmula: (Reach × Impact × Confidence) ÷ Effort."
            puntos={[
              "Ocho iniciativas evaluadas",
              "Quick Wins: alertas KPI (RICE 40), APD automático (24)",
              "Big Bets: kanban repuestos (24), inventario+OC (12)",
              "Strategic Bets: motor PM (8), predicción Weibull (5)",
            ]}
          />
          <Metodologia
            color="#7D3C98"
            titulo="MoSCoW Global"
            desc="Clasificación de los 28 procesos identificados: Must / Should / Could / Won't en la fase actual."
            puntos={[
              "16 MUST — funcionalidad crítica del sistema",
              "10 SHOULD — relevantes para la primera release mayor",
              "2 COULD — diferibles según capacidad disponible",
              "0 WON'T — todas las iniciativas aportan valor",
            ]}
          />
          <Metodologia
            color="#0369A1"
            titulo="Clean Architecture + DDD"
            desc="Cinco Bounded Contexts independientes, comunicados a través de eventos de dominio."
            puntos={[
              "Maintenance Context (existente en EBSYS)",
              "Analytics Context — implementado en este dashboard",
              "Procurement Context (Solución 2 — pendiente)",
              "Inventory Context (Solución 2 — pendiente)",
              "Planning + Predictive Contexts (Solución 3 — pendiente)",
            ]}
          />
          <Metodologia
            color="#B45309"
            titulo="Value vs. Effort Matrix"
            desc="Clasificación visual para definir el orden de implementación."
            puntos={[
              "Quick Wins: alto valor, bajo esfuerzo — implementación prioritaria",
              "Big Bets: alto valor, alto esfuerzo — requieren planificación",
              "Fill-ins: bajo valor, bajo esfuerzo — opcionales",
              "Time Sinks: bajo valor, alto esfuerzo — evitar",
            ]}
          />
        </div>
      </Section>

      {/* ── 5. 28 procesos con MoSCoW ──────────────────────────────────────── */}
      <Section
        n={5}
        icon={ListChecks}
        title="28 procesos identificados"
        intro="Cada proceso operacional fue clasificado mediante MoSCoW. Esta clasificación determina el orden de implementación y qué módulos pueden diferirse."
      >
        <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
              <tr className="text-[11px] uppercase tracking-wider text-[#71717A]">
                <th className="px-3 py-2 text-left">Área</th>
                <th className="px-3 py-2 text-right">MUST</th>
                <th className="px-3 py-2 text-right">SHOULD</th>
                <th className="px-3 py-2 text-right">COULD</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-center">Construido aquí</th>
              </tr>
            </thead>
            <tbody>
              {AREAS_PROCESO.map((a) => (
                <tr key={a.area} className="border-t border-[#F4F4F5]">
                  <td className="px-3 py-2 font-semibold text-[#09090B]">{a.area}</td>
                  <td className="px-3 py-2 text-right font-mono text-[#B91C1C]">{a.must}</td>
                  <td className="px-3 py-2 text-right font-mono text-[#B45309]">{a.should}</td>
                  <td className="px-3 py-2 text-right font-mono text-[#71717A]">{a.could}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-[#09090B]">{a.must + a.should + a.could}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: a.statusBg, color: a.statusColor }}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#E4E4E7] bg-[#FAFAFA] font-bold">
                <td className="px-3 py-2 text-[#09090B]">Total</td>
                <td className="px-3 py-2 text-right font-mono">16</td>
                <td className="px-3 py-2 text-right font-mono">10</td>
                <td className="px-3 py-2 text-right font-mono">2</td>
                <td className="px-3 py-2 text-right font-mono">28</td>
                <td className="px-3 py-2 text-center text-[11px] text-[#71717A]">~30%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Note tone="info">
          De los 28 procesos identificados, el dashboard implementa principalmente
          <strong> KPIs (8 de 8) y Reporting (cobertura parcial)</strong>. Los procesos de
          Mantenimiento (OT, PM, Backlog) residen en EBSYS y no fueron migrados — el dashboard
          los consume como datos. Los módulos de Abastecimiento, RRHH y Predictivo se
          encuentran clasificados como Big Bet (Solución 2) y Strategic Bet (Solución 3).
        </Note>
      </Section>

      {/* ── 6. 3 Soluciones priorizadas ───────────────────────────────────── */}
      <Section
        n={6}
        icon={Workflow}
        title="Tres soluciones priorizadas"
        intro="Tras la aplicación del análisis RICE y la matriz Value vs. Effort, el plan se consolida en tres soluciones con orden de ejecución definido."
      >
        <div className="flex flex-col gap-4">
          {SOLUCIONES.map((s) => (
            <Solucion key={s.n} {...s} />
          ))}
        </div>
      </Section>

      {/* ── 7. Bounded Contexts ─────────────────────────────────────────── */}
      <Section
        n={7}
        icon={Layers}
        title="Cinco Bounded Contexts (DDD)"
        intro="El sistema completo, según el análisis, se compone de cinco contextos delimitados que se comunican mediante eventos. A continuación, el estado actual de cada uno."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BOUNDED_CONTEXTS.map((bc) => (
            <BoundedContext key={bc.nombre} {...bc} />
          ))}
        </div>
        <Note tone="ok">
          La arquitectura DDD permite implementar los contextos <strong>Procurement</strong> e
          <strong> Inventory</strong> sin afectar el código actual. Cada contexto es un módulo
          independiente comunicado por eventos. El dashboard ya emite los eventos
          correspondientes (alertas KPI); resta únicamente desarrollar los consumidores.
        </Note>
      </Section>

      {/* ── 8. Mapeo: análisis → producto ─────────────────────────────────── */}
      <Section
        n={8}
        icon={CheckCircle2}
        title="Trazabilidad: del análisis al producto"
        intro="Cada funcionalidad del dashboard se vincula directamente con un hallazgo del análisis. La siguiente tabla presenta la trazabilidad completa."
      >
        <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
              <tr className="text-[11px] uppercase tracking-wider text-[#71717A]">
                <th className="px-3 py-2 text-left">Hallazgo del análisis</th>
                <th className="px-3 py-2 text-left">Feature implementada</th>
                <th className="px-3 py-2 text-left">Ruta</th>
              </tr>
            </thead>
            <tbody>
              {MAPEO_FEATURES.map((m, i) => (
                <tr key={i} className="border-t border-[#F4F4F5]">
                  <td className="px-3 py-2 text-[#52525B]">{m.hallazgo}</td>
                  <td className="px-3 py-2 font-semibold text-[#09090B]">{m.feature}</td>
                  <td className="px-3 py-2">
                    <Link href={m.ruta} className="text-[#B45309] hover:underline font-mono text-[11px]">
                      {m.ruta}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 9. ¿Qué queda pendiente? ──────────────────────────────────────── */}
      <Section
        n={9}
        icon={Wrench}
        title="Funcionalidades pendientes"
        intro="El dashboard implementa la Solución 1 (Quick Win) en su totalidad. Las Soluciones 2 y 3 corresponden a las próximas fases del plan."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Pendiente
            color="#B91C1C"
            bg="#FEF2F2"
            border="#FECACA"
            badge="BIG BET"
            titulo="Solución 2 — Procurement + Inventory"
            descripcion="La restricción operacional principal (Goldratt). Actualmente, los equipos CE-04 y CE-19 acumulan más de seis meses detenidos a la espera de componentes. La solución requiere la digitalización del ciclo de OC y la implementación de un inventario crítico con kanban pull."
            features={[
              "Catálogo de componentes críticos con stock min/max calculado por TMEF",
              "Ciclo digital OC: Solicitud → Aprobación → Compra → Recepción",
              "Kanban pull automático cuando stock < mínimo",
              "Tracking de importaciones USA en tiempo real",
              "2 contextos nuevos: Procurement + Inventory",
            ]}
            esfuerzo="6 P-M"
            inversion="USD 80–150K"
            retorno="USD 15–30M/año"
          />
          <Pendiente
            color="#7C3AED"
            bg="#F5F3FF"
            border="#DDD6FE"
            badge="STRATEGIC BET"
            titulo="Solución 3 — Plataforma Predictiva"
            descripcion="Mantenimiento con capacidad de anticipación a la falla. Comprende motor de PM inteligente, modelos Weibull por sistema e integración APD predictiva."
            features={[
              "Proyección automática de horómetros → próximo PM",
              "Verificación pre-PM: ¿están repuestos y mecánicos?",
              "Optimizador de Reserva: equipo parado + OT + recursos = ASIGNAR",
              "Predicción Weibull de falla por sistema",
              "Integración APD → alertas predictivas",
              "2 contextos nuevos: Planning + Predictive",
            ]}
            esfuerzo="12 P-M"
            inversion="USD 200–400K"
            retorno="USD 40–80M/año"
          />
        </div>
        <div className="rounded-[10px] bg-[#0A2540] text-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 mb-2">
            Impacto consolidado de las 3 soluciones (12 meses)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Esfuerzo total" valor="20 P-M" />
            <Stat label="Inversión" valor="USD 310–610K" />
            <Stat label="Retorno/año" valor="USD 55–111M" />
            <Stat label="ROI" valor="~18:1" highlight />
          </div>
        </div>
      </Section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-[#F4F4F5] p-5 text-[13px] text-[#52525B] leading-relaxed">
        <strong className="text-[#09090B]">Continuar con:</strong>
        <div className="flex flex-wrap gap-3 mt-2">
          <Link href="/docs/modelo" className="underline text-[#B45309] hover:text-[#92400E]">
            Modelo de Datos (las 9 entidades)
          </Link>
          <Link href="/docs/arquitectura" className="underline text-[#B45309] hover:text-[#92400E]">
            Arquitectura (capas y flujos)
          </Link>
          <Link href="/docs/supabase" className="underline text-[#B45309] hover:text-[#92400E]">
            Supabase (Base de datos en producción)
          </Link>
        </div>
        <p className="text-[13px] text-[#71717A] mt-3">
          Recorrido pedagógico: Análisis → Modelo → Arquitectura → Supabase. La consulta
          secuencial de estas secciones permite comprender la totalidad de las decisiones de
          implementación del sistema.
        </p>
      </div>
    </div>
  );
}

/* ─── Helpers visuales ──────────────────────────────────────────────────── */

function Section({
  n,
  icon: Icon,
  title,
  intro,
  children,
}: {
  n: number;
  icon: React.ElementType;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[14px] font-bold font-mono">
          {n}
        </span>
        <Icon size={20} className="text-[#52525B]" />
        <h2 className="text-[18px] font-bold text-[#09090B] tracking-tight">{title}</h2>
      </div>
      <p className="text-[14px] text-[#3F3F46] leading-relaxed -mt-1">{intro}</p>
      {children}
    </section>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[12px] text-[#52525B]">
      {text}
    </span>
  );
}

function Note({ tone, children }: { tone: "info" | "warn" | "ok"; children: React.ReactNode }) {
  const cfg = {
    info: { bg: "#EBF5FB", border: "#A9CCE3", color: "#1A5276", Icon: Info },
    warn: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E", Icon: AlertTriangle },
    ok:   { bg: "#F0FDF4", border: "#BBF7D0", color: "#15803D", Icon: CheckCircle2 },
  }[tone];
  const Icon = cfg.Icon;
  return (
    <div
      className="flex items-start gap-2.5 p-4 rounded-[10px] border text-[13px] leading-relaxed"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      <Icon size={15} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function Carpeta({
  icon: Icon,
  color,
  bg,
  titulo,
  descripcion,
  archivos,
}: {
  icon: React.ElementType;
  color: string;
  bg: string;
  titulo: string;
  descripcion: string;
  archivos: string[];
}) {
  return (
    <div className="rounded-[10px] border border-[#E4E4E7] bg-white p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
        <p className="text-[13px] font-bold" style={{ color }}>{titulo}</p>
      </div>
      <p className="text-[12px] text-[#52525B] leading-relaxed">{descripcion}</p>
      <ul className="text-[11px] text-[#71717A] list-disc pl-4 space-y-1 leading-relaxed">
        {archivos.map((a, i) => <li key={i}>{a}</li>)}
      </ul>
    </div>
  );
}

function Brecha({
  n,
  severidad,
  titulo,
  evidencia,
  impacto,
}: {
  n: string;
  severidad: "critica" | "alta" | "media";
  titulo: string;
  evidencia: string;
  impacto: string;
}) {
  const cfg = {
    critica: { color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA", label: "CRÍTICA" },
    alta:    { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", label: "ALTA" },
    media:   { color: "#1A5276", bg: "#EBF5FB", border: "#A9CCE3", label: "MEDIA" },
  }[severidad];
  return (
    <div className="rounded-[10px] border bg-white p-4" style={{ borderColor: cfg.border }}>
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full text-white text-[12px] font-bold shrink-0"
          style={{ backgroundColor: cfg.color }}
        >
          {n}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-[14px] font-bold text-[#09090B]">{titulo}</p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-[12px] text-[#52525B] leading-relaxed mb-2">
            <strong className="text-[#3F3F46]">Evidencia: </strong>{evidencia}
          </p>
          <p className="text-[12px] text-[#52525B] leading-relaxed">
            <strong className="text-[#3F3F46]">Impacto: </strong>{impacto}
          </p>
        </div>
      </div>
    </div>
  );
}

function Metodologia({
  color,
  titulo,
  desc,
  puntos,
}: {
  color: string;
  titulo: string;
  desc: string;
  puntos: string[];
}) {
  return (
    <div className="rounded-[10px] border border-[#E4E4E7] bg-white p-4 flex flex-col gap-2">
      <p className="text-[14px] font-bold" style={{ color }}>{titulo}</p>
      <p className="text-[12px] text-[#52525B] leading-relaxed">{desc}</p>
      <ul className="text-[11px] text-[#71717A] list-disc pl-4 space-y-1 leading-relaxed mt-1">
        {puntos.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
    </div>
  );
}

function Solucion({
  n,
  badge,
  badgeColor,
  badgeBg,
  titulo,
  rice,
  esfuerzo,
  inversion,
  retorno,
  descripcion,
  estado,
  ruta,
}: {
  n: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  titulo: string;
  rice: string;
  esfuerzo: string;
  inversion: string;
  retorno: string;
  descripcion: string;
  estado: "construido" | "pendiente";
  ruta?: string;
}) {
  const constr = estado === "construido";
  return (
    <div
      className="rounded-xl border-2 p-5"
      style={{
        borderColor: constr ? "#15803D" : "#E4E4E7",
        backgroundColor: constr ? "#F0FDF4" : "white",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full text-white text-[13px] font-bold shrink-0"
          style={{ backgroundColor: constr ? "#15803D" : "#71717A" }}
        >
          {n}
        </span>
        <p className="text-[15px] font-bold text-[#09090B]">{titulo}</p>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
          style={{ backgroundColor: badgeBg, color: badgeColor }}
        >
          {badge}
        </span>
        {constr && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#15803D] text-white inline-flex items-center gap-1">
            <CheckCircle2 size={11} /> CONSTRUIDO
          </span>
        )}
      </div>
      <p className="text-[13px] text-[#3F3F46] leading-relaxed mb-3">{descripcion}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
        <Stat label="RICE" valor={rice} small />
        <Stat label="Esfuerzo" valor={esfuerzo} small />
        <Stat label="Inversión" valor={inversion} small />
        <Stat label="Retorno/año" valor={retorno} small />
      </div>
      {constr && ruta && (
        <Link
          href={ruta}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#15803D] hover:underline"
        >
          Ver implementación →
        </Link>
      )}
    </div>
  );
}

function BoundedContext({
  nombre,
  responsabilidad,
  estado,
  publica,
  consume,
}: {
  nombre: string;
  responsabilidad: string;
  estado: "existente" | "construido" | "pendiente";
  publica: string;
  consume: string;
}) {
  const cfg = {
    existente:  { color: "#1A5276", bg: "#EBF5FB", label: "EXTERNO (EBSYS)" },
    construido: { color: "#15803D", bg: "#F0FDF4", label: "CONSTRUIDO" },
    pendiente:  { color: "#71717A", bg: "#F4F4F5", label: "PENDIENTE" },
  }[estado];
  return (
    <div className="rounded-[10px] border border-[#E4E4E7] bg-white p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-bold font-mono" style={{ color: cfg.color }}>{nombre}</p>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </span>
      </div>
      <p className="text-[12px] text-[#52525B] leading-relaxed">{responsabilidad}</p>
      <div className="text-[11px] text-[#71717A] space-y-0.5 mt-1 pt-2 border-t border-[#F4F4F5]">
        <p><strong className="text-[#52525B]">Publica:</strong> {publica}</p>
        <p><strong className="text-[#52525B]">Consume:</strong> {consume}</p>
      </div>
    </div>
  );
}

function Pendiente({
  color,
  bg,
  border,
  badge,
  titulo,
  descripcion,
  features,
  esfuerzo,
  inversion,
  retorno,
}: {
  color: string;
  bg: string;
  border: string;
  badge: string;
  titulo: string;
  descripcion: string;
  features: string[];
  esfuerzo: string;
  inversion: string;
  retorno: string;
}) {
  return (
    <div className="rounded-xl border-2 p-4 flex flex-col gap-3" style={{ backgroundColor: bg, borderColor: border }}>
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
          style={{ backgroundColor: "white", color }}
        >
          {badge}
        </span>
      </div>
      <p className="text-[14px] font-bold" style={{ color }}>{titulo}</p>
      <p className="text-[12px] text-[#3F3F46] leading-relaxed">{descripcion}</p>
      <ul className="text-[11px] text-[#52525B] list-disc pl-4 space-y-0.5 leading-relaxed">
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: border }}>
        <Stat label="Esfuerzo" valor={esfuerzo} small />
        <Stat label="Inversión" valor={inversion} small />
        <Stat label="Retorno" valor={retorno} small />
      </div>
    </div>
  );
}

function Stat({
  label,
  valor,
  small,
  highlight,
}: {
  label: string;
  valor: string;
  small?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className={`text-[10px] uppercase tracking-wider ${highlight ? "text-white/70" : "text-[#A1A1AA]"} font-semibold`}>
        {label}
      </span>
      <span
        className={`font-mono font-bold ${small ? "text-[13px]" : "text-[20px]"}`}
        style={{ color: highlight ? "#FBBF24" : undefined }}
      >
        {valor}
      </span>
    </div>
  );
}

/* ─── Datos ─────────────────────────────────────────────────────────────── */

const LEADING_INDICATORS = [
  { kpi: "% Tiempo Operativo (NSM)",     actual: "40–65%",  target: "85%",   razon: "ES el North Star — KPI principal del negocio" },
  { kpi: "Disponibilidad Mecánica (DFM)", actual: "66–87%", target: "85%",   razon: "Prerrequisito técnico del Operativo" },
  { kpi: "TMPR promedio flota",          actual: "8–163h",  target: "3–5h",  razon: "Cada hora ≈ USD 300–800 de Operativo perdido" },
  { kpi: "Tiempo en Reserva",            actual: "20–39%",  target: "3.9%",  razon: "Reserva excesiva sustrae directamente del Operativo" },
  { kpi: "Lead time OC repuestos",       actual: ">30 días", target: "<7 días", razon: "Determina cuántos días el equipo está en 'Espera de Rptos'" },
];

const BRECHAS = [
  {
    n: "1",
    severidad: "critica" as const,
    titulo: "Utilización Operativa: 40–65% vs target 85%",
    evidencia: "Reserva 20–39% (vs 3.9% target), Detención No Programada con picos críticos, Pérdida Operacional hasta 4× target.",
    impacto: "USD 24–105 M/año en capacidad productiva perdida. Es la consecuencia agregada de todas las demás brechas.",
  },
  {
    n: "2",
    severidad: "critica" as const,
    titulo: "Cadena de abastecimiento rota — la restricción real (Goldratt)",
    evidencia: "CE-04 y CE-19 con 0% disponibilidad por 6+ meses, 100% por espera de componentes. Sin stock mínimo definido. Compras 100% reactivas. Importaciones USA sin trazabilidad.",
    impacto: "2 camiones 777F parados ≈ USD 15–20 M/año. Sin alertas automáticas de OC vencidas. Proceso 100% en Excel + email.",
  },
  {
    n: "3",
    severidad: "alta" as const,
    titulo: "Confiabilidad crítica en flotas 777F y 992 — TMPR 25–33× target",
    evidencia: "777F: DFM 73%, TMPR 127h. 992: DFM 66%, TMPR 163h. PC-2000 muestra excelente mantenibilidad (TMPR 8h) — modelo a replicar.",
    impacto: "El TMPR alto NO es lentitud técnica — es espera de repuestos. Diagnóstico TOC: la restricción está en logística, no en taller.",
  },
  {
    n: "4",
    severidad: "media" as const,
    titulo: "APD deteriorado — 32% de muestras fuera de estado normal",
    evidencia: "Normal 68% (target 80%), Seguimiento 26% (target 15%), Acción Requerida 6% (target 5%).",
    impacto: "Indicador adelantado de oleada de fallas. Si no se actúa, las muestras en Seguimiento se vuelven Acción Requerida.",
  },
  {
    n: "5",
    severidad: "alta" as const,
    titulo: "Reportería manual — 40–80 HH/mes de desperdicio puro",
    evidencia: "Informe mensual ~100 páginas hecho a mano. Decisiones tomadas con datos de 3 semanas. Sin alertas automáticas: equipos pueden ir a 0% disponibilidad sin que nadie sea notificado.",
    impacto: "Equivalente a 0.5 FTE/mes en reportería en lugar de planificación. Decisiones tardías por información tardía.",
  },
  {
    n: "6",
    severidad: "alta" as const,
    titulo: "MVP web EBSYS incompleto y sin integración",
    evidencia: "OT funcional pero aislada. KPIs ingresados manualmente. Sin PM, sin alertas, sin inventario, sin APD integrado, sin predicción. UX obsoleto (~2014, sin responsive).",
    impacto: "El MVP existe pero los datos no fluyen. Cada módulo es una isla. Ese es el problema que el dashboard nuevo viene a resolver en su parte de visibilidad.",
  },
];

const AREAS_PROCESO = [
  { area: "Mantenimiento (OT, PM, Backlog)", must: 5, should: 1, could: 0, status: "EN EBSYS",   statusColor: "#1A5276", statusBg: "#EBF5FB" },
  { area: "KPIs y ASARCO",                   must: 5, should: 2, could: 0, status: "✓ AQUÍ",     statusColor: "#15803D", statusBg: "#F0FDF4" },
  { area: "RRHH (HH, Turnos, Estatus)",      must: 1, should: 2, could: 1, status: "PARCIAL",    statusColor: "#B45309", statusBg: "#FFFBEB" },
  { area: "Abastecimiento",                  must: 4, should: 2, could: 1, status: "BIG BET",    statusColor: "#B91C1C", statusBg: "#FEF2F2" },
  { area: "Reporting y Roles",               must: 1, should: 1, could: 0, status: "PARCIAL",    statusColor: "#B45309", statusBg: "#FFFBEB" },
  { area: "Predictivo (ML, demanda)",        must: 0, should: 2, could: 0, status: "STRATEGIC",  statusColor: "#7C3AED", statusBg: "#F5F3FF" },
];

const SOLUCIONES = [
  {
    n: "1",
    badge: "QUICK WIN",
    badgeColor: "#15803D",
    badgeBg: "#F0FDF4",
    titulo: "Dashboard KPI + Reportería + Alertas + APD",
    rice: "10–40",
    esfuerzo: "2 P-M",
    inversion: "USD 30–60K",
    retorno: "USD 0.5–1M + intangibles",
    descripcion: "Visibilidad de datos en tiempo real. Comprende semáforo de flota, cálculo automático de DFM/TMEF/TMPR, alertas por umbral, informe mensual auto-generado e integración APD. Constituye el fundamento operacional del sistema; sin esta capa de visibilidad, las soluciones subsiguientes no son validables.",
    estado: "construido" as const,
    ruta: "/dashboard",
  },
  {
    n: "2",
    badge: "BIG BET",
    badgeColor: "#B91C1C",
    badgeBg: "#FEF2F2",
    titulo: "Procurement + Inventory — la restricción operacional",
    rice: "12.2",
    esfuerzo: "6 P-M",
    inversion: "USD 80–150K",
    retorno: "USD 15–30M/año",
    descripcion: "Intervención sobre la cadena de abastecimiento. Comprende inventario crítico con stock mínimo calculado por TMEF, ciclo digital de OC con escalamiento automático y kanban pull (TPS) que dispara solicitudes anticipadas de repuestos. Recupera la disponibilidad de CE-04 y CE-19.",
    estado: "pendiente" as const,
  },
  {
    n: "3",
    badge: "STRATEGIC BET",
    badgeColor: "#7C3AED",
    badgeBg: "#F5F3FF",
    titulo: "Plataforma Predictiva — Planning + Predictive",
    rice: "8–17",
    esfuerzo: "12 P-M",
    inversion: "USD 200–400K",
    retorno: "USD 40–80M/año",
    descripcion: "Mantenimiento con capacidad de anticipación a la falla. Comprende motor de PM con proyección de horómetros, optimizador de Reserva, predicción Weibull de falla por sistema e integración APD predictiva. Reduce la DNP entre 40 y 60% y baja la Reserva por debajo del 8%.",
    estado: "pendiente" as const,
  },
];

const BOUNDED_CONTEXTS = [
  {
    nombre: "Maintenance Context",
    responsabilidad: "OT, equipos, sistemas, fallas, HH, turnos. Es el sistema EBSYS legacy que sigue gestionando el día a día de mantención.",
    estado: "existente" as const,
    publica: "OT_Abierta, OT_Cerrada, OT_RequiereRepuesto",
    consume: "Inventory.StockConfirmado",
  },
  {
    nombre: "Analytics Context",
    responsabilidad: "KPIs (DFM/TMEF/TMPR), ASARCO, alertas por umbral, informes mensuales. Es el dashboard que estás usando ahora mismo.",
    estado: "construido" as const,
    publica: "UmbralKPI_Superado, InformeGenerado",
    consume: "Maintenance.OT, Procurement.OC_Status (futuro)",
  },
  {
    nombre: "Procurement Context",
    responsabilidad: "Órdenes de Compra, proveedores, importaciones USA, aprobaciones. La parte que falta: digitalizar el ciclo de OC.",
    estado: "pendiente" as const,
    publica: "OC_Aprobada, OC_Recibida, OC_Vencida",
    consume: "Maintenance.SolicitudRepuesto, Inventory.KanbanAlert",
  },
  {
    nombre: "Inventory Context",
    responsabilidad: "Stock, componentes rotables, bodega, trazabilidad por N/Serie. Stock mínimo calculado automáticamente desde TMEF histórico.",
    estado: "pendiente" as const,
    publica: "KanbanAlert, StockRecibido, ComponenteInstalado",
    consume: "Procurement.OC_Recibida, Planning.VerificacionPM",
  },
  {
    nombre: "Planning Context",
    responsabilidad: "Programación de PM, proyección de horómetros, backlog, optimizador de Reserva. El cerebro logístico del taller.",
    estado: "pendiente" as const,
    publica: "PM_Programado, ReservaOptimizada, BacklogAsignado",
    consume: "Maintenance.OT, Inventory.StockPreVerificado, Predictive.AlertaFalla",
  },
  {
    nombre: "Predictive Context",
    responsabilidad: "Modelos Weibull por sistema, integración APD, predicción de falla. Anticipación basada en datos.",
    estado: "pendiente" as const,
    publica: "AlertaPredictiva, RiesgoSistema_Alto",
    consume: "Maintenance.HistorialFallas, Analytics.APD",
  },
];

const MAPEO_FEATURES = [
  { hallazgo: "Brecha 5: Reportería manual 40–80 HH/mes",                feature: "Dashboard tiempo real con semáforo flota",     ruta: "/dashboard" },
  { hallazgo: "Brecha 5: decisiones con datos de 3 semanas",             feature: "Tendencia 6 meses por tipo de flota",          ruta: "/dashboard" },
  { hallazgo: "Brecha 6: KPIs ingresados a mano en EBSYS",               feature: "Form mensual de KPIs por equipo",              ruta: "/admin/kpis" },
  { hallazgo: "Solución 1 MUST: alertas automáticas por umbral",         feature: "Lista priorizada Paro/Crítico/Advertencia",     ruta: "/alertas" },
  { hallazgo: "Solución 1 MUST: ASARCO drill-down por equipo",           feature: "Distribución ASARCO por tipo y equipo",        ruta: "/dashboard" },
  { hallazgo: "Brecha 4: APD deteriorado 32% fuera de normal",           feature: "Upload CSV APD + persistencia + histórico",     ruta: "/apd" },
  { hallazgo: "Solución 1 MUST: informe mensual auto",                   feature: "Reporte imprimible / PDF",                      ruta: "/reporte" },
  { hallazgo: "28 procesos MoSCoW: gestión de equipos",                  feature: "CRUD de flota: alta, edición, baja",           ruta: "/admin/equipos" },
  { hallazgo: "Solución 1 MUST: catálogo de períodos",                   feature: "Crear / cerrar / reabrir períodos mensuales",   ruta: "/admin/periodos" },
  { hallazgo: "Anti-patrón Fowler: 'no construir motor en React'",       feature: "Server actions tipadas con Drizzle + validación", ruta: "/admin" },
  { hallazgo: "Modelo de datos OT V3.0.1: 9 entidades del MVP EBSYS",    feature: "9 tablas Postgres en Supabase (replicadas)",   ruta: "/docs/modelo" },
  { hallazgo: "Think Tank Drucker: 'el resultado que importa al cliente'", feature: "North Star Metric: Tiempo Operativo arriba",  ruta: "/dashboard" },
];
