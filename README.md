# Dashboard KPI — MSG El Salvador

Dashboard de monitoreo de disponibilidad y KPIs de flota pesada para Mining Services Group (MSG), faena El Salvador.

**URL produccion:** `https://dashboard-gold-nine-48.vercel.app`

---

## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 14.2 (App Router, Server Components, Server Actions) |
| Lenguaje | TypeScript 5 |
| Base de datos | PostgreSQL via Supabase (connection pooler en puerto 6543) |
| ORM | Drizzle ORM 0.45 (`prepare: false` para compatibilidad con pooler) |
| Estilos | Tailwind CSS 3.4 + CSS custom properties (design tokens) |
| Graficos | Recharts 3.8 (lazy-loaded) |
| Diagramas | React Flow (@xyflow/react 12) |
| Iconos | Lucide React |
| Tipografia | Geist Sans + Geist Mono (local fonts) |
| Deploy | Vercel (manual con `npx vercel --prod`) |
| Email | Resend API (opcional, para digest diario) |

---

## Inicio rapido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con credenciales de Supabase

# 3. Aplicar schema a la base de datos
npm run db:push

# 4. (Opcional) Cargar datos de ejemplo
npm run db:seed

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Variables de entorno requeridas

| Variable | Descripcion | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | Connection string pooled (puerto 6543) | Si |
| `DIRECT_URL` | Connection string directo (puerto 5432, solo migraciones) | Solo para `db:push`/`db:migrate` |
| `ADMIN_USER` | Usuario para login admin | Si |
| `ADMIN_PASSWORD` | Password para login admin | Si |
| `CRON_SECRET` | Secret para autenticar cron jobs y salt de password | Si en produccion |
| `RESEND_API_KEY` | API key de Resend para enviar email digest | Opcional |
| `DIGEST_TO` | Emails destino del digest (separados por coma) | Opcional |
| `DIGEST_FROM` | Email remitente del digest | Opcional |

### Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de produccion
npm run start        # Iniciar build local
npm run lint         # Lint con ESLint
npm run db:generate  # Generar migraciones Drizzle
npm run db:migrate   # Ejecutar migraciones
npm run db:push      # Push schema directo a BD
npm run db:studio    # Drizzle Studio (GUI de BD)
npm run db:seed      # Seed de datos iniciales
```

---

## Estructura del proyecto

```
src/
  app/                          # Rutas Next.js (App Router)
    (raiz)                      # layout.tsx, globals.css, global-error.tsx, not-found.tsx
    admin/                      # Panel de administracion
      alertas/                  #   Regenerar alertas por periodo
      calcular-kpis/            #   Calcular KPIs desde registros diarios
      equipos/                  #   CRUD de equipos
      fallas/                   #   Registro de eventos de falla
      kpis/                     #   Carga manual de KPIs
        importar/               #     Importar KPIs desde CSV
      periodos/                 #   Gestion de periodos (meses)
      registro-diario/          #   Horas diarias por equipo (5 categorias ASARCO)
      umbrales/                 #   Configurar umbrales verde/ambar/rojo
    alertas/                    # Panel de alertas activas y resueltas
    api/digest/                 # API para email digest (Vercel Cron)
    apd/                        # Analisis Predictivo de Desgaste (aceites)
    dashboard/                  # Dashboard principal con KPIs y semaforo
    docs/                       # Documentacion interna
      analisis/                 #   Analisis de datos
      arquitectura/             #   Arquitectura del sistema
      modelo/                   #   Modelo de datos interactivo
      supabase/                 #   Configuracion Supabase
    explorador/                 # Vista planilla interactiva
    flota/                      # Listado + detalle por equipo
    login/                      # Autenticacion admin
    portada/                    # Pagina de bienvenida
    reporte/                    # Reporte mensual

  components/
    apd/                        # Tabla parametros APD, uploader CSV
    charts/                     # Graficos Recharts (lazy-loaded)
    dashboard/                  # KpiSummaryStrip, FlotaSemaforo, AlertasRecientes
    docs/                       # Diagrama interactivo, navegacion por pasos
    equipo/                     # Header, panel KPI, barra ASARCO
    kpi/                        # KpiCard, KpiGauge
    layout/                     # Sidebar, TopBar, BottomNav, ShellClient
    portada/                    # GlosarioRapido
    reporte/                    # Componentes del reporte mensual
    ui/                         # Primitivos: Tooltip, ConfirmDialog, DataTable, etc.

  contexts/                     # HelpModeContext (modo ayuda contextual)
  hooks/                        # useCsvApd (parseo CSV en cliente)

  lib/
    constants/                  # Umbrales por defecto, costo hora paro
    data/                       # Adaptadores BD -> tipos de dominio
    db/
      actions/                  # Server Actions (mutaciones con verificarSesion)
      queries/                  # Queries de lectura (cache con React.cache)
      index.ts                  # Conexion Drizzle
      schema.ts                 # Schema completo de BD (13 tablas)
      seed.ts                   # Script de seed
    domain/                     # Logica de negocio pura
    supabase/                   # Clientes Supabase (client/server)
    utils/                      # safe-parse, export-csv
    help-content.ts             # 22+ entradas de ayuda contextual
```

**Total: 139 archivos fuente** (108 .tsx + 30 .ts + 1 .css)

---

## Modelo de datos

### Tablas (13)

```
tipo_flota              Catalogo: 785D, 777F, 992, PC2000
  equipo                28 equipos fisicos (CH-01, CE-04, etc.)
    kpi_equipo            KPIs mensuales (DFM, TMEF, TMPR, T.Op, Reserva)
    asarco_equipo         Distribucion ASARCO (5 categorias, suman 100%)
    registro_diario       Horas diarias por equipo en 5 categorias
    evento_falla          Fallas registradas (alimenta TMEF y TMPR)
    alerta                Alertas por KPIs fuera de umbral
    muestra_apd           Resultados analisis de aceite

periodo                 Mes/anio con label y estado cerrado/abierto
umbral_kpi              Umbrales verde/ambar/rojo versionados
analisis_apd            Sesion de carga de CSV de aceite
audit_log               Registro de auditoria inmutable
```

### Relaciones

- `equipo` -> `tipo_flota` (N:1)
- `kpi_equipo` -> `equipo` + `periodo` (unique constraint)
- `asarco_equipo` -> `equipo` + `periodo` (unique constraint)
- `alerta` -> `equipo` + `periodo`
- `muestra_apd` -> `analisis_apd` (cascade delete) + `equipo`
- `registro_diario` -> `equipo` (unique por equipo+fecha+turno)

### KPIs

| KPI | Formula | Unidad | Direccion |
|-----|---------|--------|-----------|
| DFM | (hrsOp + hrsReserva) / totalHrs x 100 | % | Mayor es mejor |
| TMEF | hrsOp / numFallas | h | Mayor es mejor |
| TMPR | hrsReparacion / numFallas | h | Menor es mejor (invertido) |
| Tiempo Operativo | hrsOp / totalHrs x 100 | % | Mayor es mejor |
| Reserva | hrsReserva / totalHrs x 100 | % | Menor es mejor (invertido) |

### Semaforo

Cada KPI se clasifica en verde/ambar/rojo segun umbrales configurables desde `/admin/umbrales`. Fallback a constantes en codigo si no hay umbrales en BD.

- KPIs normales (DFM, TMEF, T.Op): verde >= ambar >= rojo
- KPIs invertidos (TMPR, Reserva): verde <= ambar <= rojo
- Estado `paro`: equipo sin operacion con >80% de detencion no programada

---

## Modulos funcionales

### Dashboard (`/dashboard`)
- KPI strip: 5 indicadores promedio de flota con barra de progreso y delta vs periodo anterior
- Resumen ejecutivo automatico: 3-5 bullets interpretativos para gerencia
- Estimacion de perdida economica en USD (basada en horas de detencion x costo/hora por tipo de flota)
- Semaforo por tipo de flota: 4 cards con DFM/TMEF/TMPR y minibar
- Alertas prioritarias: top 5 mas criticas
- Tendencia historica por flota (Recharts, lazy-loaded)
- Distribucion ASARCO (stacked area chart)
- Selector de periodo historico

### Flota (`/flota`)
- Tabla de todos los equipos con semaforo, KPIs, modelo
- Ordenamiento automatico por criticidad: paro > rojo > ambar > verde

### Detalle de equipo (`/flota/[equipoId]`)
- Header con estado, modelo, anio fabricacion, horas acumuladas
- Panel de 5 KPIs con barra de progreso hacia meta
- Distribucion ASARCO visual
- Diagnostico causal: identifica KPIs fuera de meta, ordena por severidad, sugiere acciones
- Alertas activas del equipo

### Alertas (`/alertas`)
- Panel de alertas activas agrupadas por severidad (paro/rojo/ambar)
- Resolucion individual: accion tomada obligatoria + confirmacion
- Resolucion en lote por estado
- Historial de alertas resueltas con trazabilidad completa (quien, cuando, que accion)
- Reabrir alertas resueltas (deshacer con confirmacion y audit trail)

### APD Aceites (`/apd`)
- Carga de CSV de analisis predictivo de desgaste
- Parseo automatico: compartimento, parametro, limites, valor, unidad
- Generacion de alertas predictivas por equipo (transaccion atomica)
- Tabla de parametros con semaforo verde/ambar/rojo

### Admin (`/admin`)
Flujo guiado: 1. Periodos -> 2. Registro diario -> 3. Fallas -> 4. Calcular KPIs

| Seccion | Funcion |
|---------|---------|
| Periodos | Crear/cerrar meses, gestionar estado abierto/cerrado |
| Registro diario | Horas por equipo por dia (5 categorias ASARCO) |
| Fallas | Registrar/importar eventos de falla (CSV con ; o ,) |
| Calcular KPIs | Procesar registros + fallas -> KPIs + ASARCO automaticamente |
| Equipos | Alta/baja/edicion, reactivar equipos dados de baja |
| Umbrales | Configurar verde/ambar/rojo por KPI con validacion de coherencia |
| Alertas | Regenerar alertas de un periodo con confirmacion |
| Importar KPIs | Carga manual de KPIs via CSV (bypass calculo automatico) |

### Reporte (`/reporte`)
- Reporte mensual con preview HTML
- Comparacion entre periodos
- Exportable a imagen (html-to-image)
- Integracion de datos historicos

### Explorador (`/explorador`)
- Vista planilla de KPIs, registros diarios, fallas
- Filtros por equipo y periodo
- Comparativa por turno (dia/noche) cuando hay datos

### Documentacion (`/docs`)
- Modelo de datos interactivo con React Flow (click para ver detalle de entidad)
- Arquitectura del sistema con diagrama de componentes
- Guia de configuracion Supabase

### Digest por email (`/api/digest`)
- Endpoint para Vercel Cron (diario a las 7am)
- HTML con KPIs, estado, alertas prioritarias, perdida estimada
- Autenticacion con `CRON_SECRET` via `crypto.timingSafeEqual`
- Envio via Resend API (opcional; sin config retorna HTML para preview)
- `?preview=1` fuerza retorno HTML sin enviar

---

## Seguridad

| Medida | Implementacion |
|--------|----------------|
| Autenticacion | PBKDF2 (100k iteraciones, SHA-512) + `timingSafeEqual` |
| Sesion | Cookie `httpOnly`, `secure`, `sameSite: strict`, 4h TTL |
| Server Actions | `verificarSesion()` en 21 funciones de mutacion |
| Middleware | Protege `/admin`, `/reporte`, `/explorador` (valida UUID >= 36 chars) |
| Rate limiting | 5 intentos / 15 min por usuario en login |
| Redirect | Validacion contra open redirect (`//`, `..`) |
| Headers | HSTS (2 anios), X-Frame-Options DENY, nosniff, Permissions-Policy |
| Errores | `errorSeguro()` sanitiza mensajes para no exponer BD |
| API digest | Timing-safe compare con `crypto.timingSafeEqual` |
| Inputs | `maxLength` client + server, validacion de rangos |
| CSRF | Proteccion nativa de Next.js Server Actions |

---

## Accesibilidad (WCAG AA)

- Contraste minimo 4.5:1 en todos los textos informativos
- `focus-visible` con outline de 2px en elementos interactivos
- Skip-to-content link para navegacion por teclado
- `aria-current="page"` en sidebar y bottom nav
- `aria-label` en 22+ inputs del admin
- `scope="col"` en headers de tabla
- `<dialog>` nativo con focus trap en modales de confirmacion
- `prefers-reduced-motion` respetado (animaciones deshabilitadas)
- Tooltips accesibles con `role`, `aria-label`, `tabIndex`

---

## Impresion

- Clase `.no-print` oculta sidebar, topbar, bottom nav
- `print-color-adjust: exact` preserva colores de semaforo
- Pagina A4 con margenes de 1.5cm
- Font base 10pt Arial

---

## Deploy

**Regla critica:** `git push` NO dispara auto-deploy en Vercel. El deploy es manual:

```bash
cd dashboard
npx vercel --prod
```

### Proceso completo

1. Aplicar cambios
2. Verificar build: `npx next build`
3. Commit y push: `git add ... && git commit && git push`
4. Deploy: `npx vercel --prod`
5. Verificar en `https://dashboard-gold-nine-48.vercel.app`

---

## Arquitectura

### Flujo de datos

```
Registro Diario (horas/dia)  ---+
                                +--> calcularKpiEquipo() --> kpi_equipo + asarco_equipo
Eventos de Falla             ---+                           |
                                                            v
                                     calcularSemaforos() --> alerta (por umbral)

CSV APD (aceites)  --> parsearCsvApd() --> analisis_apd + muestra_apd (transaccion)
                                           |
                                           v
                                     alerta (tipo "apd", predictiva)
```

### Patron Server Actions

```typescript
export async function accion(input: Input): Promise<ActionResult<T>> {
  await verificarSesion();              // 1. Auth
  const error = validar(input);         // 2. Validar
  if (error) return { ok: false, error };
  try {
    const resultado = await db...;      // 3. Ejecutar
    await registrarAuditoria(...);      // 4. Audit trail
    revalidatePath("/", "layout");      // 5. Revalidar cache
    return { ok: true, data: resultado };
  } catch (e) {
    return { ok: false, error: errorSeguro(e, "contexto") };
  }
}
```

### Queries con cache

```typescript
export const getFlota = cache(async (periodoId?: number) => {
  // React.cache deduplica dentro del mismo render
  // revalidatePath invalida el cache tras mutaciones
});
```

---

## Historial de versiones

Ver [CHANGELOG.md](./CHANGELOG.md) para el detalle completo.

| Version | Fecha | Resumen |
|---------|-------|---------|
| v1.4 | 2026-05-07 | Tres auditorias: seguridad, integridad transaccional, SEO, error boundaries |
| v1.3 | 2026-05-07 | Alertas con trazabilidad, diagnostico causal, ayuda contextual |
| v1.2 | 2026-05-07 | Auditoria integral de produccion en 7 fases |
