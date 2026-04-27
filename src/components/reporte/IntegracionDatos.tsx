"use client";

import { useState } from "react";
import {
  Smartphone, Globe, Sheet, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Zap, Shield, Clock, Users,
  Database, Wifi, Lock, Star,
} from "lucide-react";
import { clsx } from "clsx";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Opcion {
  id: string;
  icono: React.ElementType;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  color: string;
  bgColor: string;
  etiqueta?: string;
  etiquetaColor?: string;
  complejidad: 1 | 2 | 3;   // 1=baja, 2=media, 3=alta
  tiempo: string;
  ventajas: string[];
  desventajas: string[];
  pasos: string[];
  tecnico: string[];
}

const OPCIONES: Opcion[] = [
  {
    id: "app",
    icono: Smartphone,
    titulo: "App de carga por turno",
    subtitulo: "El operario ingresa los datos al inicio/fin de cada turno",
    descripcion:
      "Se desarrolla una pequeña aplicación web progressive (PWA) o nativa que el supervisor abre desde su teléfono o tablet. Al finalizar el turno, completa un formulario simple con los valores reales de DFM, TMEF, TMPR y ASARCO de cada equipo. Los datos se envían a una base de datos y el dashboard se actualiza automáticamente.",
    color: "#15803D",
    bgColor: "#F0FDF4",
    etiqueta: "Recomendado",
    etiquetaColor: "#15803D",
    complejidad: 2,
    tiempo: "4-8 semanas",
    ventajas: [
      "Datos frescos turno a turno — sin esperar reportes manuales",
      "Los operarios y supervisores participan directamente",
      "Funciona offline y sincroniza al recuperar señal (PWA)",
      "Control granular: quién cargó qué, cuándo y desde qué equipo",
      "Validaciones en el formulario evitan errores antes de guardar",
    ],
    desventajas: [
      "Requiere desarrollo inicial (4-8 semanas de trabajo técnico)",
      "Los supervisores necesitan una breve capacitación de uso",
      "Necesitas un backend mínimo (base de datos + API REST)",
    ],
    pasos: [
      "Definir los campos exactos del formulario de turno con operaciones",
      "Desarrollar la PWA o app web responsive (Next.js + formulario)",
      "Conectar a una base de datos en la nube (Supabase, PlanetScale o Firebase)",
      "Crear un endpoint de API que recibe y guarda los datos",
      "Actualizar el dashboard para leer datos en tiempo real desde la base",
      "Piloto con 1-2 turnos, ajustar y lanzar a toda la faena",
    ],
    tecnico: [
      "Frontend: Next.js + React Hook Form + Zod (validación)",
      "Backend: API Route de Next.js o Node.js/Hono",
      "Base de datos: Supabase (PostgreSQL) — gratuito hasta 500 MB",
      "Auth: Supabase Auth o Clerk (inicio de sesión por turno)",
      "Hosting: Vercel (frontend) + Supabase (backend/DB) — sin costo inicial",
    ],
  },
  {
    id: "web",
    icono: Globe,
    titulo: "Panel de ingreso web con login",
    subtitulo: "Acceso directo al sistema con usuario y contraseña",
    descripcion:
      "Se agrega un módulo de administración al propio dashboard. Los usuarios autorizados (jefe de mantenimiento, supervisor) inician sesión con sus credenciales y editan los KPIs directamente desde la interfaz, sin necesidad de ninguna app adicional. El sistema registra quién hizo cada cambio y cuándo.",
    color: "#B45309",
    bgColor: "#FFFBEB",
    complejidad: 2,
    tiempo: "3-6 semanas",
    ventajas: [
      "Sin apps adicionales — todo en el mismo dashboard que ya conocen",
      "Auditoría completa: historial de cambios con usuario y timestamp",
      "Permisos granulares por rol (ver / editar / administrar)",
      "La experiencia es consistente con el dashboard existente",
    ],
    desventajas: [
      "Requiere sistema de autenticación (login, contraseñas, sesiones)",
      "Si la persona con acceso no carga los datos, el dashboard queda desactualizado",
      "Depende de conectividad en faena para acceder al panel",
    ],
    pasos: [
      "Elegir e integrar proveedor de autenticación (Clerk o NextAuth)",
      "Crear rutas protegidas /admin con middleware de verificación de rol",
      "Construir formulario de edición de KPIs por período y flota",
      "Conectar a base de datos para persistir cambios",
      "Agregar registro de auditoría (quién / cuándo / qué cambió)",
      "Definir usuarios iniciales y roles con el equipo de operaciones",
    ],
    tecnico: [
      "Auth: Clerk (recomendado) o NextAuth.js con adaptador de base de datos",
      "Base de datos: Supabase (PostgreSQL) con Row Level Security",
      "Rutas protegidas: Next.js Middleware + verificación de session",
      "Formularios: React Hook Form + validación Zod",
      "Auditoría: tabla de logs en PostgreSQL con triggers",
    ],
  },
  {
    id: "sheets",
    icono: Sheet,
    titulo: "Google Sheets compartido",
    subtitulo: "Los datos se ingresan en una planilla que sincroniza con el dashboard",
    descripcion:
      "Se crea una planilla de Google Sheets con el formato correcto (una hoja por tipo de KPI, una fila por período y flota). Los operarios cargan los datos como lo hacen hoy, pero en lugar de enviar un Excel por correo, el dashboard lee directamente la planilla mediante la Google Sheets API y muestra los valores actualizados sin intervención técnica.",
    color: "#1D4ED8",
    bgColor: "#EFF6FF",
    complejidad: 1,
    tiempo: "1-2 semanas",
    ventajas: [
      "Curva de aprendizaje cero — el equipo ya sabe usar Excel/Sheets",
      "Sin desarrollo de app — integración directa con herramienta existente",
      "Cualquier cambio en la planilla se refleja en el dashboard en minutos",
      "Backup automático de Google, versionado de cambios incluido",
      "Implementación más rápida de todas las opciones",
    ],
    desventajas: [
      "Requiere conexión a internet para editar y sincronizar",
      "Sin validaciones: errores tipográficos pueden corromper datos del dashboard",
      "Menor control de permisos — cualquiera con el link puede editar",
      "Escala mal si el volumen de datos crece mucho (miles de filas)",
    ],
    pasos: [
      "Crear la plantilla de Google Sheets con columnas definidas por el equipo",
      "Configurar una cuenta de servicio de Google Cloud para acceso por API",
      "Agregar la Google Sheets API como source en el código del dashboard",
      "Reemplazar los datos mock estáticos por fetch a la API de Sheets",
      "Compartir la planilla con los supervisores y definir convenciones de llenado",
      "Documentar el formato esperado para evitar errores de carga",
    ],
    tecnico: [
      "Google Sheets API v4 + cuenta de servicio (JSON key)",
      "Librería: googleapis (npm) en Server Component de Next.js",
      "Variables de entorno: GOOGLE_SHEETS_ID + GOOGLE_SERVICE_ACCOUNT_KEY",
      "Cache: revalidate cada 60s con Next.js fetch cache",
      "Validación: Zod schema para verificar estructura de datos recibidos",
    ],
  },
];

// ─── Componentes de apoyo ─────────────────────────────────────────────────────
function ComplejidadDots({ nivel }: { nivel: 1 | 2 | 3 }) {
  const labels = ["Baja", "Media", "Alta"];
  const colors = ["#15803D", "#B45309", "#DC2626"];
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="w-2.5 h-2.5 rounded-full transition-colors"
          style={{ background: n <= nivel ? colors[nivel - 1] : "#E4E4E7" }}
        />
      ))}
      <span className="text-[12px] ml-1" style={{ color: colors[nivel - 1] }}>
        {labels[nivel - 1]}
      </span>
    </div>
  );
}

function MetaChip({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-[#71717A]">
      <Icon size={12} className="text-[#A1A1AA] shrink-0" />
      {text}
    </div>
  );
}

function OpcionCard({ op, defaultOpen }: { op: Opcion; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const Icono = op.icono;

  return (
    <div
      className={clsx(
        "rounded-xl border transition-all duration-200 overflow-hidden",
        open ? "border-[#D4D4D8] shadow-sm" : "border-[#E4E4E7]"
      )}
    >
      {/* Header siempre visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 flex items-start gap-4 hover:bg-[#FAFAFA] transition-colors"
      >
        <div
          className="shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center mt-0.5"
          style={{ background: op.bgColor }}
        >
          <Icono size={20} style={{ color: op.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[16px] font-bold text-[#09090B]">{op.titulo}</h3>
            {op.etiqueta && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
                style={{ background: op.bgColor, color: op.etiquetaColor ?? op.color }}
              >
                <Star size={9} />
                {op.etiqueta}
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#71717A] mt-0.5">{op.subtitulo}</p>

          <div className="flex flex-wrap gap-3 mt-2.5">
            <ComplejidadDots nivel={op.complejidad} />
            <MetaChip icon={Clock} text={`${op.tiempo} de implementación`} />
          </div>
        </div>

        <div className="shrink-0 text-[#A1A1AA] mt-1">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Contenido expandido */}
      {open && (
        <div className="border-t border-[#F4F4F5] p-4 space-y-5">

          {/* Descripción */}
          <p className="text-[15px] text-[#52525B] leading-relaxed">{op.descripcion}</p>

          {/* Ventajas / desventajas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#71717A] mb-2">Ventajas</p>
              {op.ventajas.map((v) => (
                <div key={v} className="flex gap-2 text-[13px] text-[#3F3F46]">
                  <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-[#15803D]" />
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#71717A] mb-2">Consideraciones</p>
              {op.desventajas.map((d) => (
                <div key={d} className="flex gap-2 text-[13px] text-[#3F3F46]">
                  <XCircle size={13} className="shrink-0 mt-0.5 text-[#B45309]" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pasos de implementación */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#71717A] mb-3">
              Pasos de implementación
            </p>
            <div className="space-y-2">
              {op.pasos.map((paso, i) => (
                <div key={i} className="flex gap-3 text-[13px]">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background: op.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[#52525B] pt-0.5">{paso}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stack técnico */}
          <div className="rounded-[8px] bg-[#F4F4F5] border border-[#E4E4E7] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#71717A] mb-2.5 flex items-center gap-1.5">
              <Database size={10} />
              Stack técnico sugerido
            </p>
            <div className="space-y-1.5">
              {op.tecnico.map((t) => (
                <p key={t} className="text-[12px] font-mono text-[#52525B]">• {t}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function IntegracionDatos() {
  return (
    <div className="space-y-6">

      {/* Intro */}
      <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
        <h2 className="text-[18px] font-bold text-[#09090B] mb-1.5">
          ¿Cómo mantener los datos actualizados?
        </h2>
        <p className="text-[15px] text-[#71717A] leading-relaxed mb-4">
          En este momento el dashboard trabaja con <strong className="text-[#52525B]">datos de demostración</strong> fijos en el código.
          Para usarlo en producción real, los datos deben conectarse a una fuente viva.
          Estas son las tres opciones principales, ordenadas de más simple a más completa.
        </p>

        {/* Comparativa rápida */}
        <div className="overflow-x-auto rounded-lg border border-[#E4E4E7]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F4F4F5] border-b border-[#E4E4E7]">
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-[#52525B]">Opción</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[#52525B]">Complejidad</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[#52525B]">Tiempo</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[#52525B]">Actualización</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[#52525B]">Costo</th>
              </tr>
            </thead>
            <tbody>
              {[
                { nombre: "Google Sheets",   complejidad: "Baja",   tiempo: "1-2 sem.",  actualizacion: "Minutos",   costo: "Gratis",         color: "#1D4ED8" },
                { nombre: "Panel web / Login", complejidad: "Media",  tiempo: "3-6 sem.",  actualizacion: "Inmediata", costo: "Bajo",          color: "#B45309" },
                { nombre: "App por turno",   complejidad: "Media",   tiempo: "4-8 sem.",  actualizacion: "Por turno", costo: "Bajo-Medio",     color: "#15803D", recomendado: true },
              ].map((row) => (
                <tr key={row.nombre} className="border-b border-[#F4F4F5] last:border-0 bg-white hover:bg-[#FAFAFA]">
                  <td className="px-4 py-2.5 font-medium text-[#09090B] flex items-center gap-2">
                    {row.nombre}
                    {row.recomendado && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] uppercase tracking-wide">
                        ✦ Recomendado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center text-[13px] text-[#52525B]">{row.complejidad}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-[13px] text-[#52525B]">{row.tiempo}</td>
                  <td className="px-4 py-2.5 text-center text-[13px] text-[#52525B]">{row.actualizacion}</td>
                  <td className="px-4 py-2.5 text-center text-[13px] text-[#52525B]">{row.costo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards expandibles */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">
          Opciones en detalle — haz clic para expandir
        </p>
        {OPCIONES.map((op, i) => (
          <OpcionCard key={op.id} op={op} defaultOpen={i === 0} />
        ))}
      </div>

      {/* Nota final */}
      <div className="rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] p-4 flex gap-3">
        <Zap size={16} className="text-[#B45309] shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-[#3F3F46] mb-1">Camino sugerido para MSG</p>
          <p className="text-[13px] text-[#71717A] leading-relaxed">
            Comenzar con <strong className="text-[#52525B]">Google Sheets</strong> permite validar el flujo de datos sin inversión técnica.
            Una vez que el equipo confirma qué campos y qué frecuencia necesitan, se migra a la{" "}
            <strong className="text-[#52525B]">app de carga por turno</strong> para mayor precisión, trazabilidad y control de acceso.
            Ambas opciones usan la misma infraestructura de base de datos en la nube.
          </p>
        </div>
      </div>

      {/* Íconos de características */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Wifi,    label: "Funciona en faena",    desc: "Modo offline + sync automático" },
          { icon: Shield,  label: "Datos seguros",         desc: "Auth + encriptación en tránsito" },
          { icon: Lock,    label: "Acceso por roles",      desc: "Ver, editar o administrar" },
          { icon: Users,   label: "Multi-usuario",         desc: "Varios supervisores simultáneos" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="rounded-xl border border-[#E4E4E7] bg-white p-3.5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#F4F4F5] flex items-center justify-center">
              <Icon size={15} className="text-[#71717A]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#09090B]">{label}</p>
              <p className="text-[12px] text-[#A1A1AA] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
