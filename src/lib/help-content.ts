export interface HelpItem {
  titulo: string;
  que_es: string;
  como_funciona?: string;
  origen?: string;
  ejemplo: string;
  meta?: string;
}

export const HELP: Record<string, HelpItem> = {
  dfm: {
    titulo: "DFM — Disponibilidad Física Mecánica",
    que_es: "Porcentaje del tiempo en que el equipo está mecánicamente listo para operar, sin importar si hay trabajo disponible.",
    como_funciona: "Fórmula: (Horas disponibles ÷ Horas totales del período) × 100. Incluye tiempo en operación + tiempo en reserva.",
    origen: "Estándar minero ASARCO. Es el indicador principal de confiabilidad mecánica de una flota.",
    ejemplo: "DFM 88% → De 100 horas, el equipo estuvo disponible 88h. Solo 12h estuvo en reparación o mantención.",
    meta: "≥ 85% = Verde · 75–85% = Ámbar · < 75% = Rojo",
  },
  tmef: {
    titulo: "TMEF — Tiempo Medio Entre Fallas",
    que_es: "Promedio de horas que opera un equipo sin sufrir ninguna falla. A mayor TMEF, más confiable es el equipo.",
    como_funciona: "Fórmula: Horas totales operadas ÷ Número de fallas ocurridas en el período.",
    origen: "Indicador RAMS (Reliability, Availability, Maintainability, Safety). También llamado MTBF en inglés.",
    ejemplo: "TMEF 81h → El equipo falla en promedio cada 81 horas de operación. Un TMEF de 120h sería excelente.",
    meta: "≥ 80h = Verde · 50–80h = Ámbar · < 50h = Rojo",
  },
  tmpr: {
    titulo: "TMPR — Tiempo Medio de Parada por Reparación",
    que_es: "Promedio de horas que dura cada reparación, desde que el equipo falla hasta que vuelve a operar. Mide la eficiencia del taller.",
    como_funciona: "Fórmula: Total horas de parada por reparación ÷ Número de fallas. También llamado MTTR (Mean Time To Repair).",
    origen: "Indicador RAMS de mantenibilidad. Refleja la capacidad de respuesta del equipo de mantención.",
    ejemplo: "TMPR 4.3h → Cuando el equipo falla, tarda en promedio 4.3 horas en ser reparado y volver a operar. Cuanto menor, mejor.",
    meta: "≤ 5h = Verde · 5–15h = Ámbar · > 15h = Rojo (invertido: menor es mejor)",
  },
  tiempoOperativo: {
    titulo: "Tiempo Operativo",
    que_es: "Porcentaje del turno de trabajo en que el equipo estuvo activamente produciendo: moviendo tierra, transportando mineral o cargando.",
    como_funciona: "Fórmula: (Horas en producción activa ÷ Horas totales del turno) × 100. No incluye esperas ni traslados.",
    origen: "Registro de planilla operacional diaria, clasificado según metodología ASARCO.",
    ejemplo: "T.Op. 73% → De un turno de 12 horas, el equipo produjo 8.8h activas. Las otras 3.2h estuvo en espera, colas o traslados.",
    meta: "≥ 80% = Verde · 65–80% = Ámbar · < 65% = Rojo",
  },
  reserva: {
    titulo: "Reserva",
    que_es: "Porcentaje del turno en que el equipo estaba disponible mecánicamente, pero no se le asignó trabajo de producción (exceso de equipos).",
    como_funciona: "Ocurre cuando hay más equipos disponibles que frentes de trabajo activos. Alta reserva = ineficiencia operacional.",
    origen: "Estado ASARCO de tiempo en espera planificada. Indica sobre-dotación de flota o falta de frentes de trabajo.",
    ejemplo: "Reserva 16% → De 12h de turno, el equipo estuvo 2h sin asignación de trabajo. Esto es costoso e ineficiente.",
    meta: "≤ 8% = Verde · 8–20% = Ámbar · > 20% = Rojo (invertido: menor es mejor)",
  },
  semaforo: {
    titulo: "Semáforo de Estado",
    que_es: "Indicador visual del estado general del equipo según sus KPIs clave.",
    como_funciona: "Verde = todos los KPIs en rango óptimo. Ámbar = uno o más KPIs en advertencia. Rojo = uno o más KPIs en estado crítico. Paro = equipo completamente detenido.",
    ejemplo: "Un camión puede tener DFM verde (88%) pero TMPR rojo (20h), resultando en semáforo rojo general.",
  },
  paroTotal: {
    titulo: "Paro Total",
    que_es: "El equipo está completamente detenido por una falla mayor y no puede operar bajo ninguna condición.",
    como_funciona: "Puede ser por: falla de motor, sistema hidráulico crítico, daño estructural, accidente o decisión de seguridad.",
    ejemplo: "CE-04 en Paro Total por bomba hidráulica HPN-2847. El equipo no puede moverse ni producir hasta completar la reparación.",
    meta: "Objetivo operacional: 0 equipos en paro total",
  },
  criticos: {
    titulo: "Equipos Críticos",
    que_es: "Equipos que SÍ operan pero tienen uno o más KPIs en estado rojo, es decir, fuera del umbral crítico.",
    como_funciona: "Un equipo es crítico si: DFM < 75%, TMEF < 50h, TMPR > 15h, T.Op. < 65% o Reserva > 20%.",
    ejemplo: "CE-01 con DFM 73% es crítico: está operando pero su disponibilidad está bajo el mínimo aceptable de 75%.",
    meta: "Objetivo: 0 equipos críticos",
  },
  alertasActivas: {
    titulo: "Alertas Activas",
    que_es: "Total de alertas generadas cuando algún KPI de algún equipo cruza un umbral de advertencia (ámbar) o crítico (rojo).",
    como_funciona: "El sistema genera una alerta por cada KPI en estado ámbar o rojo de cada equipo. Un equipo puede tener múltiples alertas simultáneas.",
    ejemplo: "86 alertas: si el equipo CE-01 tiene DFM en rojo y TMPR en ámbar, genera 2 alertas. Con 28 equipos se acumulan rápido.",
  },
  asarcoOperativo: {
    titulo: "Operativo — ASARCO",
    que_es: "Horas en que el equipo estuvo activamente produciendo durante el período.",
    como_funciona: "Primera y más importante categoría ASARCO. Representa la producción real efectiva.",
    origen: "Sistema de clasificación ASARCO (American Smelting and Refining Company), estándar mundial en minería.",
    ejemplo: "70% Operativo → De 100h del período, el equipo produjo 70h efectivas de acarreo o carguío.",
  },
  asarcoReserva: {
    titulo: "Reserva — ASARCO",
    que_es: "Horas en que el equipo estaba en buen estado mecánico pero sin asignación de trabajo de producción.",
    origen: "Segunda categoría ASARCO. Indica sobre-dotación de flota o falta de frentes de trabajo disponibles.",
    ejemplo: "8% Reserva → 8h de 100h el equipo estuvo disponible mecánicamente pero esperando asignación del operaciones.",
  },
  asarcoDetProg: {
    titulo: "Detención Programada — ASARCO",
    que_es: "Horas de parada planificadas con anticipación: mantención preventiva, cambio de aceite, cambio de neumáticos, inspecciones periódicas.",
    origen: "Tercera categoría ASARCO. Una mantención planificada evita fallas inesperadas y es mucho menos costosa.",
    ejemplo: "8% Detención Programada → 8h de 100h el equipo estuvo en mantención preventiva según plan. Esto es positivo.",
  },
  asarcoDetNoProg: {
    titulo: "Detención No Programada — ASARCO",
    que_es: "Horas de parada por fallas o averías inesperadas que no pudieron anticiparse con el plan de mantención.",
    origen: "Cuarta categoría ASARCO. Es el indicador más negativo para la disponibilidad y tiene mayor costo.",
    ejemplo: "7% Detención No Prog. → 7h de 100h el equipo estuvo parado por fallas inesperadas. Esto impacta directamente el DFM.",
  },
  asarcoPerdida: {
    titulo: "Pérdida Operacional — ASARCO",
    que_es: "Horas perdidas por factores EXTERNOS al equipo y al taller: clima adverso, tronaduras, falta de material, cortes de energía.",
    origen: "Quinta categoría ASARCO. No es responsabilidad del mantenimiento ni del operador.",
    ejemplo: "2% Pérdida → 2h de 100h el equipo estuvo detenido por tronadura programada, lluvia intensa o corte de suministro.",
  },
  tendencia6Meses: {
    titulo: "Tendencia de KPIs — 6 Meses",
    que_es: "Gráfico de evolución histórica de los KPIs principales durante los últimos 6 meses para detectar deterioro o mejora.",
    como_funciona: "Las líneas de referencia punteadas muestran los umbrales verde y ámbar. Cuando la curva cae bajo estas líneas, el KPI entra en alerta.",
    ejemplo: "Si el DFM bajó de 85% a 73% en 3 meses, es señal de deterioro acelerado. Hay que actuar antes de llegar a cero.",
  },
  distribucionAsarco: {
    titulo: "Distribución de Tiempo ASARCO",
    que_es: "Gráfico de barras que muestra cómo se distribuyó el 100% del tiempo de cada tipo de flota según las 5 categorías ASARCO.",
    como_funciona: "Las 5 categorías siempre suman 100%. Más verde (operativo) y menos rojo (det. no programada) es mejor.",
    origen: "Sistema de clasificación ASARCO, estándar en minería a cielo abierto desde los años 70.",
    ejemplo: "Flota 785D con 70% operativo y solo 5% detención no programada indica excelente gestión de mantención.",
  },
  navDashboard: {
    titulo: "Dashboard — Vista General",
    que_es: "Pantalla principal del sistema. Muestra el estado de salud de toda la flota en tiempo real: KPIs promedio, semáforos y alertas.",
    ejemplo: "Si el semáforo de la flota 777F está en rojo, el jefe de mantención sabe que debe priorizar esa flota inmediatamente.",
  },
  navFlota: {
    titulo: "Flota — Detalle de Equipos",
    que_es: "Tabla completa con los 28 equipos de la faena, sus KPIs individuales, estado de semáforo y detalle por equipo.",
    ejemplo: "Filtra por '777F' para ver solo los camiones de ese modelo. Haz clic en una fila para ver el detalle completo del equipo.",
  },
  navAlertas: {
    titulo: "Alertas — Panel de Criticidad",
    que_es: "Lista de todas las alertas activas agrupadas por nivel: Paro Total, Crítico y Advertencia. Permite priorizar acciones.",
    ejemplo: "Alerta CE-01: DFM 72% cuando el umbral es 75%. Significa que ese camión requiere atención inmediata.",
  },
  navApd: {
    titulo: "APD Aceites — Análisis Predictivo",
    que_es: "Módulo de Análisis Predictivo por Aceites. Sube resultados de laboratorio de aceites para detectar problemas de desgaste antes de que ocurra una falla.",
    como_funciona: "Se sube un CSV con los resultados del laboratorio. El sistema detecta parámetros fuera de rango y alerta de desgaste incipiente.",
    origen: "Técnica de mantenimiento predictivo estándar en minería. Un nivel de Fe (hierro) alto en el aceite indica desgaste interno del motor.",
    ejemplo: "Fe > 30 ppm en el aceite del motor indica desgaste interno. El APD lo detecta semanas antes de que sea una falla visible.",
  },
  navReporte: {
    titulo: "Reporte — Informe Mensual",
    que_es: "Genera el informe mensual de mantención con todos los KPIs, equipos críticos y tendencias. Exportable como PDF.",
    ejemplo: "Selecciona 'Abril 2025' y haz clic en 'Imprimir / PDF'. En el diálogo del navegador elige 'Guardar como PDF' para obtener el documento.",
  },
  navExplorador: {
    titulo: "Explorador de Datos — Vista Planilla",
    que_es: "Vista interactiva tipo planilla de todos los datos del sistema: KPIs, registros diarios y fallas. Reemplaza la necesidad de abrir Excel para análisis ad-hoc.",
    como_funciona: "Muestra todos los datos en tablas ordenables. Haz clic en cualquier encabezado de columna para ordenar. Usa los filtros para acotar por período, tipo de flota o componente. El buscador filtra por ID de equipo.",
    ejemplo: "Filtra por flota '785D' y ordena por DFM descendente para ver qué camiones tienen peor disponibilidad. Exporta el resultado a Excel con un clic.",
  },
  navDocs: {
    titulo: "Documentación Técnica",
    que_es: "Modelo de base de datos y arquitectura del sistema. Incluye diagramas ER interactivos con zoom, pantalla completa y exportación.",
    ejemplo: "Navega por las entidades del modelo haciendo clic en cada una. Usa los botones de zoom para explorar secciones específicas del diagrama.",
  },
  estadoFlota: {
    titulo: "Estado por Flota",
    que_es: "Resumen visual del estado de salud de cada tipo de equipo. Muestra los KPIs principales y cuántos equipos están en paro.",
    como_funciona: "El color del borde izquierdo indica el estado general: verde = OK, ámbar = advertencia, rojo = crítico.",
    ejemplo: "Si la tarjeta 777F tiene borde rojo y DFM 73%, significa que ese modelo de camión está bajo el umbral crítico.",
  },
  alertasPrioritarias: {
    titulo: "Alertas Prioritarias",
    que_es: "Los 5 equipos con la situación más crítica en este momento, mostrados en orden de urgencia.",
    como_funciona: "Primero aparecen los paros totales, luego los equipos con KPIs en rojo, finalmente los que están en ámbar.",
    ejemplo: "CE-04 aparece primero porque está en paro total. CE-01 aparece segundo porque su DFM está en 72% (estado rojo).",
  },
  apdParametro: {
    titulo: "Parámetro APD",
    que_es: "Elemento químico o propiedad física analizada en la muestra de aceite. Cada uno indica un tipo específico de desgaste.",
    ejemplo: "Fe (hierro) indica desgaste de piezas ferrosas del motor. Cu (cobre) indica desgaste de cojinetes de bronce. Al (aluminio) indica desgaste de pistones.",
  },
  apdValor: {
    titulo: "Valor Medido",
    que_es: "Concentración del parámetro en la muestra de aceite, expresado en partes por millón (ppm) u otras unidades.",
    ejemplo: "Fe = 45 ppm significa 45 partes de hierro por millón de partes de aceite. Si el máximo es 30 ppm, está fuera de rango.",
  },
  apdLimite: {
    titulo: "Límite de Alerta",
    que_es: "Valor máximo o mínimo aceptable definido por el fabricante o el departamento de mantenimiento. Superarlo indica problema.",
    ejemplo: "LimMax Fe = 30 ppm. Si el análisis da 45 ppm, el sistema marca ese parámetro en rojo y genera una alerta de desgaste.",
  },
  equipoHoras: {
    titulo: "Horas Acumuladas",
    que_es: "Total de horas que el equipo ha operado desde su fabricación o desde el último cambio de motor, según el horómetro.",
    ejemplo: "12.500 h → El equipo ha trabajado 12.500 horas. Equipos CAT 785D con más de 25.000h suelen requerir overhaul de motor.",
    origen: "Lectura del horómetro (contador de horas de operación) del equipo.",
  },
  periodoReporte: {
    titulo: "Período del Informe",
    que_es: "Selecciona el mes y año para el cual generar el informe mensual de KPIs.",
    ejemplo: "Selecciona 'Abril 2025' para generar el informe del mes de abril con todos sus indicadores promedio.",
  },
  columnaId: {
    titulo: "ID del Equipo",
    que_es: "Código identificador único del equipo en la faena. El prefijo indica el tipo: CE = Camión de Extracción, CH = Camión de Hormigón, CG = Cargador, EX = Excavadora.",
    ejemplo: "CE-04 → 'CE' = Camión de Extracción, '04' = número de unidad. Este código aparece en todos los informes y órdenes de trabajo.",
  },
  columnaAnio: {
    titulo: "Año de Fabricación",
    que_es: "Año en que fue fabricado el equipo. A mayor antigüedad y horas acumuladas, mayor es el costo de mantención.",
    ejemplo: "Año 2015 → Equipo de 10 años. Los equipos CAT tienen vida útil de 15–20 años con mantención adecuada.",
  },

  // ─── Portada y dashboard ────────────────────────────────────────────────────
  navPortada: {
    titulo: "Portada — Centro de Comando",
    que_es: "Pantalla de bienvenida operativa. Muestra el estado general de la flota en un vistazo, la acción recomendada según la situación actual y las guías de procedimiento.",
    como_funciona: "Los indicadores superiores (paros, críticos, advertencias) se calculan en tiempo real desde la BD. La acción recomendada cambia automáticamente según el estado de la flota.",
    ejemplo: "Si hay 2 equipos en paro, la portada recomienda ir directamente al Panel de Alertas. Si todo está bien, sugiere consultar el Dashboard.",
  },
  flotaVistazo: {
    titulo: "Flota en un Vistazo",
    que_es: "Resumen de las 4 métricas operacionales más importantes de la flota, calculadas en tiempo real desde la base de datos.",
    como_funciona: "Equipos registrados = total en BD. Operando = sin paro total. DFM flota = promedio de equipos activos (excluye paros). Alertas = KPIs fuera de umbral.",
    ejemplo: "28 equipos, 25 operando, DFM 83% y 12 alertas indica una flota en estado aceptable pero con puntos de atención.",
  },
  totalEquipos: {
    titulo: "Total de Equipos",
    que_es: "Cantidad de equipos registrados en la base de datos para la faena El Salvador. Incluye todos los tipos de flota.",
    ejemplo: "28 equipos: 8 camiones 785D, 10 camiones 777F, 6 cargadores 992 y 4 excavadoras PC-2000.",
  },
  kpiStripFlota: {
    titulo: "KPIs Promedio de Flota Activa",
    que_es: "Indicadores clave de rendimiento calculados como promedio de todos los equipos que NO están en paro total. Cada tarjeta muestra el valor, la meta, la barra de progreso y la variación respecto al período anterior.",
    como_funciona: "Los equipos en paro total (DFM=0) se excluyen del promedio para no distorsionar los indicadores de la flota operativa. Las flechas de variación comparan el período actual con el inmediato anterior.",
    ejemplo: "DFM Flota 83% con meta 85% y delta +2.0%: la flota mejoró 2 puntos respecto al mes anterior pero aún está bajo el objetivo.",
    meta: "Las metas por KPI son: DFM ≥85%, TMEF ≥80h, TMPR ≤5h, T.Op. ≥80%, Reserva ≤8%",
  },
  periodoSelector: {
    titulo: "Selector de Período",
    que_es: "Permite consultar los datos de cualquier período histórico. El período marcado como '(actual)' es el más reciente que no ha sido cerrado.",
    como_funciona: "Al cambiar de período, el dashboard recalcula todos los KPIs, semáforos y alertas con los datos de ese mes. Los deltas comparan el período seleccionado con su antecesor.",
    ejemplo: "Seleccionar 'Marzo 2025' muestra los KPIs de ese mes. El delta compara Marzo vs Febrero, no vs el período actual.",
  },
  diagnosticoEquipo: {
    titulo: "Diagnóstico del Equipo",
    que_es: "Análisis causal que identifica qué KPIs están fuera de meta y ordena los problemas por severidad (mayor brecha primero).",
    como_funciona: "Compara cada KPI del equipo contra su objetivo. Si está fuera de meta, calcula la brecha y sugiere una acción concreta. El problema con mayor desviación aparece primero como 'Problema principal'.",
    ejemplo: "CE-04 con DFM 68% (meta 85%) y TMPR 12h (meta 5h): el diagnóstico muestra DFM como problema principal (brecha 17 puntos) y TMPR como factor secundario (brecha 7h).",
  },
  comparativaObjetivos: {
    titulo: "Comparativa con Objetivos",
    que_es: "Barras de progreso que muestran qué tan cerca o lejos está cada KPI del equipo respecto al objetivo definido.",
    como_funciona: "Para KPIs normales (DFM, TMEF, T.Op.), la barra llena al 100% cuando alcanza la meta. Para KPIs invertidos (TMPR, Reserva), la barra llena al 100% cuando el valor es igual o mejor que la meta.",
    ejemplo: "DFM 88% con objetivo 85% → barra al 100% (superó la meta). TMPR 8h con objetivo 5h → barra al 62% (aún lejos del objetivo).",
  },
  historicoEquipo: {
    titulo: "Historial de KPIs del Equipo",
    que_es: "Gráfico de evolución de todos los KPIs registrados para este equipo a lo largo del tiempo. Incluye todos los períodos cargados.",
    como_funciona: "Cada punto es el valor del KPI en un período mensual. Las líneas de referencia punteadas marcan los umbrales verde y ámbar.",
    ejemplo: "Si el DFM del equipo CE-01 baja de 90% a 72% en 4 meses, el gráfico muestra la tendencia descendente claramente. Es una señal de deterioro que requiere intervención.",
  },

  // ─── Admin / carga de datos ────────────────────────────────────────────────
  navAdmin: {
    titulo: "Administración — Carga de Datos",
    que_es: "Panel de carga manual de datos. Reemplaza a las planillas Excel: el supervisor ingresa KPIs mensuales, gestiona la flota y crea períodos directamente desde la web.",
    como_funciona: "Cada operación se guarda inmediatamente en la base de datos PostgreSQL de Supabase. El dashboard se actualiza automáticamente tras cada cambio.",
    ejemplo: "Al cierre del mes, el supervisor entra a /admin/kpis, selecciona Abril 2025, llena los DFM/TMEF/TMPR de cada equipo y hace clic en 'Guardar todo'. Listo: el dashboard refleja el mes nuevo.",
  },
  adminKpis: {
    titulo: "Cargar KPIs Mensuales",
    que_es: "Tabla editable con los 28 equipos y sus KPIs (DFM, TMEF, TMPR, T.Op, Reserva) más la distribución ASARCO (5 segmentos que suman 100%) para el período seleccionado.",
    como_funciona: "Edita cada celda directamente. El botón ✓ por fila guarda solo ese equipo. 'Guardar todo' itera por las 28 filas. La columna Σ valida que los 5 segmentos ASARCO sumen 100±0.5%.",
    ejemplo: "Cambias el DFM de CE-01 de 73 a 78, presionas ✓ y la BD se actualiza. El dashboard ya muestra el dato nuevo en su próxima carga.",
    meta: "Validaciones: DFM/T.Op/Reserva entre 0–100, TMEF/TMPR ≥ 0, suma ASARCO = 100±0.5",
  },
  adminEquipos: {
    titulo: "Gestionar Flota",
    que_es: "CRUD básico de equipos: agregar uno nuevo, editar metadatos (modelo, año, tipo) o dar de baja sin perder histórico (queda enServicio=false).",
    como_funciona: "El ID debe seguir el patrón [LL]-[##] (ej: CH-09, CE-13). Tipo de flota se elige entre 785D, 777F, 992, PC2000. Los equipos dados de baja conservan su histórico de KPIs.",
    ejemplo: "Llega un camión nuevo a la mina: /admin/equipos → Nuevo → ID=CH-09, Tipo=785D, Modelo='CAT 785D', Año=2024 → Crear. Aparece en /flota inmediatamente.",
  },
  adminPeriodos: {
    titulo: "Períodos",
    que_es: "Gestión del calendario: cada mes que se reportan datos es un 'período' con id propio. Los KPIs y alertas se asocian a un período específico.",
    como_funciona: "Antes de cargar KPIs de Mayo 2025, debes crear ese período. Cerrar un período lo marca como inmutable (los datos del mes ya no se editan).",
    ejemplo: "El 1 de mayo: vas a /admin/periodos → Año=2025, Mes=Mayo → Crear. Luego en /admin/kpis ya puedes seleccionar 'Mayo 2025' y empezar a cargar.",
    meta: "Restricción: solo un período por (año, mes). Intentar duplicarlo da error.",
  },
  adminAlertas: {
    titulo: "Regenerar Alertas",
    que_es: "Recalcula la tabla de alertas de un período comparando los KPIs actuales contra los umbrales vigentes. Borra las alertas anteriores del período y reinserta.",
    como_funciona: "Cada KPI fuera de umbral genera una alerta. Si el equipo está en paroTotal, se genera una alerta de tipo 'paro' en lugar de las KPI por KPI.",
    ejemplo: "Cambias los umbrales de DFM (verde 90%, ámbar 80%) en la tabla umbral_kpi → /admin/alertas → seleccionas el período → Regenerar. Las alertas se recalculan con los nuevos límites.",
    meta: "El botón también está disponible en /admin/kpis para uso conjunto.",
  },
  adminImportarCsv: {
    titulo: "Importar KPIs desde CSV",
    que_es: "Carga masiva de KPIs y distribución ASARCO desde un archivo CSV. Permite migrar datos desde planillas Excel exportadas a CSV sin tener que escribir cada valor manualmente.",
    como_funciona: "El CSV debe tener 14 columnas: equipoId, dfm, tmef, tmpr, tiempoOperativo, reserva, horasAcumuladas, paroTotal, motivoParo, pctOperativo, pctReserva, pctDetProgramada, pctDetNoProg, pctPerdidaOp. Se valida antes de guardar.",
    ejemplo: "Exporta la planilla Excel del mes como CSV. Sube el archivo, revisa la previsualización y haz clic en Guardar. El sistema valida que los equipos existan y que ASARCO sume 100%.",
    meta: "Descarga la plantilla de ejemplo para ver el formato exacto requerido.",
  },
  adminUmbrales: {
    titulo: "Configurar Umbrales de KPI",
    que_es: "Editor visual para modificar los valores de referencia (verde/ámbar) de cada KPI. Estos umbrales determinan el color del semáforo y cuándo se genera una alerta.",
    como_funciona: "Cada KPI tiene un umbral verde (valor óptimo) y un umbral ámbar (advertencia). Los cambios se guardan con versionado: el historial de umbrales anteriores se conserva. Después de cambiar, es necesario regenerar alertas.",
    ejemplo: "Si cambias el DFM verde de 85% a 90%, los equipos con DFM entre 85% y 90% pasarán de verde a ámbar en el próximo recálculo de alertas.",
    meta: "Los umbrales aplican a toda la flota por igual. No se pueden configurar por equipo individual.",
  },
  apdGuardar: {
    titulo: "Guardar Análisis APD en BD",
    que_es: "Persiste el CSV procesado en la base de datos. Crea un registro en analisis_apd (cabecera) y un registro por muestra en muestra_apd.",
    como_funciona: "Selecciona el período al que pertenece este análisis y la fecha en que se tomaron las muestras. Si algún equipo del CSV no existe en BD, el guardado falla con la lista de IDs faltantes.",
    ejemplo: "Subes APD_Abril2025.csv con 120 muestras → eliges período 'Abril 2025' y fecha 2025-04-15 → Guardar. La BD persiste 1 análisis + 120 muestras, y el histórico se actualiza.",
  },
  apdHistorico: {
    titulo: "Análisis APD Cargados",
    que_es: "Lista de todos los análisis ya persistidos en la BD. Permite ver cuántas muestras tiene cada uno, cuántas en rojo/ámbar y eliminarlos.",
    como_funciona: "Cada fila es un CSV cargado. Borrar un análisis elimina también todas sus muestras (cascada FK). El recuento por estado ayuda a detectar análisis con muchos parámetros fuera de rango.",
    ejemplo: "Si ves un análisis con 80 muestras y 35 en rojo, ese mes hubo problemas serios de desgaste y vale la pena revisar el detalle.",
  },
  apdEstado: {
    titulo: "Estado del Parámetro",
    que_es: "Resultado de comparar el valor medido contra los límites mínimo y máximo del parámetro.",
    como_funciona: "Verde: dentro del rango. Ámbar: dentro pero al 90% del límite (alerta temprana). Rojo: fuera del rango (intervención inmediata).",
    ejemplo: "Fe motor con LimMax=30. Valor 18 = verde (lejos del tope). Valor 28 = ámbar (cerca, vigilar). Valor 45 = rojo (desgaste acelerado).",
  },

  // ─── Registro diario y cálculo de KPIs ────────────────────────────────────
  registroDiario: {
    titulo: "Registro Diario de Horas",
    que_es: "Formulario para ingresar las horas diarias de cada equipo distribuidas en las 5 categorías ASARCO: Operación, Reserva, Detención Programada, Detención No Programada y Pérdida Operacional.",
    como_funciona: "Se selecciona una fecha y se llenan las horas por equipo. Las 5 columnas deben sumar como máximo 24 horas. Los registros se guardan con upsert: si ya existe uno para ese equipo y fecha, se sobrescribe.",
    ejemplo: "CH-01 el día 15/04: Operación 8h, Reserva 1.5h, Det. Prog. 2h, Det. No Prog. 0.5h, Pérdida 0h = 12h total del turno.",
    meta: "Este es el dato crudo que alimenta el cálculo automático de KPIs. Sin registros diarios, no hay cálculo posible.",
  },
  registroFallas: {
    titulo: "Registro de Fallas",
    que_es: "Lista de eventos de falla registrados para cada equipo. Cada falla incluye fecha, descripción, componente afectado y horas de reparación.",
    como_funciona: "Las fallas alimentan directamente dos KPIs: TMEF (más fallas = menor TMEF) y TMPR (más horas de reparación por falla = mayor TMPR).",
    ejemplo: "CH-01 el 15/04: 'Fuga bomba hidráulica principal', componente 'Sistema Hidráulico', 4.5h de reparación. Si tuvo 2 fallas en 200h operadas, TMEF = 100h.",
    meta: "Registra todas las fallas aunque sean menores. Cuanto más completo el registro, más preciso el cálculo de TMEF y TMPR.",
  },
  calcularKpis: {
    titulo: "Calcular KPIs desde Datos Crudos",
    que_es: "Toma los registros diarios de horas y los eventos de falla del período seleccionado, y calcula automáticamente los 5 KPIs y la distribución ASARCO.",
    como_funciona: "Fórmulas: DFM = (Operación + Reserva) / Total × 100. TMEF = Horas operadas / Nº fallas. TMPR = Horas reparación / Nº fallas. T.Op = Operación / Total × 100. Reserva = Reserva / Total × 100. ASARCO = cada categoría / Total × 100.",
    ejemplo: "Período Mayo 2025: se leen 28 equipos × 30 días de registros + las fallas del mes. Se calculan los KPIs, se muestra preview, y al confirmar se guardan en la BD y se regeneran alertas.",
    meta: "Los KPIs calculados se escriben en las mismas tablas que la carga manual. El dashboard no distingue entre datos manuales y calculados.",
  },

  // ─── Tipos de flota ───────────────────────────────────────────────────────
  flotaTipo785D: {
    titulo: "Flota CAT 785D — Camión de Acarreo Grande",
    que_es: "Camión minero de gran tonelaje fabricado por Caterpillar. Capacidad de carga de ~150 toneladas. Es la columna vertebral del acarreo de mineral y estéril.",
    como_funciona: "Transporta material desde el frente de carguío hasta la planta o el botadero. Su disponibilidad impacta directamente la producción diaria.",
    ejemplo: "Una flota de 8 camiones 785D que opera al 85% de DFM mueve ~9.600 toneladas por turno de 12 horas.",
    meta: "Costo estimado de paro: USD $1.250/hora",
  },
  flotaTipo777F: {
    titulo: "Flota CAT 777F — Camión de Acarreo Mediano",
    que_es: "Camión minero de Caterpillar con capacidad de ~100 toneladas. Más ágil que el 785D, se usa en rutas más cortas o con pendientes mayores.",
    como_funciona: "Complementa la flota principal de acarreo. Su menor tamaño permite acceder a frentes donde el 785D no maniobra bien.",
    ejemplo: "10 camiones 777F en la faena. Cuando uno falla, se redistribuyen las rutas entre los demás.",
    meta: "Costo estimado de paro: USD $950/hora",
  },
  flotaTipo992: {
    titulo: "Flota CAT 992 — Cargador Frontal",
    que_es: "Cargador de ruedas de gran capacidad fabricado por Caterpillar. Equipo de carguío que llena los camiones de acarreo con mineral o estéril.",
    como_funciona: "Es un equipo crítico en la cadena: si el cargador falla, los camiones quedan sin material que transportar. Un cargador sirve a 3–5 camiones.",
    ejemplo: "6 cargadores 992 en la flota. Si 2 están en paro, los camiones asignados a esos frentes quedan en reserva.",
    meta: "Costo estimado de paro: USD $1.100/hora",
  },
  flotaTipoPC2000: {
    titulo: "Flota Komatsu PC-2000 — Excavadora Hidráulica",
    que_es: "Excavadora hidráulica de gran tamaño fabricada por Komatsu. Equipo de carguío primario que excava y carga camiones en los frentes de trabajo.",
    como_funciona: "La PC-2000 es el equipo más crítico por productividad: una falla detiene toda la operación del frente asignado. Sus componentes hidráulicos son los más costosos de reparar.",
    ejemplo: "4 excavadoras PC-2000. Una excavadora parada por falla hidráulica deja 3–4 camiones sin cargar.",
    meta: "Costo estimado de paro: USD $1.400/hora",
  },

  // ─── Términos de explorador y registros ──────────────────────────────────
  turno: {
    titulo: "Turno de Operación",
    que_es: "Jornada de trabajo del equipo. La mina opera 24/7 en dos turnos de 12 horas: turno día (06:00–18:00) y turno noche (18:00–06:00).",
    como_funciona: "Cada registro diario se asocia a un turno. Si se registra 'completo', las 24 horas se contabilizan sin distinción de turno.",
    ejemplo: "CH-01 en turno día: 8h operación, 2h reserva, 1h det. programada, 0.5h det. no programada, 0.5h pérdida = 12h total.",
  },
  componenteFalla: {
    titulo: "Componente Afectado",
    que_es: "Sistema o parte principal del equipo donde ocurrió la falla. Permite agrupar fallas por componente para detectar patrones de desgaste.",
    como_funciona: "Los componentes estándar son: Motor, Transmisión, Sistema Hidráulico, Sistema Eléctrico, Chasis/Estructura, Neumáticos, Frenos, Dirección y Otro.",
    ejemplo: "Si el 60% de las fallas son en 'Sistema Hidráulico', indica un problema sistémico que requiere mantención preventiva focalizada.",
  },
  hrsReparacion: {
    titulo: "Horas de Reparación",
    que_es: "Tiempo total que tomó reparar la falla, desde que el equipo se detuvo hasta que volvió a operar. Se expresa en horas decimales.",
    como_funciona: "Este valor alimenta directamente el cálculo de TMPR. A mayor total de horas de reparación dividido por el número de fallas, peor es el TMPR.",
    ejemplo: "4.5 h → La reparación tomó 4 horas y 30 minutos. El objetivo de TMPR es mantener cada reparación en ≤5 horas.",
    meta: "Objetivo TMPR: ≤ 5h promedio por reparación",
  },
  operativos: {
    titulo: "Equipos Operativos",
    que_es: "Equipos que tienen todos sus KPIs en estado verde (dentro del rango óptimo). Están operando sin problemas.",
    como_funciona: "Un equipo es 'operativo' cuando DFM ≥85%, TMEF ≥80h, TMPR ≤5h, T.Op. ≥80% y Reserva ≤8%.",
    ejemplo: "22 operativos de 28 = 79% de la flota está en óptimo estado. Objetivo: 100%.",
  },
  advertCriticos: {
    titulo: "En Advertencia o Críticos",
    que_es: "Equipos con al menos un KPI en estado ámbar (advertencia) o rojo (crítico). Operan pero requieren atención.",
    como_funciona: "Ámbar: algún KPI está en zona de advertencia. Rojo: algún KPI está bajo el umbral crítico. No incluye equipos en paro total.",
    ejemplo: "4 advert./críticos = 4 equipos necesitan revisión antes de convertirse en paros totales.",
  },
  compartimento: {
    titulo: "Compartimento del Equipo",
    que_es: "Sección interna del equipo donde se toma la muestra de aceite: Motor, Transmisión, Sistema Hidráulico, Diferencial, Mandos Finales, etc.",
    como_funciona: "Cada compartimento tiene sus propios límites de desgaste. El aceite del motor tiene límites diferentes al aceite del diferencial.",
    ejemplo: "Compartimento 'Motor': se analizan Fe (hierro), Cu (cobre), Al (aluminio), Si (sílice), Na (sodio) para detectar desgaste interno.",
  },
  ppm: {
    titulo: "ppm — Partes por Millón",
    que_es: "Unidad de medida de concentración utilizada en análisis de aceites. Indica cuántas partes de un elemento hay por cada millón de partes de aceite.",
    como_funciona: "Cuanto mayor sea el ppm de metales de desgaste (Fe, Cu, Al), más desgaste interno tiene el componente. Los fabricantes definen límites máximos.",
    ejemplo: "Fe = 45 ppm en el motor: hay 45 partes de hierro por cada millón de partes de aceite. Si el límite máximo es 30 ppm, hay desgaste excesivo.",
  },
  invertido: {
    titulo: "KPI Invertido (Menor es Mejor)",
    que_es: "Un KPI donde el valor más bajo es el deseado. El semáforo se calcula al revés: verde cuando el valor es MENOR al umbral, rojo cuando es MAYOR.",
    como_funciona: "TMPR y Reserva son invertidos. TMPR verde ≤5h (poco tiempo de reparación = bueno). Reserva verde ≤8% (poca ociosidad = bueno).",
    ejemplo: "TMPR 3h = verde (excelente, reparaciones rápidas). TMPR 18h = rojo (las reparaciones toman demasiado tiempo).",
  },
  analisisComponente: {
    titulo: "Análisis por Componente",
    que_es: "Tabla de estadísticas que agrupa todas las fallas por el componente afectado. Permite identificar los componentes más problemáticos.",
    como_funciona: "Muestra: total de fallas, horas de reparación acumuladas, promedio de horas por falla (TMPR por componente), equipos y flotas afectados.",
    ejemplo: "Si 'Sistema Hidráulico' tiene 12 fallas y 54h de reparación, el promedio es 4.5h/falla. Si afecta a 6 equipos distintos, es un problema sistémico.",
  },
  tipoFlota: {
    titulo: "Tipo de Flota",
    que_es: "Categoría del equipo según su modelo y función operacional: 785D y 777F son camiones de acarreo, 992 es cargador y PC2000 es excavadora.",
    ejemplo: "El tipo de flota determina la función del equipo en la cadena productiva y el costo de parada por hora.",
  },
  modelo: {
    titulo: "Modelo del Equipo",
    que_es: "Designación comercial del fabricante (Caterpillar o Komatsu). Identifica las especificaciones técnicas y el programa de mantención aplicable.",
    ejemplo: "CAT 785D, CAT 777F, CAT 992K, Komatsu PC-2000. El modelo determina qué repuestos, aceites y programas de mantención aplican.",
  },
  metaOperativo: {
    titulo: "Meta de Operatividad: 80%",
    que_es: "Línea de referencia que indica el objetivo mínimo de porcentaje operativo según ASARCO. Una flota eficiente debe mantener al menos 80% de tiempo productivo.",
    como_funciona: "La línea punteada en los gráficos marca este objetivo. Cuando la barra de operativo cae bajo esta línea, indica ineficiencia.",
    ejemplo: "Flota con 70% operativo: está 10 puntos bajo la meta. Hay que investigar si el problema es exceso de reserva, detenciones o pérdidas.",
    meta: "≥ 80% del tiempo total",
  },
  reporteInforme: {
    titulo: "Informe del Mes",
    que_es: "Vista de informe mensual con los KPIs de toda la flota, resumen por tipo de equipo, equipos críticos y tendencias. Exportable como PDF.",
    ejemplo: "Selecciona un período, revisa los indicadores y haz clic en 'Imprimir / PDF' para generar el documento mensual de mantención.",
  },
  reporteComparar: {
    titulo: "Comparar Períodos",
    que_es: "Vista que permite seleccionar dos o más períodos y comparar la evolución de los KPIs lado a lado. Útil para medir progreso entre meses.",
    ejemplo: "Compara Marzo vs Abril para ver si las mejoras en mantención preventiva se reflejaron en un mejor DFM y menor TMPR.",
  },
  reporteIntegrar: {
    titulo: "Integrar Datos",
    que_es: "Herramienta para consolidar datos de múltiples fuentes: registros diarios, fallas, análisis de aceites y KPIs calculados en una vista unificada.",
    ejemplo: "Selecciona un rango de períodos y exporta todos los datos integrados a Excel para análisis externo o presentaciones.",
  },
  explorerKpis: {
    titulo: "Tabla de KPIs",
    que_es: "Vista tipo planilla de todos los KPIs mensuales por equipo. Incluye DFM, TMEF, TMPR, Tiempo Operativo, Reserva, horas acumuladas y distribución ASARCO.",
    ejemplo: "Filtra por período 'Abril 2025' y flota '785D' para ver solo los camiones grandes de ese mes. Ordena por DFM para encontrar los peores.",
  },
  explorerRegistros: {
    titulo: "Tabla de Registros Diarios",
    que_es: "Todos los registros diarios de horas por equipo en formato planilla. Muestra las 5 categorías ASARCO hora por hora.",
    ejemplo: "Filtra por flota '992' para ver los registros de los cargadores. Ordena por Det. No Prog. para identificar los días con más fallas.",
  },
  explorerFallas: {
    titulo: "Tabla de Fallas",
    que_es: "Todos los eventos de falla registrados. Muestra equipo, fecha, componente afectado, descripción, horas de reparación y si fue resuelta.",
    ejemplo: "Filtra por componente 'Motor' para ver todas las fallas de motor. Exporta a Excel para análisis detallado.",
  },
  explorerTurnos: {
    titulo: "Comparativa por Turno",
    que_es: "Comparación entre turno día y turno noche: operatividad, reserva, detenciones y pérdidas. Identifica si un turno tiene peor rendimiento.",
    ejemplo: "Si el turno noche tiene 15% más detenciones no programadas, puede indicar falta de iluminación o personal de mantención insuficiente.",
  },
};
