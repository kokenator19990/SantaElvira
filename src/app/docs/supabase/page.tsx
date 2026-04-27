import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Cloud,
  GitBranch,
  Lock,
  Network,
  Cpu,
  ListTree,
  Workflow,
  CheckCircle2,
  AlertTriangle,
  Info,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const revalidate = 3600;

export default function DocsSupabasePage() {
  return (
    <div className="max-w-[960px] mx-auto flex flex-col gap-10 pb-12">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/docs"
          className="mt-1 inline-flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#E4E4E7] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
          aria-label="Volver a documentación"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="flex-1">
          <SectionTitle>Supabase — Base de datos en producción</SectionTitle>
          <p className="text-[13px] text-[#3F3F46] mt-2 leading-relaxed max-w-2xl">
            Cómo está armada físicamente la base de datos del dashboard MSG: el
            proyecto en Supabase, las 9 tablas, las migraciones con Drizzle, las
            conexiones desde Vercel, y el flujo de datos completo desde un click
            en <code className="text-[12px] font-mono bg-[#F4F4F5] px-1.5 py-0.5 rounded">/admin/kpis</code> hasta Postgres.
          </p>
        </div>
      </div>

      {/* ── Stack ──────────────────────────────────────────────────────────── */}
      <Section
        n={1}
        icon={Cloud}
        title="Stack de la BD"
        intro="La base de datos es Postgres 17.6 gestionado por Supabase. No corre en la máquina de nadie — vive en AWS y se conecta vía un pooler para no agotar conexiones cuando Vercel ejecuta múltiples funciones serverless en paralelo."
      >
        <Diag>
          <Box color="#1A5276" bg="#EBF5FB" title="Frontend Next.js" sub="Vercel · Edge / Serverless" />
          <Arrow label="postgres-js + Drizzle" />
          <Box color="#7D3C98" bg="#F4ECF7" title="Pooler Supabase" sub="aws-1-us-west-2 · puerto 6543 · Transaction mode" />
          <Arrow label="TCP" />
          <Box color="#CA6F1E" bg="#FDF2E9" title="Postgres 17.6" sub="Supabase managed · us-west-2 · t4g.nano" cylinder />
        </Diag>
        <Note tone="info">
          El <strong>pooler</strong> es un proxy ligero (Supavisor) que multiplexa miles de
          conexiones de aplicaciones a un puñado de conexiones reales contra Postgres.
          Crítico en serverless: cada función Vercel abre su propia conexión, sin
          pooler agotaríamos el límite de Postgres en segundos.
        </Note>
        <Specs
          items={[
            ["Proyecto", "kokenator19990's Project"],
            ["URL del proyecto", "ithyrsesbvitopvsgcpo.supabase.co"],
            ["Plan", "FREE (NANO tier · 500 MB · 60 conexiones)"],
            ["Región DB", "West US (Oregon) · us-west-2"],
            ["Cluster pooler", "aws-1-us-west-2.pooler.supabase.com"],
            ["Engine", "Postgres 17.6 sobre aarch64"],
          ]}
        />
      </Section>

      {/* ── Tablas ──────────────────────────────────────────────────────────── */}
      <Section
        n={2}
        icon={ListTree}
        title="Las 9 tablas"
        intro="El esquema sigue el modelo documentado en /docs/modelo. Cada tabla tiene una responsabilidad clara y se relaciona con las demás vía claves foráneas."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TABLAS.map((t) => (
            <div key={t.nombre} className="rounded-[10px] border border-[#E4E4E7] bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[11px] font-mono font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: t.bg, color: t.color }}
                >
                  {t.nombre}
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-mono">{t.cardinalidad}</span>
              </div>
              <p className="text-[12px] text-[#3F3F46] leading-relaxed mb-2">{t.descripcion}</p>
              <p className="text-[10px] text-[#71717A]">
                <strong className="text-[#52525B]">Campos clave:</strong> {t.camposClave}
              </p>
            </div>
          ))}
        </div>
        <Note tone="info">
          La definición exacta vive en <Code>src/lib/db/schema.ts</Code>. Drizzle deriva los tipos
          TypeScript automáticamente — si agregas una columna en el schema, los componentes que la
          usan no compilan hasta que la manejen.
        </Note>
      </Section>

      {/* ── Migraciones ──────────────────────────────────────────────────────── */}
      <Section
        n={3}
        icon={GitBranch}
        title="Migraciones con Drizzle"
        intro="Drizzle Kit genera SQL de migración a partir del schema TS y lo aplica contra la BD. Las migraciones quedan versionadas en /drizzle (commiteadas en git)."
      >
        <Steps
          steps={[
            {
              titulo: "Editar schema",
              detalle: "Modificas src/lib/db/schema.ts: agregas columna, cambias tipo, etc.",
            },
            {
              titulo: "Generar SQL",
              detalle: "npm run db:generate → drizzle-kit lee el schema, lo compara con el snapshot anterior y produce drizzle/0001_xxx.sql con los ALTER necesarios.",
            },
            {
              titulo: "Revisar SQL",
              detalle: "Abres el archivo .sql y lees los CREATE / ALTER que se van a aplicar. Si ves un DROP TABLE inesperado, no lo apliques.",
            },
            {
              titulo: "Aplicar a Supabase",
              detalle: "npm run db:migrate → drizzle ejecuta el SQL contra la BD vía DATABASE_URL. Registra la migración en __drizzle_migrations para no aplicarla dos veces.",
            },
            {
              titulo: "Commitear",
              detalle: "git add drizzle/ && git commit. La migración queda en historial. Nunca borrar archivos de drizzle/ — solo agregar nuevos.",
            },
          ]}
        />
        <Note tone="warn">
          <strong>Nunca</strong> editar a mano un archivo .sql de migración ya commiteado: rompe el
          tracking de drizzle. Si necesitas corregir, genera una nueva migración encima.
        </Note>
      </Section>

      {/* ── Conexiones ──────────────────────────────────────────────────────── */}
      <Section
        n={4}
        icon={Network}
        title="Conexiones — Pooler vs Direct"
        intro="Supabase expone dos tipos de connection string. Cada una tiene su uso correcto."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConnTipo
            badge="DATABASE_URL"
            color="#15803D"
            bg="#F0FDF4"
            titulo="Pooled (Transaction mode)"
            host="aws-1-us-west-2.pooler.supabase.com"
            puerto="6543"
            usuario="postgres.ithyrsesbvitopvsgcpo"
            uso="Runtime de Vercel: queries en RSC y server actions."
            puntos={[
              "Soporta IPv4 (free tier)",
              "Conexión multiplexada por Supavisor",
              "Requiere prepare:false (no soporta prepared statements persistentes)",
            ]}
          />
          <ConnTipo
            badge="DIRECT_URL"
            color="#1A5276"
            bg="#EBF5FB"
            titulo="Direct connection"
            host="db.ithyrsesbvitopvsgcpo.supabase.co"
            puerto="5432"
            usuario="postgres"
            uso="Migraciones desde tu máquina con drizzle-kit."
            puntos={[
              "Solo IPv6 en free tier (IPv4 paid add-on)",
              "1:1 con Postgres real",
              "Prepared statements OK",
              "No usar en serverless (agota conexiones)",
            ]}
          />
        </div>
        <Note tone="info">
          En este proyecto ambas envvars apuntan al pooler con puerto 6543/5432 (mismo host) porque
          el free tier no expone direct connection IPv4. Funciona perfecto: las migraciones tampoco
          son tan rápidas como para necesitar direct, y todo va vía pooler.
        </Note>
      </Section>

      {/* ── Flujo end-to-end ─────────────────────────────────────────────────── */}
      <Section
        n={5}
        icon={Workflow}
        title="Flujo end-to-end: del click al disco"
        intro="Qué pasa cuando un supervisor edita un KPI en /admin/kpis y presiona ✓."
      >
        <Diag>
          <Box color="#1A5276" bg="#EBF5FB" title="1. Browser" sub="onClick → form data" />
          <Arrow label="Server Action invocation" />
          <Box color="#7D3C98" bg="#F4ECF7" title="2. Vercel Function" sub="upsertKpiEquipo() corriendo" />
          <Arrow label="postgres.com" />
          <Box color="#15803D" bg="#F0FDF4" title="3. Supavisor pool" sub="aws-1-us-west-2:6543" />
          <Arrow label="SQL INSERT...ON CONFLICT" />
          <Box color="#CA6F1E" bg="#FDF2E9" title="4. Postgres" sub="kpi_equipo upsert" cylinder />
          <Arrow label="revalidatePath('/', 'layout')" reverse />
          <Box color="#922B21" bg="#FDEDEC" title="5. Cache invalidate" sub="Próxima request del dashboard re-fetcha" />
        </Diag>
        <Note tone="ok">
          El último paso (revalidatePath) es lo que hace que el dashboard refleje el cambio
          inmediatamente. Sin él, los datos quedarían cacheados hasta que se cumpliera el
          <Code>revalidate = 300</Code> (5 minutos) declarado en cada page RSC.
        </Note>
      </Section>

      {/* ── Env vars ──────────────────────────────────────────────────────────── */}
      <Section
        n={6}
        icon={KeyRound}
        title="Env vars — quién sabe qué cosa"
        intro="Las credenciales viven en .env.local (gitignored) y en el panel de Vercel para producción."
      >
        <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
              <tr className="text-[10px] uppercase tracking-wider text-[#71717A]">
                <th className="px-3 py-2 text-left">Variable</th>
                <th className="px-3 py-2 text-left">Para qué</th>
                <th className="px-3 py-2 text-center">Local</th>
                <th className="px-3 py-2 text-center">Vercel</th>
                <th className="px-3 py-2 text-center">Cliente</th>
              </tr>
            </thead>
            <tbody>
              {ENVS.map((e) => (
                <tr key={e.nombre} className="border-t border-[#F4F4F5]">
                  <td className="px-3 py-2 font-mono text-[#09090B] font-bold">{e.nombre}</td>
                  <td className="px-3 py-2 text-[#52525B]">{e.proposito}</td>
                  <td className="px-3 py-2 text-center">{e.local ? "✓" : "—"}</td>
                  <td className="px-3 py-2 text-center">{e.vercel ? "✓" : "—"}</td>
                  <td className="px-3 py-2 text-center">{e.cliente ? "🌐" : "🔒"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note tone="warn">
          Las que empiezan con <Code>NEXT_PUBLIC_</Code> viajan al browser. <strong>Nunca</strong>
          poner allí una password o una service-role key. <Code>DATABASE_URL</Code> y
          <Code>DIRECT_URL</Code> contienen el password de Postgres y son server-only.
        </Note>
      </Section>

      {/* ── Operaciones futuras ────────────────────────────────────────────── */}
      <Section
        n={7}
        icon={RefreshCw}
        title="Operaciones futuras"
        intro="Casos de mantenimiento que vas a encontrarte."
      >
        <Op
          icon={Database}
          titulo="Cargar el mes nuevo"
          pasos={[
            "/admin/periodos → Crear (Año, Mes)",
            "/admin/kpis → seleccionar el período → editar las 28 filas → Guardar todo",
            "Click 'Regenerar alertas' (o usar /admin/alertas)",
            "El dashboard refleja el período nuevo en su próxima carga (revalidatePath ya lo invalidó)",
          ]}
        />
        <Op
          icon={GitBranch}
          titulo="Agregar una columna a una tabla"
          pasos={[
            "Editar src/lib/db/schema.ts (agregar el campo)",
            "npm run db:generate → drizzle crea drizzle/000X_xxx.sql",
            "Revisar el SQL antes de aplicarlo",
            "npm run db:migrate → aplica el ALTER TABLE en Supabase",
            "Adaptar las queries en src/lib/db/queries/ para incluir el campo nuevo",
            "git commit drizzle/ + schema.ts + queries → push → Vercel deploy",
          ]}
        />
        <Op
          icon={AlertTriangle}
          titulo="Backup manual"
          pasos={[
            "Supabase Dashboard → Database → Backups",
            "Free tier: backup automático diario, retenido 7 días (sin restore manual)",
            "Para snapshot manual: Database → SQL Editor → ejecutar pg_dump (limitado en free tier)",
            "Alternativa práctica: clonar localmente con pg_dump vía DIRECT_URL si tienes IPv6",
          ]}
        />
        <Op
          icon={Cpu}
          titulo="Rotar el password de la BD"
          pasos={[
            "Supabase → Project Settings → Database → Reset database password",
            "Copiar el nuevo y guardarlo en password manager",
            "Actualizar DATABASE_URL y DIRECT_URL en .env.local",
            "vercel env rm DATABASE_URL production --yes && vercel env add DATABASE_URL production (idem para DIRECT_URL)",
            "vercel --prod para que el deploy nuevo agarre las envvars",
          ]}
        />
      </Section>

      {/* ── Diferencias con el modelo conceptual ────────────────────────────── */}
      <Section
        n={8}
        icon={Info}
        title="¿Cómo se traduce el modelo conceptual al SQL real?"
        intro="El diagrama ER en /docs/modelo es la vista lógica. Aquí el mapeo a Postgres."
      >
        <div className="overflow-x-auto rounded-[10px] border border-[#E4E4E7] bg-white">
          <table className="w-full text-[11px]">
            <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7]">
              <tr className="text-[10px] uppercase tracking-wider text-[#71717A]">
                <th className="px-3 py-2 text-left">Conceptual (ER)</th>
                <th className="px-3 py-2 text-left">Implementación SQL</th>
                <th className="px-3 py-2 text-left">Por qué</th>
              </tr>
            </thead>
            <tbody>
              {MAPEOS.map((m, i) => (
                <tr key={i} className="border-t border-[#F4F4F5]">
                  <td className="px-3 py-2 font-mono text-[#52525B]">{m.conceptual}</td>
                  <td className="px-3 py-2 font-mono text-[#09090B]">{m.sql}</td>
                  <td className="px-3 py-2 text-[#71717A]">{m.razon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Seguridad ───────────────────────────────────────────────────────── */}
      <Section
        n={9}
        icon={Lock}
        title="Seguridad — estado actual y plan"
        intro="Hoy el sistema funciona pero la seguridad es mínima. Lo que falta y por qué."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Estado
            titulo="SQL injection"
            estado="ok"
            detalle="Drizzle parametriza todas las queries automáticamente. Las plantillas sql`...` también escapan."
          />
          <Estado
            titulo="Credenciales en logs"
            estado="ok"
            detalle="Env vars solo server-side. El password de Postgres nunca llega al browser."
          />
          <Estado
            titulo="Server actions"
            estado="ok"
            detalle="Next.js firma cada action ID. Validamos rangos, formatos y suma ASARCO=100."
          />
          <Estado
            titulo="Auth en /admin"
            estado="warn"
            detalle="Hoy /admin es público (proyecto privado para demo). Antes de exponerlo: Supabase Auth con login real."
          />
          <Estado
            titulo="RLS policies"
            estado="warn"
            detalle="No hay Row Level Security. El password de Postgres da acceso total. RLS llegaría junto con Supabase Auth."
          />
          <Estado
            titulo="Rate limiting"
            estado="warn"
            detalle="Sin límite en server actions. Aceptable para una mina con un solo supervisor; problemático si se expone públicamente."
          />
        </div>
      </Section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-[#F4F4F5] p-5 text-[12px] text-[#52525B] leading-relaxed">
        <strong className="text-[#09090B]">Ver también:</strong>
        <div className="flex flex-wrap gap-3 mt-2">
          <Link href="/docs/modelo" className="underline text-[#B45309] hover:text-[#92400E]">
            Modelo de Datos (vista ER)
          </Link>
          <Link href="/docs/arquitectura" className="underline text-[#B45309] hover:text-[#92400E]">
            Arquitectura del Sistema
          </Link>
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noreferrer"
            className="underline text-[#B45309] hover:text-[#92400E]"
          >
            Supabase Docs ↗
          </a>
          <a
            href="https://orm.drizzle.team/docs/overview"
            target="_blank"
            rel="noreferrer"
            className="underline text-[#B45309] hover:text-[#92400E]"
          >
            Drizzle Docs ↗
          </a>
        </div>
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
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[12px] font-bold font-mono">
          {n}
        </span>
        <Icon size={18} className="text-[#52525B]" />
        <h2 className="text-[16px] font-bold text-[#09090B] tracking-tight">{title}</h2>
      </div>
      <p className="text-[13px] text-[#3F3F46] leading-relaxed -mt-1">{intro}</p>
      {children}
    </section>
  );
}

function Diag({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-[#FAFBFC] p-5 flex flex-col items-center gap-2">
      {children}
    </div>
  );
}

function Box({
  color,
  bg,
  title,
  sub,
  cylinder,
}: {
  color: string;
  bg: string;
  title: string;
  sub: string;
  cylinder?: boolean;
}) {
  return (
    <div
      className="px-4 py-2.5 text-center w-full max-w-[440px] border-2"
      style={{
        backgroundColor: bg,
        borderColor: color,
        borderRadius: cylinder ? "30px" : "8px",
      }}
    >
      <p className="text-[12px] font-bold leading-tight" style={{ color }}>{title}</p>
      <p className="text-[10px] mt-0.5" style={{ color: `${color}cc` }}>{sub}</p>
    </div>
  );
}

function Arrow({ label, reverse }: { label: string; reverse?: boolean }) {
  return (
    <div className="flex flex-col items-center my-1">
      <div className="w-px h-3 bg-[#A1A1AA]" />
      <div className="text-[9px] text-[#71717A] font-mono px-2 py-0.5 bg-white border border-[#E4E4E7] rounded">
        {label} {reverse && "↻"}
      </div>
      <div className="w-px h-3 bg-[#A1A1AA]" />
    </div>
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
      className="flex items-start gap-2 p-3 rounded-[8px] border text-[12px] leading-relaxed"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      <Icon size={14} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function Specs({ items }: { items: [string, string][] }) {
  return (
    <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
      <table className="w-full text-[12px]">
        <tbody>
          {items.map(([k, v]) => (
            <tr key={k} className="border-t border-[#F4F4F5] first:border-t-0">
              <td className="px-3 py-2 font-bold text-[#52525B] w-[180px]">{k}</td>
              <td className="px-3 py-2 font-mono text-[#09090B]">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Steps({ steps }: { steps: { titulo: string; detalle: string }[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 p-3 rounded-[8px] border border-[#E4E4E7] bg-white">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#09090B] text-white text-[11px] font-bold shrink-0">
            {i + 1}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-[#09090B]">{s.titulo}</p>
            <p className="text-[12px] text-[#71717A] mt-0.5 leading-relaxed">{s.detalle}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ConnTipo({
  badge,
  color,
  bg,
  titulo,
  host,
  puerto,
  usuario,
  uso,
  puntos,
}: {
  badge: string;
  color: string;
  bg: string;
  titulo: string;
  host: string;
  puerto: string;
  usuario: string;
  uso: string;
  puntos: string[];
}) {
  return (
    <div className="rounded-[10px] border border-[#E4E4E7] bg-white p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
          style={{ backgroundColor: bg, color }}
        >
          {badge}
        </span>
        <span className="text-[13px] font-semibold text-[#09090B]">{titulo}</span>
      </div>
      <div className="text-[11px] font-mono text-[#52525B] bg-[#FAFAFA] p-2 rounded leading-relaxed">
        <div><span className="text-[#A1A1AA]">host:</span> {host}</div>
        <div><span className="text-[#A1A1AA]">puerto:</span> {puerto}</div>
        <div><span className="text-[#A1A1AA]">user:</span> {usuario}</div>
      </div>
      <p className="text-[12px] text-[#3F3F46]">
        <strong className="text-[#09090B]">Uso:</strong> {uso}
      </p>
      <ul className="text-[11px] text-[#52525B] list-disc pl-4 space-y-0.5">
        {puntos.map((p) => <li key={p}>{p}</li>)}
      </ul>
    </div>
  );
}

function Op({
  icon: Icon,
  titulo,
  pasos,
}: {
  icon: React.ElementType;
  titulo: string;
  pasos: string[];
}) {
  return (
    <div className="rounded-[10px] border border-[#E4E4E7] bg-white p-4 flex flex-col gap-2 mb-3">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-[#52525B]" />
        <p className="text-[13px] font-semibold text-[#09090B]">{titulo}</p>
      </div>
      <ol className="text-[12px] text-[#52525B] list-decimal pl-5 space-y-1 leading-relaxed">
        {pasos.map((p, i) => <li key={i}>{p}</li>)}
      </ol>
    </div>
  );
}

function Estado({
  titulo,
  estado,
  detalle,
}: {
  titulo: string;
  estado: "ok" | "warn";
  detalle: string;
}) {
  const cfg = {
    ok:   { color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", icon: CheckCircle2 },
    warn: { color: "#92400E", bg: "#FFFBEB", border: "#FDE68A", icon: AlertTriangle },
  }[estado];
  const Icon = cfg.icon;
  return (
    <div className="rounded-[10px] p-3 border flex flex-col gap-1.5" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
      <div className="flex items-center gap-1.5">
        <Icon size={13} style={{ color: cfg.color }} />
        <p className="text-[12px] font-bold" style={{ color: cfg.color }}>{titulo}</p>
      </div>
      <p className="text-[11px] text-[#52525B] leading-relaxed">{detalle}</p>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-[11px] font-mono bg-[#F4F4F5] px-1.5 py-0.5 rounded">{children}</code>
  );
}

/* ─── Datos ─────────────────────────────────────────────────────────────── */

const TABLAS = [
  {
    nombre: "tipo_flota",
    color: "#1A5276",
    bg: "#EBF5FB",
    cardinalidad: "4 filas",
    descripcion: "Catálogo de tipos de equipo. Cambia raras veces.",
    camposClave: "id (PK TEXT) · codigo · descripcion · fabricante",
  },
  {
    nombre: "equipo",
    color: "#1A5276",
    bg: "#EBF5FB",
    cardinalidad: "28 filas (crece poco)",
    descripcion: "Cada uno de los 28 equipos físicos de la mina. Identificados por su código humano (CH-01, CE-04…).",
    camposClave: "id (PK TEXT) · tipo_flota_id (FK) · modelo · anio_fabricacion · en_servicio",
  },
  {
    nombre: "periodo",
    color: "#1E8449",
    bg: "#EAF4E8",
    cardinalidad: "1 fila/mes",
    descripcion: "Calendario de meses con datos. Se crea uno antes de cargar los KPIs del mes.",
    camposClave: "id (PK SERIAL) · anio · mes · label · cerrado · UNIQUE(anio, mes)",
  },
  {
    nombre: "umbral_kpi",
    color: "#1E8449",
    bg: "#EAF4E8",
    cardinalidad: "5 filas (1 por KPI)",
    descripcion: "Umbrales verde/ámbar para cada KPI. Versionables por fecha (vigente_desde/hasta).",
    camposClave: "kpi · nivel_verde · nivel_ambar · invertido · vigente_desde",
  },
  {
    nombre: "kpi_equipo",
    color: "#CA6F1E",
    bg: "#FDF2E9",
    cardinalidad: "28 × #periodos",
    descripcion: "El corazón del dashboard. Una fila por cada equipo en cada mes con DFM, TMEF, TMPR, T.Op, Reserva.",
    camposClave: "equipo_id (FK) · periodo_id (FK) · dfm · tmef · tmpr · paro_total · UNIQUE(equipo, periodo)",
  },
  {
    nombre: "asarco_equipo",
    color: "#CA6F1E",
    bg: "#FDF2E9",
    cardinalidad: "28 × #periodos",
    descripcion: "Distribución ASARCO mensual. Los 5 segmentos suman 100%.",
    camposClave: "equipo_id (FK) · periodo_id (FK) · pct_operativo / reserva / det_programada / det_no_prog / perdida_op",
  },
  {
    nombre: "alerta",
    color: "#922B21",
    bg: "#FDEDEC",
    cardinalidad: "~80–100 por mes",
    descripcion: "Cada KPI fuera de umbral genera una alerta. Se regeneran al cambiar KPIs o umbrales.",
    camposClave: "equipo_id (FK) · periodo_id (FK) · kpi · valor_actual · estado · resuelta",
  },
  {
    nombre: "analisis_apd",
    color: "#7D3C98",
    bg: "#F4ECF7",
    cardinalidad: "1 por CSV cargado",
    descripcion: "Cabecera de cada análisis de aceites. Asocia un CSV a un período y a quién lo cargó.",
    camposClave: "periodo_id (FK) · fecha_analisis · archivo_origen · creado_por",
  },
  {
    nombre: "muestra_apd",
    color: "#7D3C98",
    bg: "#F4ECF7",
    cardinalidad: "100–200 por análisis",
    descripcion: "Cada fila del CSV es una muestra. Cascade delete: si borras el análisis, sus muestras se borran.",
    camposClave: "analisis_id (FK CASCADE) · equipo_id (FK) · parametro · valor · estado",
  },
];

const ENVS = [
  { nombre: "DATABASE_URL",                proposito: "Connection string del pooler. Runtime queries.", local: true, vercel: true, cliente: false },
  { nombre: "DIRECT_URL",                  proposito: "Connection string directa. Migraciones drizzle-kit.", local: true, vercel: true, cliente: false },
  { nombre: "NEXT_PUBLIC_SUPABASE_URL",    proposito: "URL pública del proyecto. Para Auth/Storage en Fase 4.", local: true, vercel: true, cliente: true },
  { nombre: "NEXT_PUBLIC_SUPABASE_ANON_KEY", proposito: "Pública. Cliente JS para Auth/Realtime. Pendiente.", local: false, vercel: false, cliente: true },
];

const MAPEOS = [
  { conceptual: "PK \"id\"",                sql: "PRIMARY KEY",                                    razon: "Postgres impone unicidad e indexa automáticamente." },
  { conceptual: "FK con cascade",           sql: "REFERENCES x(id) ON DELETE CASCADE",             razon: "Borrar análisis borra sus muestras." },
  { conceptual: "FK normal",                sql: "REFERENCES x(id) (sin cascade)",                 razon: "No queremos borrar equipos por accidente al borrar histórico." },
  { conceptual: "Decimal (5,2) para %",     sql: "decimal(5,2) NOT NULL",                          razon: "Range 0–999.99, suficiente y exacto (no float)." },
  { conceptual: "Texto enum (\"verde\"…)",  sql: "text NOT NULL (sin CHECK aún)",                  razon: "Flexible. Validación en server action. Migraremos a enum si crece." },
  { conceptual: "Único (equipo, periodo)",  sql: "UNIQUE INDEX (equipo_id, periodo_id)",           razon: "Soporta upsert con onConflictDoUpdate." },
  { conceptual: "Timestamp creación",       sql: "timestamp with time zone DEFAULT now()",         razon: "TZ-aware. Postgres guarda UTC, convierte al leer." },
];
