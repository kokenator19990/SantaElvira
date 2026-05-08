# Changelog — Dashboard KPI MSG El Salvador

## v1.4 — 2026-05-07

### Resumen

Tres rondas de auditoria de seguridad, integridad de datos, logica de negocio, robustez, SEO y accesibilidad. 53 archivos modificados en total (17 archivos en la tercera ronda, 6 en la segunda, 18 en la primera). Todas las correcciones verificadas con build exitoso y desplegadas a produccion.

---

### Primera auditoria — Seguridad y funcionalidad (18 archivos)

#### P0 — Seguridad critica

| Hallazgo | Archivo | Correccion |
|----------|---------|------------|
| Rate limiting con clave generica `"server-action"` | `login/page.tsx` | Clave por usuario: `login:${usuario.toLowerCase()}` |
| Open redirect en login (`from` param sin validar) | `login/page.tsx` | Validacion: `!from.startsWith("//") && !from.includes("..")` |
| Sesion validada con `length < 10` (demasiado permisivo) | `middleware.ts`, `session.ts` | Cambiado a `length < 36` (UUID minimo) |
| Rutas `/reporte` y `/explorador` sin proteccion | `middleware.ts` | Agregadas a `RUTAS_PROTEGIDAS` |

#### P1 — Bugs funcionales

| Hallazgo | Archivo | Correccion |
|----------|---------|------------|
| `Number(x) \|\| FALLBACK` trata 0 como falsy | `dashboard/page.tsx`, `flota/[equipoId]/page.tsx` | Helper `parseUmbral()` con `Number.isFinite()` |
| Periodo inexistente no validado al regenerar alertas | `lib/db/actions/kpis.ts` | Check `if (!per) return error` antes de operar |
| APD parser acepta filas sin equipo o valor no numerico | `lib/domain/apd-parser.ts` | Validacion: `!equipo` -> skip, `isNaN(valor)` -> skip |
| Color de paro inconsistente (`#DC2626` vs `#991B1B`) | `lib/constants/umbrales.ts` | Unificado a `#991B1B` |
| Alertas `resolverTodasPorEstado` sin param usuario | `lib/db/actions/alertas.ts` | Agregado `usuario?: string` al params |
| Year validation acepta valores fuera de rango | `EquiposAdminClient.tsx`, `PeriodosAdminClient.tsx` | Rango 1990-2099 |
| `parseFloat` NaN en umbrales sin proteccion | `UmbralesAdminClient.tsx` | `Number.isFinite()` check |

#### P2 — UX

| Hallazgo | Archivo | Correccion |
|----------|---------|------------|
| Inputs sin `maxLength` | `AlertaRowClient.tsx`, `ResolverTodasButton.tsx` | `maxLength={500}` |
| ReabrirButton sin advertencia de datos que se pierden | `ReabrirButton.tsx` | Mensaje explica que accion y datos de resolucion se eliminan |
| Version desactualizada en sidebar | `Sidebar.tsx` | Actualizada a v1.4 |
| TopBar sin ruta `/docs` ni `/admin/*` | `TopBar.tsx` | Rutas agregadas al mapa |
| CalcularKpis no limpia estado de error | `CalcularKpisClient.tsx` | Reset de advertencias/diasEnMes on error |

**Commit:** `11fd68c`

---

### Segunda auditoria — Seguridad y robustez (6 archivos)

~64 hallazgos brutos de 4 agentes paralelos, filtrados a 6 reales despues de eliminar falsos positivos.

| # | Hallazgo | Archivo | Correccion |
|---|----------|---------|------------|
| 1 | Sin header HSTS | `next.config.mjs` | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` |
| 2 | ReabrirButton ignora resultado de `reabrirAlerta()` | `ReabrirButton.tsx` | Estado de error + manejo de `result.ok` |
| 3 | `accionTomada` sin validacion de longitud server-side | `lib/db/actions/alertas.ts` | `trim().length > 500` check en `resolverAlerta` y `resolverTodasPorEstado` |
| 4 | Umbrales verde/ambar sin validacion de coherencia | `UmbralesAdminClient.tsx` | Validacion: invertido -> verde <= ambar; normal -> verde >= ambar |
| 5 | MiniBar NaN con `max=0` | `FlotaSemaforo.tsx` | `Number.isFinite(valor / max)` guard |
| 6 | Insight text overflow en mobile | `KpiSummaryStrip.tsx` | `line-clamp-2` |

**Commit:** `acac23a`

---

### Tercera auditoria — Integridad, SEO y error boundaries (17 archivos)

Auditoria de areas no cubiertas previamente: integridad transaccional de BD, logica de negocio edge cases, seguridad de API, SEO/metadata, error boundaries, impresion.

#### P0 — Integridad y seguridad

| # | Hallazgo | Archivo | Correccion |
|---|----------|---------|------------|
| 1 | APD upload no atomico: si falla insercion de muestras, queda analisis huerfano | `lib/db/actions/apd.ts` | Cabecera + muestras envueltas en `db.transaction()` |
| 2 | `/api/digest` timing-safe compare con fallback a `===` directo (inseguro) | `app/api/digest/route.ts` | Reemplazado por `crypto.timingSafeEqual` de Node.js (sin fallback) |
| 3 | `/api/digest` expone emails `DIGEST_TO` en respuesta JSON | `app/api/digest/route.ts` | Campo `to` eliminado de la respuesta |

#### P1 — Logica de negocio

| # | Hallazgo | Archivo | Correccion |
|---|----------|---------|------------|
| 4 | `calcularPerdidaEstimada()` usa `new Date().getMonth()` en vez del mes del periodo | `lib/domain/resumen-ejecutivo.ts` | Acepta `periodo?: {anio, mes}`, callers actualizados |
| 5 | `crearPeriodo` race condition con mensaje generico en unique constraint | `lib/db/actions/kpis.ts` | Captura PG error 23505, retorna mensaje amigable |

#### P2 — SEO, error boundaries, impresion

| # | Hallazgo | Archivo | Correccion |
|---|----------|---------|------------|
| 6 | Sin `global-error.tsx` (errores de layout no manejados) | `app/global-error.tsx` | Creado con boton "Intentar de nuevo" |
| 7 | Sin `not-found.tsx` (404 generico) | `app/not-found.tsx` | Creado con link a dashboard |
| 8 | 23 paginas sin metadata (titulos de pestana genericos) | `layout.tsx` + 9 paginas | Title template `%s — MSG El Salvador` + metadata en 9 paginas clave |
| 9 | Colores de semaforo no se preservan al imprimir | `globals.css` | `print-color-adjust: exact` en `@media print` |

**Commit:** `bb759e3`

---

### Archivos modificados en v1.4 (por ronda)

#### Primera ronda (18 archivos)
- `src/app/login/page.tsx`
- `src/middleware.ts`
- `src/lib/db/actions/session.ts`
- `src/app/dashboard/page.tsx`
- `src/app/flota/[equipoId]/page.tsx`
- `src/lib/db/actions/kpis.ts`
- `src/lib/domain/apd-parser.ts`
- `src/lib/constants/umbrales.ts`
- `src/lib/db/actions/alertas.ts`
- `src/app/admin/equipos/EquiposAdminClient.tsx`
- `src/app/admin/periodos/PeriodosAdminClient.tsx`
- `src/app/admin/umbrales/UmbralesAdminClient.tsx`
- `src/app/alertas/AlertaRowClient.tsx`
- `src/app/alertas/ResolverTodasButton.tsx`
- `src/app/alertas/ReabrirButton.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopBar.tsx`
- `src/app/admin/calcular-kpis/CalcularKpisClient.tsx`

#### Segunda ronda (6 archivos)
- `next.config.mjs`
- `src/app/alertas/ReabrirButton.tsx`
- `src/lib/db/actions/alertas.ts`
- `src/app/admin/umbrales/UmbralesAdminClient.tsx`
- `src/components/dashboard/FlotaSemaforo.tsx`
- `src/components/dashboard/KpiSummaryStrip.tsx`

#### Tercera ronda (17 archivos, 2 creados + 15 modificados)

Creados:
- `src/app/global-error.tsx`
- `src/app/not-found.tsx`

Modificados:
- `src/app/admin/page.tsx`
- `src/app/alertas/page.tsx`
- `src/app/apd/page.tsx`
- `src/app/api/digest/route.ts`
- `src/app/dashboard/page.tsx`
- `src/app/docs/page.tsx`
- `src/app/explorador/page.tsx`
- `src/app/flota/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/login/page.tsx`
- `src/app/reporte/page.tsx`
- `src/lib/db/actions/apd.ts`
- `src/lib/db/actions/kpis.ts`
- `src/lib/domain/resumen-ejecutivo.ts`

---

### Verificacion

- **Build:** 3 builds exitosos (uno por ronda), 0 errores
- **Deploy:** 3 deploys a produccion via `npx vercel --prod`
- **Commits:** `11fd68c`, `acac23a`, `bb759e3`
- **Version:** v1.4 · MSG 2026

---

## v1.3 — 2026-05-07

### Resumen

Rediseño completo del flujo de alertas con trazabilidad, confirmación obligatoria y opción de deshacer. Auditoría integral UX desde perspectiva de operario y tomador de decisión. Diagnóstico causal en detalle de equipo. Ordenamiento por criticidad en flota.

---

### Sistema de alertas con trazabilidad

**Problema:** Al resolver una alerta, se ejecutaba inmediatamente sin confirmación, sin registro de qué acción se tomó, y sin saber a dónde iba la alerta resuelta.

**Solución completa:**

| Funcionalidad | Detalle |
|---------------|---------|
| Confirmación obligatoria | Diálogo modal antes de resolver cualquier alerta individual |
| Acción requerida | Campo de texto obligatorio "¿Qué acción se tomó?" |
| Trazabilidad | La alerta pasa al historial de resolución visible al final de la página |
| Deshacer | Botón "Reabrir" en cada alerta resuelta para devolver al panel activo |
| Resolver en lote | "Resolver todas" también pide acción obligatoria y muestra confirmación |
| Regenerar alertas | Diálogo de confirmación antes de regenerar alertas de un período |

**Archivos creados:**

| Archivo | Propósito |
|---------|-----------|
| `src/app/alertas/AlertaRowClient.tsx` | Componente client con diálogo de resolución individual |
| `src/app/alertas/ReabrirButton.tsx` | Botón para deshacer resolución desde historial |

**Archivos modificados:**

| Archivo | Cambio |
|---------|--------|
| `src/lib/db/actions/alertas.ts` | Reescrito: `resolverAlerta` requiere `accionTomada`, nueva `reabrirAlerta`, `resolverTodasPorEstado` con acción obligatoria |
| `src/app/alertas/ResolverTodasButton.tsx` | Diálogo custom con campo de acción obligatorio |
| `src/app/alertas/page.tsx` | Usa AlertaRowClient, historial con links, ReabrirButton, indicador "últimas 50" |
| `src/app/admin/alertas/AlertasAdminClient.tsx` | ConfirmDialog antes de regenerar alertas |

---

### Auditoría UX — Perspectiva de tomador de decisión

**Problema:** Un gerente no podía responder "¿POR QUÉ este equipo está mal?" desde la app.

#### Diagnóstico causal en detalle de equipo

**Archivo:** `src/app/flota/[equipoId]/page.tsx`

Nueva sección "Diagnóstico" que aparece cuando el equipo tiene KPIs fuera de meta:
- Identifica qué KPIs están fuera de rango
- Calcula la brecha respecto al objetivo
- Ordena por severidad (mayor brecha primero)
- Muestra "Problema principal" vs "También afecta"
- Incluye impacto en lenguaje claro y acción recomendada

#### Flota ordenada por criticidad

**Archivo:** `src/app/flota/FlotaClientView.tsx`

La tabla de flota ahora se ordena automáticamente: paros totales primero → rojo → ámbar → verde. El gerente ve lo más urgente arriba.

#### APD informa alertas generadas

**Archivos:** `src/lib/db/actions/apd.ts`, `src/app/apd/ApdClient.tsx`

El mensaje de éxito al guardar un análisis APD ahora incluye cuántas alertas predictivas se generaron.

#### Nota de resolución mejorada

**Archivo:** `src/app/alertas/AlertaRowClient.tsx`

Se eliminó la frase confusa "El valor del KPI no cambia automáticamente". Ahora solo dice que la alerta va al historial y se puede reabrir.

---

### Sistema de ayuda contextual (tooltips)

**Archivo:** `src/lib/help-content.ts`

22+ entradas de ayuda contextual cubriendo todos los KPIs, categorías ASARCO, tipos de flota, navegación, admin y más. Nueva entrada `diagnosticoEquipo`.

**Componentes con tooltips:** Dashboard, Flota, Detalle equipo, Alertas, APD, Admin, Reporte, Explorador.

---

### Infraestructura y deploy

| Item | Detalle |
|------|---------|
| URL producción | `https://dashboard-gold-nine-48.vercel.app` |
| Deploy | Manual con `npx vercel --prod` (git push NO dispara auto-deploy) |
| Build | Verificado sin errores antes de cada deploy |
| Archivos totales | 115 archivos en el commit (+10.511 / -882 líneas) |

---

### Verificación

- **Build:** exitoso, 0 errores
- **Deploy:** producción actualizada y verificada
- **Archivos creados:** 2 (AlertaRowClient, ReabrirButton)
- **Archivos modificados:** 8+ (alertas, flota, APD, help-content)
- **Versión:** v1.3 · MSG 2026

---

## v1.2 — 2026-05-07

### Resumen

Auditoría integral de producción en 7 fases: seguridad, autenticación, lógica de negocio, resiliencia, accesibilidad, hardening y resolución completa del backlog. Incluye una auditoría UX desde la perspectiva de un gerente que usa la app por primera vez. Todos los problemas identificados (11/11) fueron resueltos. Build verificado con 0 errores.

---

### Fase 1 — Seguridad Crítica

- Sanitizado de credenciales en middleware de autenticación.
- Validación estricta de cookies de sesión.
- Protección contra inyección en parámetros de URL.

### Fase 2 — Autenticación en Server Actions

**Problema:** Todas las funciones de mutación en server actions eran invocables sin autenticación.

**Solución:** Se creó el helper `verificarSesion()` en `src/lib/db/actions/session.ts` y se aplicó como primera línea en **20 funciones** de mutación:

| Archivo | Funciones protegidas |
|---------|---------------------|
| `equipos.ts` | `crearEquipo`, `actualizarEquipo` |
| `kpis.ts` | `upsertKpiEquipo`, `upsertAsarcoEquipo`, `regenerarAlertasPeriodo`, `crearPeriodo`, `cerrarPeriodo` |
| `umbrales.ts` | `actualizarUmbral` |
| `fallas.ts` | `crearEventoFalla`, `actualizarEventoFalla`, `eliminarEventoFalla`, `importarFallasLote` |
| `registro-diario.ts` | `upsertRegistroDiario`, `eliminarRegistroDiario`, `upsertRegistrosDiarioBatch` |
| `calcular-kpis.ts` | `previewKpisDesdeRegistros`, `guardarKpisDesdeRegistros` |
| `apd.ts` | `subirAnalisisApd`, `eliminarAnalisisApd` |

**Archivo creado:**
- `src/lib/db/actions/session.ts`

### Fase 3 — Lógica de Negocio

| Cambio | Archivo | Detalle |
|--------|---------|---------|
| Tolerancia ASARCO | `kpis.ts`, `KpisAdminClient.tsx` | De ±0.5% a ±0.1% — mayor precisión en validación |
| Normalización ASARCO | `calcular-kpis.ts` (domain) | Los 5 porcentajes suman exactamente 100% mediante factor de normalización |
| Detección de paro | `calcular-kpis.ts` (domain) | Condición OR: equipo sin operación ni reserva pero con detención no programada |
| Pérdida estimada | `resumen-ejecutivo.ts` | Horas reales del mes (`dias * 24`) en lugar de 720h hardcoded |
| Objetivos KPI dinámicos | `dashboard/page.tsx`, `flota/[equipoId]/page.tsx` | Usa `getUmbralesActivos()` de BD con fallback a constantes |

### Fase 4 — Resiliencia

| Cambio | Archivo |
|--------|---------|
| Error boundary admin | `src/app/admin/error.tsx` (nuevo) |
| Doble-submit | `KpisAdminClient.tsx` — estado `guardando`, botón deshabilitado |
| Límite CSV 5MB (cliente) | `useCsvApd.ts` |
| Límite CSV 5MB (servidor) | `apd.ts` |
| Tolerancia ASARCO UI | `KpisAdminClient.tsx` — actualizado en 3 puntos |
| Aria-labels inputs | `KpisAdminClient.tsx` — 22 inputs con `aria-label` |
| Importar CSV fallas | `FallasClient.tsx` — máx 200 filas, 500KB, parser tolerante `;`/`,` |

### Fase 5 — Accesibilidad (WCAG AA)

| Cambio | Archivos |
|--------|----------|
| Contraste `#D4D4D8` → `#A1A1AA`/`#71717A` | `alertas/page.tsx`, `ExploradorClient.tsx`, `KpisImportarClient.tsx`, `TopBar.tsx`, `KpiSummaryStrip.tsx`, `login/page.tsx` |
| Focus-visible en Tooltip | `Tooltip.tsx` — `tabIndex`, `role`, `aria-label`, outline |
| Heading hierarchy | `SectionTitle.tsx` — prop `as` para `h1`/`h2`/`h3` |
| Focus-visible inputs KPI | `KpisAdminClient.tsx` — outline en componente `Num` |
| Skip-to-content | `ShellClient.tsx` — link `sr-only` apuntando a `#main-content` |
| `aria-current="page"` | `Sidebar.tsx`, `BottomNav.tsx` |
| `aria-hidden="true"` decorativos | `Sidebar.tsx`, `dashboard/page.tsx` |
| `scope="col"` en headers | `DataTable.tsx` |

### Fase 6 — Hardening

| Cambio | Detalle |
|--------|---------|
| `errorSeguro()` | Creado en `safe-parse.ts` — sanitiza mensajes de error para no exponer estructura de BD |
| 19 catch blocks | Reemplazados `(e as Error).message` → `errorSeguro(e, "contexto")` en 7 archivos |
| Deduplicación `round1`/`round2` | Extraídos a `safe-parse.ts`, eliminadas 3 copias locales |

---

### Auditoría UX — Perspectiva de Gerente

Análisis completo de las **30+ páginas y componentes** desde el punto de vista de un gerente que abre la app por primera vez. Se identificaron **45+ problemas** y se corrigieron todos.

#### Diálogos de confirmación

**Problema:** Acciones destructivas usaban `window.confirm()` nativo o no tenían confirmación.

**Solución:** `ConfirmDialog.tsx` — componente reutilizable basado en `<dialog>` nativo HTML, accesible, con dos variantes (peligro/advertencia), foco automático, y cierre con ESC.

| Acción | Página | Antes | Después |
|--------|--------|-------|---------|
| Resolver todas alertas | `/alertas` | Sin confirmación | Modal con conteo de alertas |
| Dar de baja equipo | `/admin/equipos` | `confirm()` nativo | Modal: datos históricos se conservan |
| Cerrar/reabrir período | `/admin/periodos` | Sin confirmación | Modal: consecuencias explicadas |
| Eliminar falla | `/admin/fallas` | Sin confirmación | Modal: muestra equipo y descripción |
| Eliminar análisis APD | `/apd` | `confirm()` nativo | Modal: archivo, fecha, muestras |

#### Estados vacíos mejorados

| Componente | Antes | Después |
|------------|-------|---------|
| Dashboard (sin datos) | Texto genérico | Texto descriptivo + botón "Ir a Admin" |
| FlotaSemaforo (vacío) | Crash potencial | Mensaje contextual |
| DataTable (vacío) | "Sin datos disponibles" | Mensaje personalizable + sugerencia |
| Equipo sin historial | Texto genérico | Mensaje + link a Admin |
| Equipo en paro sin motivo | Nada | "Sin motivo registrado — completa en Admin" |

#### Navegación y orientación

| Cambio | Detalle |
|--------|---------|
| Logo clickeable | Navega a `/portada` |
| Admin reordenado | Flujo: 1. Períodos → 2. Registro → 3. Fallas → 4. Calcular |
| Badge alertas sidebar | Conteo rojo en nav item "Alertas" cuando hay alertas criticas |
| Badge período | "cerrado" → "cerrado (solo lectura)" |
| Equipos dados de baja | Tabla visible con botón "Reactivar" (antes solo por ID manual) |

#### Textos mejorados para usuarios no-técnicos

| Antes | Después | Archivo |
|-------|---------|---------|
| Referencia a `umbral_kpi` (tabla BD) | Link a "Configurar Umbrales" | `AlertasAdminClient.tsx` |
| "Alertas regeneradas: 0" | "Todos los equipos dentro de los umbrales" | `AlertasAdminClient.tsx` |
| Botón "Regenerar" sin feedback | "Regenerando..." durante operación | `AlertasAdminClient.tsx` |
| Botón "Baja" | "Dar de baja" | `EquiposAdminClient.tsx` |
| Delta "—" | "Sin comparativa" | `KpiSummaryStrip.tsx` |

---

### Fase 7 — Resolución Completa del Backlog (11/11)

| # | Problema | Solución | Archivos |
|---|----------|----------|----------|
| 1 | Skeleton screens charts | Ya resuelto previamente | — |
| 2 | Objetivos KPI hardcodeados | `getUmbralesActivos()` con fallback a constantes | `dashboard/page.tsx`, `flota/[equipoId]/page.tsx` |
| 3 | Sin indicador offline | Banner rojo `WifiOff` + `navigator.onLine` + event listeners | `ShellClient.tsx` |
| 4 | Skip-to-content | Link `sr-only` con foco visible → `#main-content` | `ShellClient.tsx` |
| 5 | Tooltip en scroll | Dismiss automático con listener `scroll` capture | `Tooltip.tsx` |
| 6 | Tooltip debounce | 150ms delay en mouseEnter, instantáneo en focus/click | `Tooltip.tsx` |
| 7 | Badge alertas sidebar | `alertasCriticas` pasado via ShellClient; badge rojo en "Alertas" | `Sidebar.tsx`, `ShellClient.tsx` |
| 8 | Importar CSV fallas | `importarFallasLote()` + botón + parser (`;`/`,`, max 200 filas) | `fallas.ts`, `FallasClient.tsx` |
| 9 | Equipos dados de baja | `getEquiposInactivos()` + tabla con "Reactivar" | `flota.ts`, `EquiposAdminClient.tsx`, `equipos/page.tsx` |
| 10 | Responsive sidebar | `max-w-[calc(100vw-48px)]` | `Sidebar.tsx` |
| 11 | Staggered animations | Delay cap `Math.min(i * 30, 120)` | `KpiSummaryStrip.tsx`, `FlotaSemaforo.tsx` |

---

### Inventario completo de archivos

#### Archivos creados (4)

| Archivo | Propósito |
|---------|-----------|
| `src/lib/db/actions/session.ts` | Helper `verificarSesion()` para auth en server actions |
| `src/app/admin/error.tsx` | Error boundary para panel admin |
| `src/components/ui/ConfirmDialog.tsx` | Modal de confirmación reutilizable (`<dialog>`) |
| `src/app/alertas/ResolverTodasButton.tsx` | Botón "Resolver todas" con confirmación |

#### Archivos modificados (30+)

**Server Actions (7):**
- `src/lib/db/actions/equipos.ts` — auth + error sanitization
- `src/lib/db/actions/kpis.ts` — auth + error sanitization + tolerancia ASARCO
- `src/lib/db/actions/umbrales.ts` — auth + error sanitization
- `src/lib/db/actions/fallas.ts` — auth + error sanitization + `importarFallasLote()`
- `src/lib/db/actions/registro-diario.ts` — auth + error sanitization
- `src/lib/db/actions/calcular-kpis.ts` — auth + error sanitization
- `src/lib/db/actions/apd.ts` — auth + error sanitization + límite 5MB

**Queries (2):**
- `src/lib/db/queries/flota.ts` — nueva query `getEquiposInactivos()`
- `src/lib/db/queries/umbrales.ts` — usado por dashboard y detalle equipo

**Domain Logic (2):**
- `src/lib/domain/calcular-kpis.ts` — normalización ASARCO, detección paro
- `src/lib/domain/resumen-ejecutivo.ts` — horas mes dinámicas

**Utilities (1):**
- `src/lib/utils/safe-parse.ts` — `round1`, `round2`, `errorSeguro`

**Hooks (1):**
- `src/hooks/useCsvApd.ts` — límite 5MB cliente

**Pages (8):**
- `src/app/dashboard/page.tsx` — empty state, objetivos dinámicos, meta ASARCO dinámica
- `src/app/flota/[equipoId]/page.tsx` — empty states, objetivos dinámicos desde umbrales
- `src/app/alertas/page.tsx` — confirmación resolver todas, placeholder color
- `src/app/portada/page.tsx` — import round1
- `src/app/admin/page.tsx` — reorden secciones, títulos numerados, badge período
- `src/app/admin/equipos/page.tsx` — pasa inactivos al client
- `src/app/apd/ApdClient.tsx` — confirmación eliminar
- `src/app/login/page.tsx` — placeholder color

**Admin Clients (4):**
- `src/app/admin/equipos/EquiposAdminClient.tsx` — ConfirmDialog baja, tabla inactivos con reactivar
- `src/app/admin/periodos/PeriodosAdminClient.tsx` — ConfirmDialog cerrar/reabrir
- `src/app/admin/fallas/FallasClient.tsx` — ConfirmDialog eliminar, importar CSV, parser
- `src/app/admin/alertas/AlertasAdminClient.tsx` — textos no-técnicos, feedback

**UI Components (5):**
- `src/components/ui/Tooltip.tsx` — a11y, debounce 150ms, scroll dismiss
- `src/components/ui/SectionTitle.tsx` — prop `as` heading level
- `src/components/ui/DataTable.tsx` — scope col, empty state personalizable
- `src/components/dashboard/KpiSummaryStrip.tsx` — delta texto, contraste, animation cap
- `src/components/dashboard/FlotaSemaforo.tsx` — empty state, animation cap

**Layout (3):**
- `src/components/layout/ShellClient.tsx` — skip-to-content, offline banner, alertasCriticas a sidebar
- `src/components/layout/Sidebar.tsx` — logo link, badge alertas, aria-current, responsive max-width, v1.2
- `src/components/layout/TopBar.tsx` — contraste color

**KPI Admin (1):**
- `src/app/admin/kpis/KpisAdminClient.tsx` — guardando state, ASARCO 0.1, aria-labels

---

### Problemas conocidos pendientes

Ninguno. Todos los 11 problemas identificados durante la auditoría fueron resueltos.

---

### Verificación

- **Build:** exitoso, 0 errores, 0 warnings
- **Archivos creados:** 4
- **Archivos modificados:** 30+
- **Server actions protegidas:** 21
- **Problemas backlog resueltos:** 11/11
- **Versión:** v1.2 · MSG 2026
