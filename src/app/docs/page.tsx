import Link from "next/link";
import {
  Database,
  Layers,
  ArrowRight,
  BookOpen,
  Table2,
  GitBranch,
  Users,
  Workflow,
  Cloud,
  Server,
  KeyRound,
  FileText,
  Target,
  Brain,
} from "lucide-react";
import { clsx } from "clsx";

const DOCS = [
  {
    href: "/docs/analisis",
    title: "Análisis Estratégico",
    subtitle: "El origen del proyecto — por qué se hizo lo que se hizo",
    icon: FileText,
    color: "#7C3AED",
    bg: "#F5F3FF",
    paso: "1",
    features: [
      { icon: Brain, label: "Metodologías: Think Tank, RICE, MoSCoW, DDD" },
      { icon: Target, label: "North Star + 6 brechas + 28 procesos" },
      { icon: Workflow, label: "3 soluciones priorizadas" },
    ],
    description:
      "El análisis exhaustivo de la documentación operacional original (~100 páginas, 24 capturas, modelos de datos V1–V3.0.1). Las decisiones de producto trazadas a evidencia cuantitativa.",
  },
  {
    href: "/docs/modelo",
    title: "Modelo de Datos",
    subtitle: "Las 9 entidades, sus campos y relaciones",
    icon: Database,
    color: "#B45309",
    bg: "#FFFBEB",
    paso: "2",
    features: [
      { icon: Table2, label: "9 entidades con campos detallados" },
      { icon: GitBranch, label: "Diagramas ER interactivos" },
      { icon: Workflow, label: "Flujo de datos del sistema" },
    ],
    description:
      "El esquema lógico que se derivó del análisis. Navega por los diagramas entidad-relación con zoom, drill-down y exportación.",
  },
  {
    href: "/docs/arquitectura",
    title: "Arquitectura del Sistema",
    subtitle: "Capas, flujos y plan de implementación",
    icon: Layers,
    color: "#1A5276",
    bg: "#EBF5FB",
    paso: "3",
    features: [
      { icon: Layers, label: "3 capas: Presentación / Lógica / Datos" },
      { icon: Users, label: "Roles, permisos y bounded contexts" },
      { icon: Workflow, label: "Estado actual vs objetivo" },
    ],
    description:
      "Cómo se organiza el sistema en capas y bounded contexts (DDD). Visualiza flujos de carga, roles y el roadmap.",
  },
  {
    href: "/docs/supabase",
    title: "Supabase — BD en producción",
    subtitle: "El armado real: pooler, migraciones, env vars",
    icon: Cloud,
    color: "#15803D",
    bg: "#F0FDF4",
    paso: "4",
    features: [
      { icon: Server, label: "Pooler vs Direct connection" },
      { icon: GitBranch, label: "Migraciones con Drizzle" },
      { icon: KeyRound, label: "Env vars y seguridad" },
    ],
    description:
      "Cómo está armada físicamente la BD en producción. Manual operativo: cargar mes nuevo, agregar columnas, backups, rotar passwords.",
  },
];

export default function DocsPage() {
  return (
    <div className="max-w-[960px] mx-auto flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] shrink-0">
          <BookOpen size={18} className="text-[#B45309]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#09090B] tracking-tight">
            Documentación Técnica
          </h1>
          <p className="text-base text-[#52525B] mt-2 max-w-2xl leading-relaxed">
            La app explicada en orden pedagógico: empieza por el <strong>Análisis</strong>{" "}
            (qué documentos se estudiaron y por qué se decidió construir esto), sigue al{" "}
            <strong>Modelo</strong> (las 9 entidades), después la <strong>Arquitectura</strong>{" "}
            (cómo se conectan las capas) y termina en <strong>Supabase</strong> (el armado real
            en producción).
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {DOCS.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className={clsx(
              "group relative flex flex-col rounded-xl border border-[#E4E4E7] bg-white",
              "transition-all duration-200",
              "hover:shadow-lg hover:border-[#D4D4D8] hover:-translate-y-0.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            )}
          >
            {/* Top accent */}
            <div
              className="h-1 rounded-t-xl"
              style={{ backgroundColor: doc.color }}
            />

            <div className="p-5 flex flex-col gap-4 flex-1">
              {/* Icon + title */}
              <div className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-lg shrink-0 relative"
                  style={{ backgroundColor: doc.bg }}
                >
                  <doc.icon size={20} style={{ color: doc.color }} />
                  <span
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full text-white text-[11px] font-bold font-mono shadow-sm"
                    style={{ backgroundColor: doc.color }}
                  >
                    {doc.paso}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-[#09090B] leading-tight">
                    {doc.title}
                  </h2>
                  <p className="text-[13px] text-[#71717A] mt-0.5">
                    {doc.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[#3F3F46] leading-relaxed">
                {doc.description}
              </p>

              {/* Features */}
              <div className="flex flex-col gap-1.5">
                {doc.features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-[#52525B]"
                  >
                    <f.icon size={13} className="text-[#A1A1AA] shrink-0" />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-auto pt-3 border-t border-[#F4F4F5] flex items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: doc.color }}
                >
                  Explorar
                </span>
                <ArrowRight
                  size={14}
                  style={{ color: doc.color }}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info */}
      <div className="bg-[#F4F4F5] rounded-xl px-5 py-4 text-xs text-[#52525B] leading-relaxed">
        <strong className="text-[#09090B]">Controles de los diagramas:</strong>{" "}
        Usa la rueda del mouse para hacer zoom, arrastra para mover el
        diagrama. La barra de herramientas permite acercar, alejar, ver todo,
        pantalla completa, minimapa y exportar como imagen PNG. Haz clic en
        cualquier entidad para ver su detalle completo.
      </div>
    </div>
  );
}
