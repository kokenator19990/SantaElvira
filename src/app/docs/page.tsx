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
} from "lucide-react";
import { clsx } from "clsx";

const DOCS = [
  {
    href: "/docs/modelo",
    title: "Modelo de Base de Datos",
    subtitle: "Entidades, relaciones y estructura de datos",
    icon: Database,
    color: "#B45309",
    bg: "#FFFBEB",
    features: [
      { icon: Table2, label: "9 entidades con campos detallados" },
      { icon: GitBranch, label: "Diagramas ER interactivos" },
      { icon: Workflow, label: "Flujo de datos del sistema" },
    ],
    description:
      "Explora las 9 tablas del sistema, sus campos, tipos de datos y relaciones. Navega por los diagramas entidad-relacion con zoom, exportacion y drill-down interactivo.",
  },
  {
    href: "/docs/arquitectura",
    title: "Arquitectura del Sistema",
    subtitle: "Capas, flujos y plan de implementacion",
    icon: Layers,
    color: "#1A5276",
    bg: "#EBF5FB",
    features: [
      { icon: Layers, label: "3 capas de arquitectura" },
      { icon: Users, label: "Roles y permisos" },
      { icon: Workflow, label: "Roadmap de implementacion" },
    ],
    description:
      "Recorre la arquitectura completa: desde el estado actual hasta el objetivo con base de datos. Visualiza flujos de carga, roles de usuario y el roadmap de migracion.",
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
          <h1 className="text-xl font-bold text-[#09090B] tracking-tight">
            Documentacion Tecnica
          </h1>
          <p className="text-sm text-[#71717A] mt-1 max-w-lg leading-relaxed">
            Modelo de datos y arquitectura del Dashboard KPI MSG El Salvador.
            Explora cada diagrama de forma interactiva, con zoom, pantalla
            completa y exportacion.
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
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ backgroundColor: doc.bg }}
                >
                  <doc.icon size={18} style={{ color: doc.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-[#09090B] leading-tight">
                    {doc.title}
                  </h2>
                  <p className="text-xs text-[#71717A] mt-0.5">
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
